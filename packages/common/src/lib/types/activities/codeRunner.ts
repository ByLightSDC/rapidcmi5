// Ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran

import z from 'zod/v4';
import { BaseActivitySchema } from './baseActivity';

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

export const CodeRunnerContentSchema = BaseActivitySchema.extend({
  title: z.string(),
  description: z.string(),
  evaluator: z.string(),
  student: z.string(),
  cmi5QuizId: z.string(),
  programmingLanguage: z.string(),
  languageVersion: z.string(),
});

export type CodeRunnerContent = z.infer<typeof CodeRunnerContentSchema>;

export const CodeRunnerSubmitResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string(),
});

export type CodeRunnerSubmitResponse = z.infer<
  typeof CodeRunnerSubmitResponseSchema
>;
