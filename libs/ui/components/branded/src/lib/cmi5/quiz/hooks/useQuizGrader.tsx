import {
  AnswerType,
  QuestionGrading,
  QuestionResponse,
  QuizQuestion,
} from '@rapid-cmi5/types/cmi5';
import { useState } from 'react';

export default function useQuizGrader() {
  const [grades, setGrades] = useState<boolean[]>([]);

  const getGrade = (index: number) => {
    return grades[index];
  };

  const gradeQuiz = (questions: QuizQuestion[], allAnswers: AnswerType[]) => {
    let correct = 0;
    let gradedQuestions = 0;
    const theGrades: boolean[] = [];

    questions.forEach((question, index) => {
      if (question.typeAttributes.grading === QuestionGrading.None) return;
      gradedQuestions++;
      const isCorrect = gradeQuestion(question, allAnswers[index]);
      if (isCorrect) correct++;
      theGrades.push(isCorrect);
    });

    let score = 100;
    if (gradedQuestions !== 0) {
      score = Math.round((correct / gradedQuestions) * 100);
    }
    setGrades(theGrades);
    return score;
  };

  function gradeQuestion(question: QuizQuestion, answer: AnswerType) {
    if (question.type === QuestionResponse.MultipleChoice) {
      return gradeOption(answer as number, question);
    } else if (question.type === QuestionResponse.SelectAll) {
      const answers = answer as number[];
      let isCorrect = true;
      answers.forEach((answer) => {
        if (!gradeOption(answer, question)) {
          isCorrect = false;
        }
      });

      return isCorrect;
    } else if (
      question.type === QuestionResponse.FreeResponse ||
      question.type === QuestionResponse.Number ||
      question.type === QuestionResponse.TrueFalse
    ) {
      if (
        (question.typeAttributes.correctAnswer as string).toLowerCase() !==
        (answer as string).toLowerCase()
      ) {
        return false;
      }
    } else if (question.type === QuestionResponse.Matching) {
      const answers = answer as string[];

      let correct = 0;
      const pairs = question.typeAttributes?.matching || [];
      pairs.forEach((p, index) => {
        if (answers[index] === p.response) correct++;
      });
      return correct === pairs.length;
    }
    return true;
  }

  function gradeOption(optionIndex: number, question: QuizQuestion) {
    if (
      question.typeAttributes.options &&
      question.typeAttributes.options.length > optionIndex &&
      question.typeAttributes.options[optionIndex].correct
    ) {
      return true;
    }

    return false;
  }

  const getReviewIndication = (
    question: QuizQuestion,
    answer: AnswerType,
    optionIndex?: number,
  ) => {
    let isCorrect = false;

    if (question.typeAttributes.grading === QuestionGrading.None) return '';

    if (optionIndex !== undefined) {
      if (question.type === QuestionResponse.SelectAll) {
        const answers = answer as number[];
        if (!answers.includes(optionIndex)) {
          return '';
        }
      } else if (question.type === QuestionResponse.MultipleChoice) {
        if ((answer as number) !== optionIndex) {
          return '';
        }
      } else if (question.type === QuestionResponse.Matching) {
        const answers = answer as string[];
        let correct = 0;
        const pairs = question.typeAttributes?.matching || [];
        pairs.forEach((p, index) => {
          if (answers[index] === p.response) correct++;
        });
        if (correct !== pairs.length) {
          return '';
        }
      }

      isCorrect = gradeOption(optionIndex, question);
    } else {
      isCorrect = gradeQuestion(question, answer);
    }

    if (isCorrect) {
      return 'bg-green-800';
    }
    return 'bg-red-800';
  };

  return { gradeQuiz, getGrade, getReviewIndication };
}
