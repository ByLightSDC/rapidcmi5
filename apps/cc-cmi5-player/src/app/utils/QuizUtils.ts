import {
  AnswerType,
  QuestionGrading,
  QuestionResponse,
  QuizQuestion,
} from '@rapid-cmi5/cmi5-build-common';

export default function gradeQuiz(
  questions: QuizQuestion[],
  allAnswers: AnswerType[],
) {
  let correct = 0;
  let gradedQuestions = 0;

  questions.forEach((question, index) => {
    if (question.typeAttributes.grading === QuestionGrading.None) return;
    gradedQuestions++;
    const isCorrect = gradeQuestion(question, allAnswers[index]);
    if (isCorrect) correct++;
  });

  let score = 100;
  if (gradedQuestions !== 0) {
    score = Math.round((correct / gradedQuestions) * 100);
  }

  return score;
}

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
  }
  return true;
}

function gradeOption(optionIndex: number, question: QuizQuestion) {
  if (
    question.typeAttributes.options &&
    question.typeAttributes.options[optionIndex].correct
  ) {
    return true;
  }

  return false;
}

export function getReviewIndication(
  question: QuizQuestion,
  answer: AnswerType,
  optionIndex?: number,
) {
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
    }

    isCorrect = gradeOption(optionIndex, question);
  } else {
    isCorrect = gradeQuestion(question, answer);
  }

  if (isCorrect) {
    return 'bg-green-800';
  }
  return 'bg-red-800';
}
