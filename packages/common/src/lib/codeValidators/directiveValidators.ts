import type { ZodType, core } from 'zod/v4';
import {
  CodeRunnerContent,
  CodeRunnerContentSchema,
  CTFContent,
  CTFContentSchema,
  DirectiveName,
  DirectiveToActivityMapping,
  DownloadFilesContent,
  DownloadFilesContentSchema,
  QuizContent,
  QuizContentSchemaZod,
  ScenarioContent,
  ScenarioContentSchema,
} from '../types/activities';

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

/** Directive name -> the content type its body must parse to. */
export type DirectiveContentMap = {
  [Mapping in DirectiveToActivityMapping as Mapping['name']]: Mapping['content'];
};

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

/**
 * The schema backing each directive body. The annotation keeps this exhaustive
 * against DirectiveName, so a new directive type fails to compile until it is
 * given a schema here.
 */
export const directiveSchemas: {
  [Name in DirectiveName]: ZodType<DirectiveContentMap[Name]>;
} = {
  consoles: ScenarioContentSchema,
  quiz: QuizContentSchemaZod,
  scenario: ScenarioContentSchema,
  ctf: CTFContentSchema,
  download: DownloadFilesContentSchema,
  codeRunner: CodeRunnerContentSchema,
};

export const supportedDirectiveNames = Object.keys(
  directiveSchemas,
) as DirectiveName[];

export function isSupportedDirectiveName(name: string): name is DirectiveName {
  return name in directiveSchemas;
}

export function validateDirectiveContent<Name extends DirectiveName>(
  name: Name,
  data: unknown,
): ValidationResult<DirectiveContentMap[Name]> {
  return validateContent(data, directiveSchemas[name]);
}
