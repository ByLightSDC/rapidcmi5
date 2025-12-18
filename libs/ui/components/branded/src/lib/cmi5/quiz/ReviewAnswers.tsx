import {
  AnswerType,
  QuestionResponse,
  QuizContent,
} from '@rapid-cmi5/types/cmi5';

import ReviewMultipleChoice from './QuestionTypes/MultipleChoice/ReviewMultipleChoice';
import ReviewSelectAll from './QuestionTypes/SelectAll/ReviewSelectAll';
import ReviewFreeResponse from './QuestionTypes/FreeResponse/ReviewFreeResponse';
import useQuizGrader from './hooks/useQuizGrader';
import { MarkdownConvertorQuiz } from '../markdown/MarkdownConvertor';

export function ReviewAnswers({
  quiz,
  allAnswers,
}: {
  quiz: QuizContent;
  allAnswers: AnswerType[];
}) {
  const { getReviewIndication } = useQuizGrader();

  return (
    <>
      {quiz.questions.map((question, qindex) => (
        <>
          <p>
            {qindex + 1} / {quiz.questions.length}
          </p>

          <MarkdownConvertorQuiz markdown={question.question} />

          {question.type === QuestionResponse.MultipleChoice && (
            <ReviewMultipleChoice
              question={question}
              answer={allAnswers[qindex]}
            />
          )}
          {question.type === QuestionResponse.SelectAll && (
            <ReviewSelectAll question={question} answer={allAnswers[qindex]} />
          )}

          {question.type === QuestionResponse.FreeResponse && (
            <ReviewFreeResponse
              question={question}
              answer={allAnswers[qindex]}
            />
          )}
          {question.type === QuestionResponse.Number && (
            <div>
              <p>You answered: </p>

              <div
                className={`bg-blue-800 px-4 py-1 rounded-xl ${getReviewIndication(
                  question,
                  allAnswers[qindex] as number,
                )}`}
              >
                <p>{allAnswers[qindex]}</p>
              </div>
              <p>Correct Answer: </p>
              <div className={`bg-blue-800 px-4 py-1 rounded-xl`}>
                <p>{question.typeAttributes.correctAnswer}</p>
              </div>
            </div>
          )}

          {question.type === QuestionResponse.TrueFalse && (
            <div>
              <p>You answered: </p>

              <div
                className={`bg-blue-800 px-4 py-1 rounded-xl ${getReviewIndication(
                  question,
                  allAnswers[qindex] as number,
                )}`}
              >
                <p>{allAnswers[qindex]}</p>
              </div>
              <p>Correct Answer: </p>
              <div className={`bg-blue-800 px-4 py-1 rounded-xl`}>
                <p>{question.typeAttributes.correctAnswer}</p>
              </div>
            </div>
          )}
        </>
      ))}
    </>
  );
}

export default ReviewAnswers;
