import { ReviewProps } from '@rangeos-nx/types/cmi5';
import useQuizGrader from '../../hooks/useQuizGrader';
import { MarkdownConvertorQuiz } from '../../../markdown/MarkdownConvertor';

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
