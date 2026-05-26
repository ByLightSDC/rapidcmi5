import {
  currentQuizBankApiVersion,
  QuizQuestion,
} from '@rapid-cmi5/cmi5-build-common';
import { useQuizBankClient } from '../../contexts/ApiContext';
import { questionKey } from './queryKeys';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';

export function useQuizBankApi() {
  const { enabled, client } = useQuizBankClient();
  const queryClient = useQueryClient();

  const searchQuestions = (
    search: string,
    limit: number,
    offset: number,
    questionType?: 'freeResponse',
  ) => {
    return client.getQuestions.useQuery({
      queryKey: [
        questionKey,
        {
          search,
          limit,
          offset,
          sortBy: 'dateEdited',
          sort: 'desc',
          questionType,
        },
      ],
      queryData: { query: { search, limit, offset, questionType } },
      placeholderData: keepPreviousData,
    });
  };

  const deleteQuestion = async (uuid: string) => {
    const { status } = await client.deleteQuestion.mutate({
      params: { uuid },
    });
    if (status !== 204) throw Error('Error deleting');
    await queryClient.invalidateQueries({ queryKey: [questionKey] });
  };

  const createQuestion = async (
    isPublic: boolean,
    tags: string[],
    question: QuizQuestion,
  ) => {
    return await client.createQuestion.mutate({
      body: {
        publicQuestion: isPublic,
        questionType: question.type,
        question: question.question,
        cmi5QuestionId: question.cmi5QuestionId,
        correctAnswer: question.typeAttributes.correctAnswer,
        grading: question.typeAttributes.grading,
        options: question.typeAttributes.options ?? undefined,
        matching: question.typeAttributes.matching ?? undefined,
        shuffleAnswers: question.typeAttributes.shuffleAnswers ?? undefined,
        rc5QuizBankApiVersion: currentQuizBankApiVersion,
        tags,
      },
    });
  };

  return {
    searchQuestions,
    deleteQuestion,
    createQuestion,
    isQuizBankEnabled: enabled,
  };
}
