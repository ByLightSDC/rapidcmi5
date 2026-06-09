import { useState } from 'react';
import {
  setAuJson,
  setCourseAUProgress,
  setCourseData,
} from '../redux/auReducer';
import { useDispatch } from 'react-redux';

import { initializeCourseAUProgress } from '../utils/CourseAUProgressHelpers';
import { logger } from '../debug';
import { join } from 'path-browserify';
import * as yaml from 'js-yaml';
import { ZodError } from 'zod/v4';
import {
  CourseAU,
  CourseAuSchema,
  CourseData,
  CourseDataSchemaZod,
  LESSON_CONFIG_FILENAME,
  RC5_FILENAME,
} from '@rapid-cmi5/cmi5-build-common';

function formatZodError(err: ZodError): {
  summary: string;
  issues: { path: string; message: string; code: string }[];
} {
  const issues = err.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join('.') : '(root)',
    message: issue.message,
    code: issue.code,
  }));
  const summary = issues
    .map((i) => `  • ${i.path}: ${i.message}`)
    .join('\n');
  return { summary, issues };
}

const lessonConfigPath = LESSON_CONFIG_FILENAME;

// TODO We need to clean up this course structure, it was not well done and may no longer need all
// of these levels
// The couse config path can be shown as such /base folder/compiled_course/blocks/block name/au name/current directory
// The RC5.yaml file is inside of the block name folder, one level up from the config.json
const courseConfigPath = join('..', RC5_FILENAME);

/**
 * Load AU lesson config
 * @returns
 */
export const useAuContent = () => {
  const [isContentLoaded, setIsLoaded] = useState(false);
  const [contentErrorMessage, setContentErrorMessage] = useState('');
  const dispatch = useDispatch();

  const loadContent = async () => {
    // load course level config

    try {
      const response = await fetch(courseConfigPath);
      if (response.ok) {
        const yamlText = await response.text();
        // JSON_SCHEMA skips js-yaml's `!!timestamp` resolver so ISO-looking
        // strings (e.g. buildTime) stay as strings instead of Date objects.
        const parsedYaml = yaml.load(yamlText, { schema: yaml.JSON_SCHEMA });
        const courseContent: CourseData = CourseDataSchemaZod.parse(parsedYaml);

        dispatch(setCourseData(courseContent));
        logger.debug(
          'Loaded course data',
          { courseTitle: courseContent.courseTitle },
          'auManager',
        );
      } else {
        logger.error(
          'Failed to fetch course config file',
          {
            status: response.status,
            statusText: response.statusText,
            courseConfigPath,
          },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(
          `Error loading ${RC5_FILENAME}: ${response.statusText}`,
        );
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const { summary, issues } = formatZodError(err);
        logger.error(
          `Course config (${RC5_FILENAME}) failed schema validation:\n${summary}`,
          { issues, courseConfigPath },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(
          `${RC5_FILENAME} schema errors:\n${summary}`,
        );
      } else {
        logger.error(
          'Exception loading course content',
          { error: err, courseConfigPath },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(`Error loading ${RC5_FILENAME}`);
      }
    }

    try {
      const response = await fetch(lessonConfigPath);

      if (response.ok) {
        const rawContent = await response.json();
        const content: CourseAU = CourseAuSchema.parse(rawContent);
        dispatch(setAuJson(content));

        const initialCourseAUProgress = initializeCourseAUProgress({
          auJson: content,
          auProgress: 0,
          auViewedSlides: [],
        });

        dispatch(setCourseAUProgress(initialCourseAUProgress));

        setIsLoaded(true);
        setContentErrorMessage('');
      } else {
        logger.error(
          'Failed to fetch config file',
          {
            status: response.status,
            statusText: response.statusText,
            lessonConfigPath,
          },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(
          `Error loading config.json :${response.statusText}`,
        );
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const { summary, issues } = formatZodError(err);
        logger.error(
          `AU config (${LESSON_CONFIG_FILENAME}) failed schema validation:\n${summary}`,
          { issues, lessonConfigPath },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(
          `${LESSON_CONFIG_FILENAME} schema errors:\n${summary}`,
        );
      } else {
        logger.error(
          'Exception loading AU content',
          { error: err, lessonConfigPath },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage('Error loading content');
      }
    }
  };

  return { isContentLoaded, contentErrorMessage, loadContent };
};
