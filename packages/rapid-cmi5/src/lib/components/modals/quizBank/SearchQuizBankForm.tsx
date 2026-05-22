import { useCallback } from 'react';
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
  const onDelete = useCallback(
    async (uuid: string) => {
      if (!quizBankClient) throw Error('Delete question is undefined');

      const { status } = await quizBankClient.deleteQuestion.mutate({
        params: { uuid },
      });
      if (status !== 200) {
        throw Error('Error deleting');
      }
      return;
    },
    [quizBankClient],
  );

  const fetchItems = useCallback(
    async (query: { offset: number; search: string; limit: number }) => {
      if (!quizBankClient) throw Error('Error');

      // const { data, error, isPending } = quizBankClient.getQuestions.useQuery({
      //   queryKey: ['uuid'],
      //   queryData: {
      //     query: query,
      //   },
      // });

      const res = await quizBankClient.getQuestions.query({
        query,
      });

      if (res.status !== 200) throw Error('Could not fetch');

      return {
        data: res.body.data,
        totalCount: res.body.totalCount ?? 0,
        totalPages: res.body.totalPages,
      };
    },
    [quizBankClient, activityType],
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
          currentUser={userAuth?.userEmail}
          onDelete={onDelete}
        />
      )}
    />
  );
}

export default QuizBankSearchForm;
