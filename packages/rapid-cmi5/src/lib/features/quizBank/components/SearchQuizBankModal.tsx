import { DynamicModal, useQuizBankApi } from '@rapid-cmi5/ui';
import QuestionCard from './QuestionCard';
import {
  QuestionBankApi,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import { useRapidCmi5Opts } from '../../../design-tools/course-builder/GitViewer/session/RapidCmi5OptsContext';

interface QuizBankSearchFormProps {
  closeModal: () => void;
  submitForm: (questions: QuestionBankApi[]) => void;
  activityType: RC5ActivityTypeEnum;
}

export function QuizBankSearchForm({
  closeModal,
  submitForm,
  activityType,
}: QuizBankSearchFormProps) {
  const { userAuth } = useRapidCmi5Opts();
  const { searchQuestions, deleteQuestion } = useQuizBankApi();

  return (
    <DynamicModal<QuestionBankApi>
      open={true}
      onClose={closeModal}
      title="Quiz Bank Search"
      itemLabel="question"
      searchPlaceholder="Search question bank..."
      emptyTitle="No questions"
      emptyDescription="Add to the question bank to get started"
      multiSelect={true}
      fetchItems={(search, limit, offset) => {
        const questionType =
          activityType === RC5ActivityTypeEnum.ctf ? 'freeResponse' : undefined;
        const { data, error, isPending } = searchQuestions(
          search,
          limit,
          offset,
          questionType,
        );

        return {
          body: data?.body,
          error,
          isPending,
        };
      }}
      getItemId={(q) => q.uuid}
      onSelect={(q) => {
        submitForm(q);
        closeModal();
      }}
      renderItem={(q, isSelected, isExpanded, onToggleExpand) => (
        <QuestionCard
          multiSelect={true}
          isExpanded={isExpanded}
          isSelected={isSelected}
          q={q}
          toggleExpand={(_id, e) => onToggleExpand(e)}
          handleSelect={() => {
            return;
          }}
          currentUser={userAuth?.apiUser}
          onDelete={deleteQuestion}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
