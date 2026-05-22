import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DynamicModal, useQuizBankClient } from '@rapid-cmi5/ui';
import QuestionCard from './QuestionCard';
import { QuestionBankApi } from '@rapid-cmi5/cmi5-build-common';
import { useRapidCmi5Opts } from '../../../design-tools/course-builder/GitViewer/session/RapidCmi5OptsContext';

export function QuizBankSearchForm({
  closeModal,
  submitForm,
  activityType,
}: {
  closeModal: any;
  submitForm: any;
  activityType: any;
}) {
  const { userAuth } = useRapidCmi5Opts();
  const quizBankClient = useQuizBankClient();
  const queryClient = useQueryClient();

  if (!quizBankClient) throw Error('No quiz bank client');

  const { mutateAsync: deleteQuestion } =
    quizBankClient.deleteQuestion.useMutation();

  const onDelete = useCallback(
    async (uuid: string) => {
      const { status } = await deleteQuestion({ params: { uuid } });
      if (status !== 200) throw Error('Error deleting');
      await queryClient.invalidateQueries({ queryKey: ['question'] });
    },
    [deleteQuestion, queryClient],
  );

  return (
    <DynamicModal<QuestionBankApi>
      open={true}
      onClose={closeModal}
      title="Quiz Bank Search"
      itemLabel="question"
      searchPlaceholder="Search question bank..."
      emptyTitle="No questions"
      emptyDescription="Add to the question bank to get started"
      itemsPerPage={20}
      multiSelect={true}
      fetchItems={(search, limit, offset) => {
        const { data, error, isPending } = quizBankClient.getQuestions.useQuery(
          {
            queryKey: [
              'question',
              { search, limit, offset, sortBy: 'dateEdited', sort: 'desc' },
            ],
            queryData: { query: { search, limit, offset } },
          },
        );

        return {
          body: data?.body,
          error,
          isPending,
        };
      }}
      getItemId={(q) => q.uuid}
      onSelect={(q) => {
        submitForm([q]);
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
          currentUser={userAuth?.userEmail}
          onDelete={onDelete}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
