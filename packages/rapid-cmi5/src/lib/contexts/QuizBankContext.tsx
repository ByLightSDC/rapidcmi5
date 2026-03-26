import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';
import { createContext } from 'react';

// The full API response shape (GET)
export interface QuestionBankApi {
  uuid: string;
  author: string;
  dateCreated: string;
  dateEdited: string;
  question: string;
  quizQuestion: any;
  tags: string[];
  rc5Version: string;
  public: boolean;
  questionType: string;
}

// POST — only the fields the client controls
export type QuestionBankApiCreate = Pick<
  QuestionBankApi,
  'question' | 'quizQuestion' | 'tags' | 'rc5Version' | 'public' | 'questionType'
>;
// PUT/PATCH — same fields as create, all optional
export type QuestionBankApiUpdate = Partial<QuestionBankApiCreate>;

export interface IQuizBankContext {
  searchQuizBank?: (query: string, activityKind: RC5ActivityTypeEnum) => Promise<QuestionBankApi[]>;
  addToQuizBank?: (question: QuestionBankApiCreate) => Promise<void>;
  updateInQuizBank?: (uuid: string, question: QuestionBankApiUpdate) => Promise<void>;
  deleteFromQuizBank?: (uuid: string) => Promise<void>;
}

export const QuizBankContext = createContext<IQuizBankContext>({
  searchQuizBank: async () => [],
  addToQuizBank: async () => {},
  updateInQuizBank: async () => {},
  deleteFromQuizBank: async () => {},
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
  const { addToQuizBank, updateInQuizBank, searchQuizBank, deleteFromQuizBank } = quizBankProps;
  return (
    <QuizBankContext.Provider value={{ searchQuizBank, addToQuizBank, updateInQuizBank, deleteFromQuizBank }}>
      {children}
    </QuizBankContext.Provider>
  );
}
