import {
  AnswerType,
  QuestionResponse,
  QuizQuestion,
} from '@rapid-cmi5/cmi5-build/common';

import FreeResponse from './QuestionTypes/FreeResponse/QuestionFreeResponse';
import QuestionMultipleChoice from './QuestionTypes/MultipleChoice/QuestionMultipleChoice';
import TrueFalse from './QuestionTypes/TrueFalse/TrueFalse';
import SelectAll from './QuestionTypes/SelectAll/QuestionSelectAll';
import Matching from './QuestionTypes/Matching/QuestionMatching';
import { Typography } from '@mui/material';
import { MarkdownConvertorQuiz } from '../markdown/MarkdownConvertor';

export default function AuQuizQuestion({
  question,
  currentQuestion,
  numQuestions,
  currentAnswer,
  handlePickAnswer,
  correctAnswer,
  isCorrect,
  isGraded,
}: {
  question: QuizQuestion;
  currentQuestion: number;
  currentAnswer: AnswerType;
  numQuestions: number;
  handlePickAnswer: (answer: number | string | string[]) => void;
  correctAnswer: AnswerType;
  isCorrect: boolean;
  isGraded: boolean;
}) {
  return (
    <div className="mx-auto">
      <Typography variant="h5" color="text.secondary">
        Q {currentQuestion + 1} / {numQuestions}
      </Typography>
      <Typography color="text.primary">
        <MarkdownConvertorQuiz markdown={question.question} />
      </Typography>
      <div
        className="flex flex-col space-y-4 mt-2"
        style={isGraded ? { marginLeft: '24px' } : {}} // to indent the check/X indicator
      >
        {(question.type === QuestionResponse.FreeResponse ||
          question.type === QuestionResponse.Number) && (
          <FreeResponse
            question={question}
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer as string}
            handlePickAnswer={handlePickAnswer}
            correctAnswer={correctAnswer as string}
            isCorrect={isCorrect}
            isGraded={isGraded}
          />
        )}

        {question.type === QuestionResponse.MultipleChoice && (
          <QuestionMultipleChoice
            question={question}
            currentQuestion={currentQuestion}
            currentAnswer={currentAnswer as number}
            handlePickAnswer={handlePickAnswer}
            correctAnswer={correctAnswer as string}
            isCorrect={isCorrect}
            isGraded={isGraded}
          />
        )}
        {question.type === QuestionResponse.TrueFalse && (
          <TrueFalse
            currentAnswer={currentAnswer as string}
            currentQuestion={currentQuestion}
            handlePickAnswer={handlePickAnswer}
            correctAnswer={correctAnswer as string}
            isCorrect={isCorrect}
            isGraded={isGraded}
          />
        )}
        {question.type === QuestionResponse.SelectAll && (
          <SelectAll
            question={question}
            currentQuestion={currentQuestion}
            currentAnswers={currentAnswer as number[]}
            handlePickAnswer={handlePickAnswer}
            isCorrect={isCorrect}
            isGraded={isGraded}
          />
        )}
        {question.type === QuestionResponse.Matching && (
          <Matching
            question={question}
            currentQuestion={currentQuestion}
            currentAnswers={currentAnswer as string[]}
            handlePickAnswer={handlePickAnswer}
            isCorrect={isCorrect}
            isGraded={isGraded}
          />
        )}
      </div>
    </div>
  );
}
