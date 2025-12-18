/*RC5 removal*/

import {
  QuizContent,
  QuizCompletionEnum,
  AuContextProps,
  MoveOnCriteriaEnum,
} from '@rapid-cmi5/types/cmi5';
import { parseQuizdownFile } from '@rapid-cmi5/cmi5-build/common';
import { AuQuiz } from '../quiz/Quiz';

export default function EmbeddedQuiz({
  children,
  quizNumber,
  auProps,
}: {
  children: any;
  quizNumber: number;
  auProps: AuContextProps;
}) {
  const quizdown = parseQuizdownFile(
    Array.isArray(children) ? children[0] : children,
  );

  let passingScore = 0;
  let slideNumber = (auProps?.activeTab || 0 + 1).toString();
  let cmi5QuizId = `slide-${slideNumber}/quiz-${quizNumber}`;
  let quizTitle = `Quiz ${quizNumber}`;

  const quizContent: QuizContent = {
    title: quizTitle,
    cmi5QuizId: cmi5QuizId,
    questions: quizdown.questions,
    completionRequired: QuizCompletionEnum.Attempted,
    moveOnCriteria: MoveOnCriteriaEnum.Completed,
    passingScore: passingScore,
    metadata: quizdown.metadata,
  };

  const quizProps: AuContextProps = { ...auProps };
  // This embedded quiz should not change progress of au
  quizProps.setProgress = () => {};

  return <AuQuiz auProps={quizProps} content={quizContent} />;
}
