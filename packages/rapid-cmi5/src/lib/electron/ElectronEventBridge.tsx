import { useContext } from 'react';
import { useSelector } from 'react-redux';
import type { CourseData, QuizContent } from '@rapid-cmi5/cmi5-build-common';

import { GitContext } from '../design-tools/course-builder/GitViewer/session/GitContext';
import { RC5Context } from '../design-tools/rapidcmi5_mdx/contexts/RC5Context';
import { currentCourse } from '../redux/courseBuilderReducer';
import { useElectronEvent } from '../hooks/useElectronEvents';
import {
  createNewCourseFS,
  slugifyPath,
} from '../design-tools/course-builder/GitViewer/utils/useCourseOperationsUtils';
import { getFsInstance } from '../design-tools/course-builder/GitViewer/utils/gitFsInstance';
import { fsType, RepoAccessObject } from '../redux/repoManagerReducer';
import { useCourseOperations } from '../design-tools/course-builder/GitViewer/session/useCourseOperations';
import { jsonFormatSpaces, useTimeStampUUID } from '@rapid-cmi5/ui';

/**
 * Bridges Electron events into the frontend.
 * Normally the frontend must fireoff commands to electron, this
 * allows for electron to surface events to react.
 * Especially usefull for MCP server.
 */
export const ElectronEventsBridge = () => {
  const { handleLoadCourse } = useContext(GitContext);
  const { saveCourseFile, saveMarkdownToCurrentSlide, getMarkdownData } =
    useContext(RC5Context);
  const currentCourseName = useSelector(currentCourse);
  const fsInstance = getFsInstance();
  const { generateId } = useTimeStampUUID();

  const { loadCourse } = useCourseOperations(fsInstance, null);

  const createQuiz = (quizContent: QuizContent) => {
    const quiz = {
      ...quizContent,
      rc5id: quizContent.rc5id ?? generateId(),
    };
    const currentMarkdown = getMarkdownData() ?? '';
    const quizJson = JSON.stringify(quiz, null, jsonFormatSpaces);
    const quizDirective = `:::quiz\n\`\`\`json\n${quizJson}\n\`\`\`\n:::`;
    const updatedMarkdown = `${currentMarkdown.trimEnd()}\n\n${quizDirective}\n`;

    return saveMarkdownToCurrentSlide(updatedMarkdown);
  };

  useElectronEvent<{ requestId?: string }>(
    'course:saveCourse',
    async (data) => {
      try {
        const changedFiles = await saveCourseFile();
        if (data?.requestId) {
          window.electronEvents?.send('course:saveCourse:done', {
            requestId: data.requestId,
            ok: true,
            changedFiles,
          });
        }
      } catch (error) {
        if (data?.requestId) {
          window.electronEvents?.send('course:saveCourse:done', {
            requestId: data.requestId,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },
  );

  useElectronEvent('course:refreshFrontend', async () => {
    await handleLoadCourse(currentCourseName);
  });

  useElectronEvent<{ requestId?: string }>(
    'slide:readCurrent',
    async (data) => {
      if (!data?.requestId) return;

      try {
        window.electronEvents?.send('slide:readCurrent:done', {
          requestId: data.requestId,
          ok: true,
          markdown: getMarkdownData() ?? '',
        });
      } catch (error) {
        window.electronEvents?.send('slide:readCurrent:done', {
          requestId: data.requestId,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  useElectronEvent<{ requestId?: string; markdown?: string }>(
    'slide:updateCurrent',
    async (data) => {
      if (!data?.requestId) return;

      try {
        if (typeof data.markdown !== 'string') {
          throw new Error('slide:updateCurrent requires markdown.');
        }

        const saved = saveMarkdownToCurrentSlide(data.markdown);
        if (!saved) {
          throw new Error('The editor rejected the markdown.');
        }

        window.electronEvents?.send('slide:updateCurrent:done', {
          requestId: data.requestId,
          ok: true,
        });
      } catch (error) {
        window.electronEvents?.send('slide:updateCurrent:done', {
          requestId: data.requestId,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  useElectronEvent<{ requestId?: string; quiz: QuizContent }>(
    'quiz:create',
    async (data) => {
      try {
        const saved = createQuiz(data.quiz);

        if (!saved) {
          throw new Error('The editor rejected the quiz markdown.');
        }

        if (data?.requestId) {
          window.electronEvents?.send('quiz:create:done', {
            requestId: data.requestId,
            ok: true,
          });
        }
      } catch (error) {
        if (data?.requestId) {
          window.electronEvents?.send('quiz:create:done', {
            requestId: data.requestId,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    },
  );

  useElectronEvent<{
    requestId?: string;
    course: CourseData;
    repoName: string;
  }>('course:createCourse', async (data) => {
    const r: RepoAccessObject = {
      fileSystemType: fsType.localFileSystem,
      repoName: data.repoName,
    };
    try {
      await createNewCourseFS({
        course: data.course,
        fsInstance,
        r,
      });

      await loadCourse(slugifyPath(data.course.courseTitle), r);

      if (data?.requestId) {
        window.electronEvents?.send('course:createCourse:done', {
          requestId: data.requestId,
          ok: true,
        });
      }
    } catch (error) {
      if (data?.requestId) {
        window.electronEvents?.send('course:createCourse:done', {
          requestId: data.requestId,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  });

  return null;
};
