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
import {
  LESSON_CONFIG_FILENAME,
  parseAuConfigJson,
  parseCourseDataYaml,
  RC5_FILENAME,
} from '@rapid-cmi5/cmi5-build-common';

// The config json is in the current directory
const lessonConfigPath = LESSON_CONFIG_FILENAME;

// TODO We need to clean up this course structure, it was not well done and we may no longer need all
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
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${RC5_FILENAME}: ${response.status} ${response.statusText}`,
        );
      }
      const yamlText = await response.text();
      const courseContent = parseCourseDataYaml(yamlText);
      dispatch(setCourseData(courseContent));
    } catch (err) {
      logger.error(
        'Exception loading course content',
        { error: err, courseConfigPath },
        'auManager',
      );
      setIsLoaded(false);
      setContentErrorMessage(`Error loading ${RC5_FILENAME}`);
    }

    try {
      const response = await fetch(lessonConfigPath);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${LESSON_CONFIG_FILENAME}: ${response.status} ${response.statusText}`,
        );
      }
      const rawContent = await response.json();
      const content = parseAuConfigJson(rawContent);
      dispatch(setAuJson(content));

      const initialCourseAUProgress = initializeCourseAUProgress({
        auJson: content,
        auProgress: 0,
        auViewedSlides: [],
      });

      dispatch(setCourseAUProgress(initialCourseAUProgress));

      setIsLoaded(true);
      setContentErrorMessage('');
    } catch (err) {
      logger.error(
        'Exception loading AU content',
        { error: err, lessonConfigPath },
        'auManager',
      );
      setIsLoaded(false);
      setContentErrorMessage(`Error loading ${LESSON_CONFIG_FILENAME}`);
    }
  };

  return { isContentLoaded, contentErrorMessage, loadContent };
};
