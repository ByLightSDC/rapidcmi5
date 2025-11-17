// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity } from './activity';

export type JobeContent = BaseActivity & {
  title: string;
  description: string;
  evaluator: string;
  student: string;
  cmi5QuizId: string; // Activity ID for LRS tracking
};

export type JobeSubmitResponse = {
  isSuccess: boolean;
  message: string;
};
