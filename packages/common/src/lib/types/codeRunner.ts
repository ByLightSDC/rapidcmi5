// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import { BaseActivity } from './activity';

export enum CodeRunnerLanguageEnum {
  Python = 'python',
  CPP = 'c++',
  C = 'c',
  Java = 'java',
  JavaScript = 'javascript',
}

export const CodeRunnerLanguageVersions: Record<string, string[]> = {
  [CodeRunnerLanguageEnum.Python]: ['3.12', '3.11', '3.10', '3.9'],
  [CodeRunnerLanguageEnum.CPP]: ['c++17', 'c++14', 'c++11'],
  [CodeRunnerLanguageEnum.C]: ['c17', 'c11'],
  [CodeRunnerLanguageEnum.Java]: ['21', '17', '11'],
  [CodeRunnerLanguageEnum.JavaScript]: ['node18', 'node16', 'node14'],
};

export const CodeRunnerLanguageOptions = Object.values(CodeRunnerLanguageEnum);

export type CodeRunnerContent = BaseActivity & {
  title: string;
  description: string;
  evaluator: string;
  student: string;
  cmi5QuizId: string; // Activity ID for LRS tracking
  programmingLanguage: string;
  languageVersion: string;
};

export type CodeRunnerSubmitResponse = {
  isSuccess: boolean;
  message: string;
};
