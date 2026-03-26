import { useCallback, useMemo } from 'react';
import { DynamicModal } from '@rapid-cmi5/ui';
import QuestionCard from './Question';
import {
  QuestionBankApi,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import axios from 'axios';
import { QuizBankSearchModalProps } from '@rapid-cmi5/react-editor';

export function QuizBankSearchForm({
  url,
  token,
  closeModal,
  submitForm,
  currentUserEmail,
  activityType,
}: QuizBankSearchModalProps) {
  const apiClient = useMemo(
    () =>
      axios.create({
        baseURL: url,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    [url],
  );

  const onDelete = useCallback(
    async (uuid: string) => {
      try {
        await apiClient.delete(`/v1/quiz-bank/question-bank/${uuid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Failed to delete question from quiz bank', error);
        throw error;
      }
    },
    [apiClient, token],
  );

  const fetchItems = useCallback(
    async (_page: number, query: string) => {
      const onSearch = async (query: string) => {
        try {
          const params: Record<string, string | number | undefined> = {
            offset: 0,
            limit: 20,
            sortBy: 'dateEdited',
            sort: 'desc',
            search: query.trim(),
            questionType:
              activityType === RC5ActivityTypeEnum.ctf
                ? 'freeResponse'
                : undefined,
          };

          const response = await apiClient.get('/v1/quiz-bank/question-bank', {
            headers: { Authorization: `Bearer ${token}` },
            params,
          });

          return response.data.data;
        } catch (error) {
          console.error('Failed to add question to quiz bank', error);
          throw error;
        }
      };

      const data = await onSearch(query);

      return {
        data: data ?? [],
        totalCount: data?.length ?? 0,
        totalPages: 1,
      };
    },
    [apiClient, token, activityType],
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
