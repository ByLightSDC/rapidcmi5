import { useState } from 'react';
import { setAuJson, setCourseAUProgress } from '../redux/auReducer';
import { useDispatch } from 'react-redux';

import { initializeCourseAUProgress } from '../utils/CourseAUProgressHelpers';
import { logger } from '../debug';

/**
 * Load AU lesson config
 * @returns
 */
export const useAuContent = () => {
  const [isContentLoaded, setIsLoaded] = useState(false);
  const [contentErrorMessage, setContentErrorMessage] = useState('');
  const dispatch = useDispatch();

  const loadContent = async (path: string) => {
    logger.debug('Loading AU content', { path }, 'auManager');

    try {
      logger.debug('Fetching config file', { path }, 'auManager');
      const response = await fetch(path);

      if (response.ok) {
        logger.debug(
          'Config file fetched successfully',
          {
            status: response.status,
            statusText: response.statusText,
          },
          'auManager',
        );

        const content = (await response.json()) as any;
        logger.debug(
          'Config content parsed',
          {
            auName: content.auName,
            auTitle: content.title,
            totalSlides: content.slides?.length || 0,
          },
          'auManager',
        );

        logger.debug('Dispatching setAuJson', { content }, 'auManager');
        dispatch(setAuJson(content));

        // Initialize the course metadata structure
        // logger.debug(
        //   'Initializing CourseAUProgress with course metadata',
        //   { auName: content.auName, totalSlides: content.slides?.length || 0 },
        //   'auManager',
        // );
        const initialCourseAUProgress = initializeCourseAUProgress({
          auJson: content,
          auProgress: 0,
          auViewedSlides: [],
        });

        logger.debug(
          'CourseAUProgress initialized, dispatching to Redux',
          {
            auId: initialCourseAUProgress.courseStructure.auId,
            totalSlides: initialCourseAUProgress.courseStructure.totalSlides,
            totalActivities: Object.keys(
              initialCourseAUProgress.slideActivitiesMeta,
            ).reduce(
              (sum, slideGuid) =>
                sum +
                Object.keys(
                  initialCourseAUProgress.slideActivitiesMeta[slideGuid],
                ).length,
              0,
            ),
          },
          'auManager',
        );
        dispatch(setCourseAUProgress(initialCourseAUProgress));

        logger.debug('Setting content loaded to true', undefined, 'auManager');
        setIsLoaded(true);
        setContentErrorMessage('');

        logger.debug(
          'AU content loading completed successfully',
          undefined,
          'auManager',
        );
      } else {
        logger.error(
          'Failed to fetch config file',
          {
            status: response.status,
            statusText: response.statusText,
            path,
          },
          'auManager',
        );
        setIsLoaded(false);
        setContentErrorMessage(
          `Error loading config.json :${response.statusText}`,
        );
      }
    } catch (e) {
      logger.error(
        'Exception loading AU content',
        { error: e, path },
        'auManager',
      );
      console.log(e);
      setIsLoaded(false);
      setContentErrorMessage('Error loading content');
    }
  };

  return { isContentLoaded, contentErrorMessage, loadContent };
};
