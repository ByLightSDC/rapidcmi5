/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from 'react';
import { QuestionType } from '../design-tools/course-builder/modals/QuizBank/QuizBankSearchForm';

export interface QuestionBankApi {
  author: string;
  id: string;
  dateCreated: string;
  dateEdited: string;
  question: string;
  quizId: string;
  quizQuestion: any;
  tags: string[];
  rc5Version: string;
}

export interface IQuizBankContext {
  searchQuizBank: (
    query: string,
    mode: 'question' | 'tags',
  ) => Promise<QuestionBankApi[]>;
  addToQuizBank: (question: QuestionType) => Promise<void>;
}



export const QuizBankContext = createContext<IQuizBankContext>({
  searchQuizBank: async () => [],
  addToQuizBank: async () => {},
});

interface QuizBankProviderProps {
  children: React.ReactNode;
  quizBankProps?: IQuizBankContext;
}

export function QuizBankProvider({
  children,
  quizBankProps,
}: QuizBankProviderProps) {
  if (!quizBankProps) return children;
  const { addToQuizBank, searchQuizBank } = quizBankProps;
  return (
    <QuizBankContext.Provider value={{ searchQuizBank, addToQuizBank }}>
      {children}
    </QuizBankContext.Provider>
  );
}
