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
