import { useCallback, useMemo } from 'react';
import {
  QuestionBankApi,
  QuestionBankApiCreate,
  quizBankContract,
} from '../quizBankContract';
import { initClient } from '@ts-rest/core';
import { RC5ActivityTypeEnum } from '../../types/activity';

// We will attempt to move to Tan stack React Query V5 in the future
export function useQuizBankApi(url?: string, token?: string) {
  const apiClient = useMemo(
    () =>
      url && token
        ? initClient(quizBankContract, {
            baseUrl: url,
            baseHeaders: {
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          })
        : undefined,
    [url, token],
  );

  const searchQuestionsCb = useCallback(
    async (
      query: string,
      page: number,
      limit: number,
      activityType?: RC5ActivityTypeEnum,
    ) => {
      if (!apiClient) throw Error('API client is not set');
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

  const addQuestionCb = useCallback(
    async (
      question: QuestionBankApiCreate,
    ): Promise<QuestionBankApi | undefined> => {
      if (!apiClient) throw Error('API client is not set');
      const response = await apiClient.createQuestion({ body: question });
      if (response.status === 200 || response.status === 201) {
        return response.body as QuestionBankApi;
      }
      throw new QuizBankApiError('Failed to add question', response.status);
    },
    [apiClient],
  );

  const deleteQuestionCb = useCallback(
    async (uuid: string) => {
      if (!apiClient) throw Error('API client is not set');
      const response = await apiClient.deleteQuestion({ params: { uuid } });
      if (response.status === 200 || response.status === 204) {
        return;
      }
      throw new QuizBankApiError('Failed to delete question', response.status);
    },
    [apiClient],
  );

  const searchQuestions = apiClient ? searchQuestionsCb : undefined;
  const addQuestion = apiClient ? addQuestionCb : undefined;
  const deleteQuestion = apiClient ? deleteQuestionCb : undefined;

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
