import {
  AnswerType,
  QuestionGradingType,
  QuestionResponseType,
  QuizQuestionType,
} from '../types/QuizState';

export default function gradeQuiz(
  questions: QuizQuestionType[],
  allAnswers: AnswerType[],
) {
  let correct = 0;
  let gradedQuestions = 0;

  questions.forEach((question, index) => {
    if (question.typeAttributes.grading === QuestionGradingType.None) return;
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

function gradeQuestion(question: QuizQuestionType, answer: AnswerType) {
  if (question.type === QuestionResponseType.MultipleChoice) {
    return gradeOption(answer as number, question);
  } else if (question.type === QuestionResponseType.SelectAll) {
    const answers = answer as number[];
    let isCorrect = true;
    answers.forEach((answer) => {
      if (!gradeOption(answer, question)) {
        isCorrect = false;
      }
    });

    return isCorrect;
  } else if (
    question.type === QuestionResponseType.FreeResponse ||
    question.type === QuestionResponseType.Number ||
    question.type === QuestionResponseType.TrueFalse
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

function gradeOption(optionIndex: number, question: QuizQuestionType) {
  if (
    question.typeAttributes.options &&
    question.typeAttributes.options[optionIndex].correct
  ) {
    return true;
  }

  return false;
}

export function getReviewIndication(
  question: QuizQuestionType,
  answer: AnswerType,
  optionIndex?: number,
) {
  let isCorrect = false;

  if (question.typeAttributes.grading === QuestionGradingType.None) return '';

  if (optionIndex !== undefined) {
    if (question.type === QuestionResponseType.SelectAll) {
      const answers = answer as number[];
      if (!answers.includes(optionIndex)) {
        return '';
      }
    } else if (question.type === QuestionResponseType.MultipleChoice) {
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
