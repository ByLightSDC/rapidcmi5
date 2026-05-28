import { createContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CourseAU, LessonTheme } from '@rapid-cmi5/cmi5-build-common';
import { debugLogError } from '@rapid-cmi5/ui';

import {
  courseDataCache,
  currentAu,
  currentBlock,
  setCourseTheme,
  updateCourseAuData,
  updateDirtyDisplay,
} from '../../../redux/courseBuilderReducer';
import { ILessonNode } from '../drawers/components/LessonTreeNode';

interface tProviderProps {
  children?: JSX.Element;
}

interface IThemeContext {
  changeLessonTheme: (theme: LessonTheme, element: ILessonNode) => void;
  changeCourseTheme: (theme: LessonTheme) => void;
  getLessonTheme: () => LessonTheme;
}

export const ThemeContext = createContext<IThemeContext>({
  changeLessonTheme: (theme: LessonTheme, element: ILessonNode) => {
    return;
  },
  changeCourseTheme: (theme: LessonTheme) => {
    return;
  },
  getLessonTheme: () => ({}),
});

export const ThemeContextProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const dispatch = useDispatch();
  const courseData = useSelector(courseDataCache);
  const currentBlockIndex = useSelector(currentBlock);
  const currentAuIndex = useSelector(currentAu);

  const onChangeLessonTheme = useCallback(
    (lessonTheme: LessonTheme, element: ILessonNode) => {
      if (element.id === undefined) {
        return;
      }
      const lessonIndex = element.id as number;

      const originalAu =
        courseData?.blocks?.[currentBlockIndex]?.aus?.[lessonIndex];
      if (!originalAu) {
        debugLogError(
          'Course data or AU not available for lesson theme change',
        );
        return;
      }

      const au: CourseAU = {
        ...originalAu,
        lessonTheme,
      };

      dispatch(
        updateCourseAuData({
          au,
          blockIndex: currentBlockIndex,
          lessonIndex,
        }),
      );
      // dispatch(setDefaultLessonTheme(lessonTheme));
      dispatch(updateDirtyDisplay({ reason: 'change lesson theme settings' }));
    },
    [courseData, currentBlockIndex, dispatch],
  );

  const onChangeCourseTheme = useCallback(
    (courseTheme: LessonTheme) => {
      dispatch(setCourseTheme(courseTheme));
      dispatch(updateDirtyDisplay({ reason: 'change course theme settings' }));
    },
    [dispatch],
  );

  const getLessonTheme = useCallback((): LessonTheme => {
    const courseTheme = courseData?.courseTheme ?? {};
    const lessonTheme =
      courseData?.blocks?.[currentBlockIndex]?.aus?.[currentAuIndex]
        ?.lessonTheme ?? {};
    return { ...courseTheme, ...lessonTheme };
  }, [courseData, currentBlockIndex, currentAuIndex]);

  return (
    <ThemeContext.Provider
      value={{
        changeLessonTheme: onChangeLessonTheme,
        changeCourseTheme: onChangeCourseTheme,
        getLessonTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
