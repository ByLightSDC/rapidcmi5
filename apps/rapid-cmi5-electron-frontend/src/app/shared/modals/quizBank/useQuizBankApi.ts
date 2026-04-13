import { useCallback, useMemo } from 'react';
import {
  QuestionBankApiCreate,
  quizBankContract,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';
import { initClient } from '@ts-rest/core';

// We will attempt to move to Tan stack React Query V5 in the future
export function useQuizBankApi(url: string, token: string) {
  const apiClient = useMemo(
    () =>
      initClient(quizBankContract, {
        baseUrl: url,
        baseHeaders: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }),
    [url, token],
  );

  const searchQuestions = useCallback(
    async (
      query: string,
      page: number,
      limit: number,
      activityType?: RC5ActivityTypeEnum,
    ) => {
      const response = await apiClient.getQuestions({
        query: {
          offset: (page - 1) * limit,
          limit: limit,
          sortBy: 'dateEdited',
          sort: 'desc',
          search: query.trim(),
          questionType:
            activityType === RC5ActivityTypeEnum.ctf
              ? 'freeResponse'
              : undefined,
        },
      });
      if (response.status === 200) {
        return response.body;
      }
      throw new QuizBankApiError('Failed to search questions', response.status);
    },
    [apiClient],
  );

  const addQuestion = useCallback(
    async (question: QuestionBankApiCreate) => {
      const response = await apiClient.createQuestion({ body: question });
      if (response.status === 200 || response.status === 201) {
        return response.body;
      }
      throw new QuizBankApiError('Failed to add question', response.status);
    },
    [apiClient],
  );

  const deleteQuestion = useCallback(
    async (uuid: string) => {
      const response = await apiClient.deleteQuestion({ params: { uuid } });
      if (response.status === 200 || response.status === 204) {
        return;
      }
      throw new QuizBankApiError('Failed to delete question', response.status);
    },
    [apiClient],
  );

  return { searchQuestions, addQuestion, deleteQuestion };
}

export class QuizBankApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(`${message} (status: ${status})`);
    this.name = 'QuizBankApiError';
  }
}
