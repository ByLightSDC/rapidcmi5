// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity } from './activity';

export enum JobeLanguageEnum {
  Python = 'python',
  CPP = 'c++',
  C = 'c',
  Java = 'java',
  JavaScript = 'javascript',
}

export const jobeLanguageVersions: Record<string, string[]> = {
  [JobeLanguageEnum.Python]: ['3.12', '3.11', '3.10', '3.9'],
  [JobeLanguageEnum.CPP]: ['c++17', 'c++14', 'c++11'],
  [JobeLanguageEnum.C]: ['c17', 'c11'],
  [JobeLanguageEnum.Java]: ['21', '17', '11'],
  [JobeLanguageEnum.JavaScript]: ['node18', 'node16', 'node14'],
};

export const jobeLanguageOptions = Object.values(JobeLanguageEnum);

export type JobeContent = BaseActivity & {
  title: string;
  description: string;
  evaluator: string;
  student: string;
  cmi5QuizId: string; // Activity ID for LRS tracking
  programmingLanguage?: string;
  languageVersion?: string;
};

export type JobeSubmitResponse = {
  isSuccess: boolean;
  message: string;
};
