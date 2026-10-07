import {
  QuestionGrading,
  QuestionResponse,
  QuizCompletionEnum,
  QuizContentSchemaZod,
  type QuizQuestion,
} from '../types/activities';
import { renderQuizDirective } from './quizdown';

const quizStart = /<!--\s*rapid-cmi5:quiz\s+([\s\S]*?)\s*-->/g;
const quizEnd = /<!--\s*rapid-cmi5:quiz:end\s*-->/g;
const questionMarker = /<!--\s*rapid-cmi5:question\s+([\s\S]*?)\s*-->/g;

function attributes(source: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of source.matchAll(
    /([a-z][a-z-]*)=(?:"([^"]*)"|([^\s]+))/g,
  )) {
    result[match[1]] = match[2] ?? match[3];
  }
  return result;
}

function parseQuestion(
  marker: string,
  body: string,
  slideName: string,
): QuizQuestion {
  const meta = attributes(marker);
  const prompt = /^\s*\d+\.\s+(.+?)\s*$/m
    .exec(body)?.[1]
    ?.replace(/^\*\*|\*\*$/g, '')
    .trim();
  const options = [...body.matchAll(/^\s+([A-Z])\.\s+(.+?)\s*$/gm)].map(
    (match) => ({
      letter: match[1],
      text: match[2].trim(),
      correct: match[1] === meta['correct'],
    }),
  );
  if (!meta['id'] || !prompt || options.length < 2 || !meta['correct']) {
    throw new Error(`Invalid rapid-cmi5 quiz question in ${slideName}`);
  }
  const answer = options.find((option) => option.correct);
  if (!answer || options.filter((option) => option.correct).length !== 1) {
    throw new Error(
      `Question ${meta['id']} has no matching answer in ${slideName}`,
    );
  }
  return {
    cmi5QuestionId: meta['id'],
    question: prompt,
    type: QuestionResponse.MultipleChoice,
    typeAttributes: {
      grading: QuestionGrading.Exact,
      correctAnswer: answer.text,
      options: options.map(({ text, correct }) => ({ text, correct })),
    },
  };
}

export function extractMarkedQuizzes(content: string, slideName: string) {
  const replacements: Array<{ placeholder: string; directive: string }> = [];
  let markdown = '';
  let cursor = 0;

  for (const start of content.matchAll(quizStart)) {
    const startIndex = start.index;
    if (startIndex < cursor) continue;
    quizEnd.lastIndex = startIndex + start[0].length;
    const end = quizEnd.exec(content);
    if (!end) throw new Error(`Missing rapid-cmi5:quiz:end in ${slideName}`);

    const meta = attributes(start[1]);
    const passingScore = Number(meta['passing-score']);
    if (
      !meta['id'] ||
      !meta['title'] ||
      !Number.isFinite(passingScore) ||
      passingScore < 0 ||
      passingScore > 100
    ) {
      throw new Error(`Invalid rapid-cmi5 quiz metadata in ${slideName}`);
    }

    const quizBody = content.slice(startIndex + start[0].length, end.index);
    const markers = [...quizBody.matchAll(questionMarker)];
    if (!markers.length) {
      throw new Error(
        `Quiz ${meta['id']} has no marked questions in ${slideName}`,
      );
    }
    const questions = markers.map((marker, index) =>
      parseQuestion(
        marker[1],
        quizBody.slice(
          marker.index + marker[0].length,
          markers[index + 1]?.index ?? quizBody.length,
        ),
        slideName,
      ),
    );
    if (
      new Set(questions.map((question) => question.cmi5QuestionId)).size !==
      questions.length
    ) {
      throw new Error(
        `Quiz ${meta['id']} has duplicate question IDs in ${slideName}`,
      );
    }

    const quiz = QuizContentSchemaZod.parse({
      cmi5QuizId: meta['id'],
      title: meta['title'],
      passingScore,
      completionRequired: QuizCompletionEnum.Passed,
      questions,
    });
    const placeholder = `RC5QUIZPLACEHOLDER${replacements.length}RC5`;
    if (content.includes(placeholder)) {
      throw new Error(`Quiz placeholder collision in ${slideName}`);
    }
    replacements.push({ placeholder, directive: renderQuizDirective(quiz) });
    markdown += content.slice(cursor, startIndex) + `\n${placeholder}\n`;
    cursor = end.index + end[0].length;
  }
  markdown += content.slice(cursor);
  return { markdown, replacements };
}
