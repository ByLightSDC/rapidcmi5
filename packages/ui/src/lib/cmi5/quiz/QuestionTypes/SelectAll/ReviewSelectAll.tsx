import useQuizGrader from '../../hooks/useQuizGrader';
import { MarkdownConvertorQuiz } from '../../../markdown/MarkdownConvertor';
import { ReviewProps } from '@rapid-cmi5/cmi5-build-common';

export default function ReviewSelectAll(props: ReviewProps) {
  const { question, answer } = props;
  const { getReviewIndication } = useQuizGrader();
  return (
    <div>
      {question.typeAttributes.options?.map((option, optionIndex) => (
        <MarkdownConvertorQuiz
          markdown={option.text}
          className={`option-rangeos bg-blue-800 ${getReviewIndication(
            question,
            answer,
            optionIndex,
          )}`}
        />
      ))}
    </div>
  );
}
