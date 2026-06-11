import { ZodError } from 'zod/v4';
import { LESSON_CONFIG_FILENAME, RC5_FILENAME } from '../courseBuilders';
import {
  CourseAU,
  CourseAuSchema,
  CourseData,
  CourseDataSchemaZod,
} from '../types';
import * as yaml from 'js-yaml';

export function formatZodError(err: ZodError): {
  summary: string;
  issues: { path: string; message: string; code: string }[];
} {
  const issues = err.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join('.') : '(root)',
    message: issue.message,
    code: issue.code,
  }));
  const summary = issues.map((i) => `  • ${i.path}: ${i.message}`).join('\n');
  return { summary, issues };
}

// Parse the course level RC5.yaml file.
export function parseCourseDataYaml(yamlText: string) {
  try {
    const parsedYaml = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
    const courseContent: CourseData = CourseDataSchemaZod.parse(parsedYaml);
    return courseContent;
  } catch (err) {
    if (err instanceof ZodError) {
      const { summary, issues } = formatZodError(err);
      console.error(
        `Course config (${RC5_FILENAME}) failed schema validation:\n${summary}\n${issues}`,
      );
    }
    throw err;
  }
}

// Parse the lesson level config.json file.
export function parseAuConfigJson(rawContent: unknown) {
  try {
    const auContent: CourseAU = CourseAuSchema.parse(rawContent);
    return auContent;
  } catch (err) {
    if (err instanceof ZodError) {
      const { summary, issues } = formatZodError(err);
      console.error(
        `AU config (${LESSON_CONFIG_FILENAME}) failed schema validation:\n${summary}\n${issues}`,
      );
    }
    throw err;
  }
}
