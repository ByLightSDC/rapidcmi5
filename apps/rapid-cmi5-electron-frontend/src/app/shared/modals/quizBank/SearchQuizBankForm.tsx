import { useCallback } from 'react';
import { DynamicModal } from '@rapid-cmi5/ui';
import QuestionCard from './QuestionCard';
import { QuestionBankApi } from '@rapid-cmi5/cmi5-build-common';
import { GetQuizBankSearchModalProps } from '@rapid-cmi5/react-editor';

export function QuizBankSearchForm({
  closeModal,
  submitForm,
  currentUserEmail,
  activityType,
  searchQuestions,
  deleteQuestion,
}: GetQuizBankSearchModalProps) {
  const onDelete = useCallback(
    (uuid: string) => {
      if (!deleteQuestion) throw Error('Delete question is undefined');

      return deleteQuestion(uuid);
    },
    [deleteQuestion],
  );

  const fetchItems = useCallback(
    async (page: number, query: string, limit: number) => {
      if (!searchQuestions) return { data: [], totalCount: 0, totalPages: 0 };
      const data = await searchQuestions(query, page, limit, activityType);
      return {
        data: data.data ?? [],
        totalCount: data.totalCount ?? 0,
        totalPages: data.totalPages,
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
      itemsPerPage={20}
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
