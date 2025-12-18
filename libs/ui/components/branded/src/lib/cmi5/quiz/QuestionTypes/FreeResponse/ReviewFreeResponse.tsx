import useQuizGrader from '../../hooks/useQuizGrader';
import { ReviewProps } from '@rapid-cmi5/types/cmi5';

export default function ReviewFreeResponse(props: ReviewProps) {
  const { question, answer } = props;
  const { getReviewIndication } = useQuizGrader();
  return (
    <div>
      <p>You answered: </p>

      <div
        className={`option-rangeos ${getReviewIndication(question, answer)}`}
      >
        <p>{answer}</p>
      </div>
      <p>Correct Answer: </p>
      <div className={`option-rangeos bg-blue-800`}>
        <p>{question.typeAttributes.correctAnswer}</p>
      </div>
    </div>
  );
}
