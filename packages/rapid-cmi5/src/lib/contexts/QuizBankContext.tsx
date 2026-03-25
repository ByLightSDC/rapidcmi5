import { createContext } from 'react';

// The full API response shape (GET)
export interface QuestionBankApi {
  id: string;
  author: string;
  dateCreated: string;
  dateEdited: string;
  question: string;
  quizQuestion: any;
  tags: string[];
  rc5Version: string;
  public: boolean;
}

// POST — only the fields the client controls
export type QuestionBankApiCreate = Pick<
  QuestionBankApi,
  'question' | 'quizQuestion' | 'tags' | 'rc5Version' | 'public'
>;
// PUT/PATCH — same fields as create, all optional
export type QuestionBankApiUpdate = Partial<QuestionBankApiCreate>;

export interface IQuizBankContext {
  searchQuizBank?: (query: string) => Promise<QuestionBankApi[]>;
  addToQuizBank?: (question: QuestionBankApiCreate) => Promise<void>;
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
