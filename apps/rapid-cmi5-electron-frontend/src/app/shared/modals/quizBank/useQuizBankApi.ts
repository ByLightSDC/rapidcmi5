import { useMemo } from 'react';
import axios from 'axios';
import {
  QuestionBankApiCreate,
  RC5ActivityTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

export function useQuizBankApi(url: string, token: string) {
  const apiClient = useMemo(
    () =>
      axios.create({
        baseURL: url,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      }),
    [url],
  );

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const searchQuestions = async (
    query: string,
    activityType?: RC5ActivityTypeEnum,
  ) => {
    const params: Record<string, string | number | undefined> = {
      offset: 0,
      limit: 20,
      sortBy: 'dateEdited',
      sort: 'desc',
      search: query.trim(),
      questionType:
        activityType === RC5ActivityTypeEnum.ctf ? 'freeResponse' : undefined,
    };

    try {
      const response = await apiClient.get('/v1/quiz-bank/question-bank', {
        headers: authHeaders,
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to search quiz bank', error);
      throw error;
    }
  };

  const addQuestion = async (question: QuestionBankApiCreate) => {
    try {
      const response = await apiClient.post(
        '/v1/quiz-bank/question-bank',
        question,
        { headers: authHeaders },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add question to quiz bank', error);
      throw error;
    }
  };

  const deleteQuestion = async (uuid: string) => {
    try {
      await apiClient.delete(`/v1/quiz-bank/question-bank/${uuid}`, {
        headers: authHeaders,
      });
    } catch (error) {
      console.error('Failed to delete question from quiz bank', error);
      throw error;
    }
  };

  return { searchQuestions, addQuestion, deleteQuestion };
}
