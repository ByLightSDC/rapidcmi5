import {
  DownloadFilesContent,
  DownloadFilesSchema,
  QuizContent,
  ScenarioContent,
  QuizContentSchema,
  ScenarioContentSchema,
  TeamConsolesContentSchema,
  CTFContentSchema,
  JobeContentSchema,
  CTFContent,
  JobeContent,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build/common';
import Ajv, { ErrorObject } from 'ajv';

// To generate new schemas, ensure that whenever the types change ./utils/ajv-schema-generator.sh is ran
const ajv = new Ajv({
  strictSchema: true,
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});

function formatAjvError(error: ErrorObject): string {
  const instancePath = error.instancePath || '';
  const propertyPath = instancePath
    ? instancePath.replace(/^\//, '').replace(/\//g, '.')
    : error.params?.['missingProperty']
      ? error.params['missingProperty']
      : '(root)';
  return `${propertyPath} ${error.message}`;
}

type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

const validateContent = <T>(
  data: unknown,
  schema: object,
): ValidationResult<T> => {

  try {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = (validate.errors || []).map(formatAjvError);
      return { valid: false, errors };
    }
  } catch (e) {
    console.log('err', e);
  }

  return { valid: true, data: data as T };
};

export const validateDownloadFilesContent = (data: unknown) =>
  validateContent<DownloadFilesContent>(data, DownloadFilesSchema);

export const validateQuizContent = (data: unknown) =>
  validateContent<QuizContent>(data, QuizContentSchema);

export const validateScenarioContent = (data: unknown) =>
  validateContent<ScenarioContent>(data, ScenarioContentSchema);

export const validateTeamConsolesContent = (data: unknown) =>
  validateContent<TeamConsolesContent>(data, TeamConsolesContentSchema);

export const validateCTFContent = (data: unknown) =>
  validateContent<CTFContent>(data, CTFContentSchema);

export const validateJobeContent = (data: unknown) =>
  validateContent<JobeContent>(data, JobeContentSchema);
