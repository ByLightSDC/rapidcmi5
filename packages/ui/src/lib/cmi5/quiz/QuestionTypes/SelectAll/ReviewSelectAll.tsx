import useQuizGrader from '../../hooks/useQuizGrader';
import { type ReviewProps } from '@rapid-cmi5/cmi5-build-common';
import { Typography } from '@mui/material';

export default function ReviewSelectAll(props: ReviewProps) {
  const { question, answer } = props;
  const { getReviewIndication } = useQuizGrader();
  return (
    <div>
      {question.typeAttributes.options?.map((option, optionIndex) => (
        <Typography
          className={`bg-blue-800 option-rangeos ${getReviewIndication(
            question,
            answer,
            optionIndex,
          )}`}
        >
          {option.text}
        </Typography>
      ))}
    </div>
  );
}
