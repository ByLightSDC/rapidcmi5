import { ReviewProps } from '@rapid-cmi5/cmi5-build/common';
import useQuizGrader from '../../hooks/useQuizGrader';
import { MarkdownConvertorQuiz } from '../../../markdown/MarkdownConvertor';

export default function ReviewMultipleChoice(props: ReviewProps) {
  const { question, answer } = props;
  const { getReviewIndication } = useQuizGrader();
  return (
    <div>
      {question.typeAttributes.options?.map((option, optionIndex) => (
        <MarkdownConvertorQuiz
          markdown={option.text}
          className={`bg-blue-800 option-rangeos ${getReviewIndication(
            question,
            answer,
            optionIndex,
          )}`}
        />
      ))}
    </div>
  );
}
