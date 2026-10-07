import type { Root, Code, RootContent } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { directiveToMarkdown } from 'mdast-util-directive';
import { parse } from 'yaml';
import {
  QuizQuestion,
  QuizOption,
  QuestionResponse,
  QuestionGrading,
  BasicResponse,
  QuizCompletionEnum,
  QuizContent,
} from '../types/activities';

export function parseQuizdownFile(quizdownText: string): {
  metadata: string;
  questions: QuizQuestion[];
} {
  // Split metadata and questions
  const parts = quizdownText?.split('---');

  const metadataRaw = parts[1] ?? '';
  const questionsRawList = parts.slice(2);

  const metadata = metadataRaw;

  // Parse questions
  const questions: QuizQuestion[] = [];
  questionsRawList.forEach((questionsRaw) => {
    // We are testing if its one of our question blocks

    let yamlQuestion;
    try {
      yamlQuestion = parse(questionsRaw);
    } catch {
      yamlQuestion = null;
    }

    try {
      if (yamlQuestion !== '</div>') {
        if (yamlQuestion && 'questionObject' in yamlQuestion) {
          questions.push(yamlQuestion['questionObject']);
        }
      }
    } catch (e) {
      console.error('Error parsing quiz yaml ', e);
    }

    const questionBlocks = questionsRaw.split(/###/).slice(1);

    questionBlocks.forEach((block) => {
      const questionContent = block.trim();

      // Extract question text
      const questionTextMatch = questionContent.match(/(.*?)(?:\n- \[|$)/s);
      const questionText = questionTextMatch
        ? questionTextMatch[1].trim().split('\n')[0]
        : '';

      const answersRaw = [
        ...questionContent.matchAll(/^\s*-\s\[(x| )\]\s(.+)/gim),
      ];
      const answers: QuizOption[] = answersRaw.map(([_, x, ans]) => ({
        text: ans.trim(),
        correct: x.toLowerCase() === 'x',
      }));

      // Determine question type
      const numberCorrect = answers.filter((ans) => ans.correct).length;
      const qtype: QuestionResponse =
        numberCorrect > 1
          ? QuestionResponse.SelectAll
          : QuestionResponse.MultipleChoice;
      const question: QuizQuestion = {
        question: questionText,
        type: qtype,
        typeAttributes: {
          options: answers,
          grading: QuestionGrading.Exact,
          correctAnswer: '',
        } as BasicResponse,
        cmi5QuestionId: questions.length.toString(),
      };
      questions.push(question);
    });
  });

  return { metadata, questions };
}

export function collectQuizDown(md: string): string {
  const quizdownRegex = /<div class="quizdown">([\s\S]*?)<\/div>/g;

  let match: RegExpExecArray | null;
  let output = md;
  const replacements: { original: string; transformed: string }[] = [];

  while ((match = quizdownRegex.exec(md)) !== null) {
    const fullMatch = match[0]; // The entire <div>...</div>
    const quizContent = match[1]; // Just the content inside

    const transformedContent = parseQuizdownFile(quizContent.trim());
    const rc5Quiz = {
      cmi5QuizId: 'COL',
      completionRequired: QuizCompletionEnum.Passed,
      passingScore: 80,
      // Did not realize JS did not have a shuffle function for arrays
      questions: transformedContent.questions.sort(() => Math.random() - 0.5),
      title: 'Check on Learning',
    } as QuizContent;

    const rc5QuizJson = JSON.stringify(rc5Quiz, null, 2);

    // This is the AST node for your quiz directive
    const quizDirective: RootContent = {
      type: 'containerDirective',
      name: 'quiz',
      attributes: {},
      children: [
        {
          type: 'code',
          lang: 'json',
          value: rc5QuizJson,
        } as Code,
      ],
    };

    const root: Root = {
      type: 'root',
      children: [quizDirective],
    };

    const markdown = toMarkdown(root, { extensions: [directiveToMarkdown()] });

    replacements.push({
      original: fullMatch,
      transformed: markdown,
    });
  }

  // Perform all replacements
  for (const { original, transformed } of replacements) {
    output = output.replace(original, transformed);
  }

  return output;
}
