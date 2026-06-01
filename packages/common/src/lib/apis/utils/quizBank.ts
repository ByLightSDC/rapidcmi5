import { InitClientReturn } from '@ts-rest/core';
import {
  QuestionBankApi,
  QuestionBankApiCreate,
  quizBankContract,
} from '../quizBankContract';
import { RC5ActivityTypeEnum } from '../../types/activities/activity';

type QuizBankClient = InitClientReturn<
  typeof quizBankContract,
  { baseUrl: string }
>;

export class QuizBankApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(`${message} (status: ${status})`);
    this.name = 'QuizBankApiError';
  }
}

export const handleSearchQuestions = async (
  query: string,
  page: number,
  limit: number,
  apiClient: QuizBankClient,
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
        activityType === RC5ActivityTypeEnum.ctf ? 'freeResponse' : undefined,
    },
  });
  if (response.status === 200) {
    return response.body;
  }
  throw new QuizBankApiError('Failed to search questions', response.status);
};

export const handleAddQuestion = async (
  question: QuestionBankApiCreate,
  apiClient: QuizBankClient,
): Promise<QuestionBankApi | undefined> => {
  const response = await apiClient.createQuestion({ body: question });
  if (response.status === 200 || response.status === 201) {
    return response.body as QuestionBankApi;
  }
  throw new QuizBankApiError('Failed to add question', response.status);
};

export const handleDeleteQuestion = async (
  uuid: string,
  apiClient: QuizBankClient,
): Promise<void> => {
  const response = await apiClient.deleteQuestion({ params: { uuid } });
  if (response.status === 200 || response.status === 204) {
    return;
  }
  throw new QuizBankApiError('Failed to delete question', response.status);
};
