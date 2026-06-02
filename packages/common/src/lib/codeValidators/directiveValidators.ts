import type { ZodType, core } from 'zod/v4';
import {
  CodeRunnerContent,
  CodeRunnerContentSchema,
  CTFContent,
  CTFContentSchema,
  DownloadFilesContent,
  DownloadFilesContentSchema,
  QuizContent,
  QuizContentSchemaZod,
  ScenarioContent,
  ScenarioContentSchema,
} from '../types/activities';

type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

function formatZodIssue(issue: core.$ZodIssue): string {
  const path = issue.path.length ? issue.path.join('.') : '(root)';
  return `${path} ${issue.message}`;
}

const validateContent = <T>(
  data: unknown,
  schema: ZodType<T>,
): ValidationResult<T> => {
  const result = schema.safeParse(data);
  if (result.success) return { valid: true, data: result.data };
  return { valid: false, errors: result.error.issues.map(formatZodIssue) };
};

export const validateDownloadFilesContent = (data: unknown) =>
  validateContent<DownloadFilesContent>(data, DownloadFilesContentSchema);

export const validateQuizContent = (data: unknown) =>
  validateContent<QuizContent>(data, QuizContentSchemaZod);

export const validateScenarioContent = (data: unknown) =>
  validateContent<ScenarioContent>(data, ScenarioContentSchema);

export const validateCTFContent = (data: unknown) =>
  validateContent<CTFContent>(data, CTFContentSchema);

export const validateCodeRunnerContent = (data: unknown) =>
  validateContent<CodeRunnerContent>(data, CodeRunnerContentSchema);
