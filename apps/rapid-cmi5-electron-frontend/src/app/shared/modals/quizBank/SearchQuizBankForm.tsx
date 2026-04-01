import { useCallback } from 'react';
import { DynamicModal } from '@rapid-cmi5/ui';
import QuestionCard from './QuestionCard';
import { QuestionBankApi } from '@rapid-cmi5/cmi5-build-common';
import { QuizBankSearchModalProps } from '@rapid-cmi5/react-editor';
import { useQuizBankApi } from './useQuizBankApi';

export function QuizBankSearchForm({
  url,
  token,
  closeModal,
  submitForm,
  currentUserEmail,
  activityType,
}: QuizBankSearchModalProps) {
  const { searchQuestions, deleteQuestion } = useQuizBankApi(url, token);

  const onDelete = useCallback(
    (uuid: string) => deleteQuestion(uuid),
    [deleteQuestion],
  );

  const fetchItems = useCallback(
    async (_page: number, query: string) => {
      const data = await searchQuestions(query, activityType);
      return {
        data: data ?? [],
        totalCount: data?.length ?? 0,
        totalPages: 1,
      };
    },
    [searchQuestions, activityType],
  );

  return (
    <DynamicModal<QuestionBankApi>
      open={true}
      title="Quiz Bank Search"
      itemLabel="question"
      searchPlaceholder="Search question bank..."
      emptyTitle="No questions"
      emptyDescription="Add to the question bank to get started"
      fetchItems={fetchItems}
      getItemId={(q) => q.uuid}
      multiSelect={true}
      onSelect={(q) => submitForm([q])}
      onMultiSelect={submitForm}
      onDelete={onDelete}
      onClose={closeModal}
      renderItem={(q, isSelected, isExpanded, onToggleExpand, onDelete) => (
        <QuestionCard
          multiSelect={true}
          isExpanded={isExpanded}
          isSelected={isSelected}
          q={q}
          toggleExpand={(_id, e) => onToggleExpand(e)}
          handleSelect={() => {
            return;
          }}
          currentUser={currentUserEmail}
          onDelete={onDelete}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
