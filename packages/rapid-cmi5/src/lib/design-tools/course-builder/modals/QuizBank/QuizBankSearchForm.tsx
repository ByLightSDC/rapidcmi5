import { useCallback, useContext, useState } from 'react';
import { DynamicModal } from '@rapid-cmi5/ui';
import {
  QuestionBankApi,
  QuizBankContext,
} from '../../../../contexts/QuizBankContext';
import QuestionCard from './Question';
import { GitContext } from '../../GitViewer/session/GitContext';

export function QuizBankSearchForm({
  handleCloseModal,
  handleModalAction,
  onSearch,
  multiSelect = false,
}: {
  handleCloseModal: () => void;
  handleModalAction: (data: QuestionBankApi[]) => void;
  onSearch: (query: string) => Promise<QuestionBankApi[]>;
  multiSelect?: boolean;
}) {
  const { currentAuth } = useContext(GitContext);
  const { deleteFromQuizBank } = useContext(QuizBankContext);

  const fetchItems = useCallback(
    async (_page: number, query: string) => {
      const data = await onSearch(query);

      return {
        data: data ?? [],
        totalCount: data?.length ?? 0,
        totalPages: 1,
      };
    },
    [onSearch],
  );

  return (
    <DynamicModal<QuestionBankApi>
      open={true}
      onClose={handleCloseModal}
      title="Quiz Bank Search"
      itemLabel="question"
      searchPlaceholder="Search question bank..."
      emptyTitle="No questions"
      emptyDescription="Add to the question bank to get started"
      fetchItems={fetchItems}
      getItemId={(q) => q.uuid}
      multiSelect={multiSelect}
      onSelect={(q) => handleModalAction([q])}
      onMultiSelect={handleModalAction}
      onDelete={deleteFromQuizBank}
      renderItem={(q, isSelected, isExpanded, onToggleExpand, onDelete) => (
        <QuestionCard
          multiSelect={multiSelect}
          isExpanded={isExpanded}
          isSelected={isSelected}
          q={q}
          toggleExpand={(_id, e) => onToggleExpand(e)}
          handleSelect={() => {}}
          currentUser={currentAuth?.apiUser}
          onDelete={onDelete}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
