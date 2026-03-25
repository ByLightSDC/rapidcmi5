import { useCallback } from 'react';
import { DynamicModal } from '@rapid-cmi5/ui';
import { QuestionBankApi } from '../../../../contexts/QuizBankContext';
import QuestionCard from './Question';

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
      getItemId={(q) => q.id}
      multiSelect={multiSelect}
      onSelect={(q) => handleModalAction([q])}
      onMultiSelect={handleModalAction}
      renderItem={(q, isSelected, isExpanded, onToggleExpand) => (
        <QuestionCard
          multiSelect={multiSelect}
          isExpanded={isExpanded}
          isSelected={isSelected}
          q={q}
          toggleExpand={(_id, e) => onToggleExpand(e)}
          handleSelect={() => {}}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
