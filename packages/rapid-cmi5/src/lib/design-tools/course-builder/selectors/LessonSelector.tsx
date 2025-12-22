import { MenuItem, SxProps } from '@mui/material';
import AnySelector from '../AnySelector';
import { useEffect } from 'react';
import { CourseAU } from '@rapid-cmi5/cmi5-build-common';

interface LessonSelectorProps {
  availableLessons: CourseAU[];
  currentLessonPath?: string;
  currentRepo?: string;
  disabled?: boolean;
  styleProps?: SxProps;
  onAction?: () => void;
  onSelect?: (lessonPath: string) => void;
}

/**
 * Selector Component for displaying lessons in a repository
 * @param param0 Props
 * @returns React Component
 */
export default function LessonSelector({
  availableLessons,
  currentLessonPath,
  currentRepo,
  disabled,
  onSelect,
  styleProps = {},
  onAction,
}: LessonSelectorProps) {
  const noneFound = 'No Lessons Found';
  const noRepoSel = 'No Repo Selected';

  const handleSelect = (lessonPath: string) => {
    onSelect?.(lessonPath);
  };

  const hasNoLesson =
    (!currentLessonPath && !availableLessons) || availableLessons.length === 0;

  const hasNoRepo = !currentRepo;

  useEffect(() => {
    // console.log('[Lesson Selector] currentLessonPath', currentLessonPath);
    // console.log('[Lesson Selector] availableLessons', availableLessons);
  }, [currentLessonPath, availableLessons]);

  return (
    <AnySelector
      id="lessons"
      theValue={currentLessonPath || ''}
      onChange={handleSelect}
      topicLabel="Lesson"
      hasNoOptions={hasNoLesson}
      noOptionsPlaceholder={hasNoRepo ? noRepoSel : noneFound}
      optionsPlaceholder="Select Lesson"
      iconButtonHandler={onAction}
      iconButtonTooltip="Create Lesson"
      iconButtonDisabled={false}
      styleProps={styleProps}
      selectorStyleProps={{ width: '180px' }}
    >
      {availableLessons.map((lesson) => (
        <MenuItem
          key={lesson.dirPath}
          value={lesson.dirPath}
          onClick={() => handleSelect(lesson.dirPath)}
        >
          {lesson.auName}
        </MenuItem>
      ))}
    </AnySelector>
  );
}
