import { useCallback, useMemo } from 'react';
import { quizBankContract } from '../quizBankContract';
import { initClient } from '@ts-rest/core';
import { RC5ActivityTypeEnum } from '../../types/activity';
import {
  QuizBankApiError,
  handleAddQuestion,
  handleDeleteQuestion,
  handleSearchQuestions,
} from '../utils/quizBank';
import { QuestionBankApi, QuestionBankApiCreate } from '../quizBankContract';

export { QuizBankApiError };

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
      return await handleSearchQuestions(
        query,
        page,
        limit,
        apiClient,
        activityType,
      );
    },
    [apiClient],
  );

  const addQuestionCb = useCallback(
    async (
      question: QuestionBankApiCreate,
    ): Promise<QuestionBankApi | undefined> => {
      if (!apiClient) throw Error('API client is not set');
      return await handleAddQuestion(question, apiClient);
    },
    [apiClient],
  );

  const deleteQuestionCb = useCallback(
    async (uuid: string) => {
      if (!apiClient) throw Error('API client is not set');
      return await handleDeleteQuestion(uuid, apiClient);
    },
    [apiClient],
  );

  const searchQuestions = apiClient ? searchQuestionsCb : undefined;
  const addQuestion = apiClient ? addQuestionCb : undefined;
  const deleteQuestion = apiClient ? deleteQuestionCb : undefined;

  return { searchQuestions, addQuestion, deleteQuestion };
}
