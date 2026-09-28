import { useCallback, useState } from 'react';
import {
  QuestionGrading,
  QuestionResponse,
} from '@rapid-cmi5/cmi5-build-common';
import type { AnswerType, QuizQuestion } from '@rapid-cmi5/cmi5-build-common';

const CORRECT_CLASS = 'bg-green-800';
const INCORRECT_CLASS = 'bg-red-800';

export type QuizGrade = {
  score: number;
  grades: boolean[];
};

function optionIsCorrect(question: QuizQuestion, index: number): boolean {
  return question.typeAttributes.options?.[index]?.correct === true;
}

function gradeChoice(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  if (answer === null || answer === undefined || Array.isArray(answer)) {
    return false;
  }

  const index = Number(answer);
  return Number.isInteger(index) && optionIsCorrect(question, index);
}

function gradeSelectAll(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  if (!Array.isArray(answer) || !question.typeAttributes.options) return false;

  const selected = new Set(answer.map(Number));
  const correct = new Set(
    question.typeAttributes.options.flatMap((option, index) =>
      option.correct ? [index] : [],
    ),
  );

  return (
    selected.size === correct.size &&
    [...selected].every((index) => correct.has(index))
  );
}

function gradeNumber(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  if (answer === null || answer === undefined || Array.isArray(answer)) {
    return false;
  }

  const answerText = String(answer).trim();
  const correctText = String(question.typeAttributes.correctAnswer).trim();
  if (!answerText || !correctText) return false;

  const answerNumber = Number(answerText);
  const correctNumber = Number(correctText);
  return (
    Number.isFinite(answerNumber) &&
    Number.isFinite(correctNumber) &&
    answerNumber === correctNumber
  );
}

function gradeText(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  if (answer === null || answer === undefined || Array.isArray(answer)) {
    return false;
  }

  return (
    String(answer).trim().toLowerCase() ===
    String(question.typeAttributes.correctAnswer).trim().toLowerCase()
  );
}

function gradeMatching(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  if (!Array.isArray(answer)) return false;

  const pairs = question.typeAttributes.matching ?? [];
  return (
    pairs.length > 0 &&
    answer.length === pairs.length &&
    pairs.every((pair, index) => answer[index] === pair.response)
  );
}

export function gradeQuestion(
  question: QuizQuestion,
  answer: AnswerType | undefined,
): boolean {
  switch (question.type) {
    case QuestionResponse.MultipleChoice:
      return gradeChoice(question, answer);
    case QuestionResponse.SelectAll:
      return gradeSelectAll(question, answer);
    case QuestionResponse.Number:
      return gradeNumber(question, answer);
    case QuestionResponse.FreeResponse:
    case QuestionResponse.TrueFalse:
      return gradeText(question, answer);
    case QuestionResponse.Matching:
      return gradeMatching(question, answer);
    default:
      return false;
  }
}

export function calculateQuizGrade(
  questions: QuizQuestion[],
  answers: AnswerType[],
): QuizGrade {
  let correct = 0;
  let gradedCount = 0;

  const grades = questions.map((question, index) => {
    if (question.typeAttributes.grading === QuestionGrading.None) return true;

    gradedCount += 1;
    const isCorrect = gradeQuestion(question, answers[index]);
    if (isCorrect) correct += 1;
    return isCorrect;
  });

  return {
    grades,
    score: gradedCount === 0 ? 100 : Math.round((correct / gradedCount) * 100),
  };
}

export function getReviewIndication(
  question: QuizQuestion,
  answer: AnswerType,
  optionIndex?: number,
): string {
  if (question.typeAttributes.grading === QuestionGrading.None) return '';

  if (
    optionIndex !== undefined &&
    (question.type === QuestionResponse.MultipleChoice ||
      question.type === QuestionResponse.SelectAll)
  ) {
    const selected = Array.isArray(answer)
      ? answer.map(Number)
      : [Number(answer)];
    if (!selected.includes(optionIndex)) return '';
    return optionIsCorrect(question, optionIndex)
      ? CORRECT_CLASS
      : INCORRECT_CLASS;
  }

  return gradeQuestion(question, answer) ? CORRECT_CLASS : INCORRECT_CLASS;
}

export default function useQuizGrader() {
  const [grades, setGrades] = useState<boolean[]>([]);

  const getGrade = useCallback((index: number) => grades[index], [grades]);

  const gradeQuiz = useCallback(
    (questions: QuizQuestion[], answers: AnswerType[]) => {
      const result = calculateQuizGrade(questions, answers);
      setGrades(result.grades);
      return result.score;
    },
    [],
  );

  return { gradeQuiz, getGrade, getReviewIndication };
}
