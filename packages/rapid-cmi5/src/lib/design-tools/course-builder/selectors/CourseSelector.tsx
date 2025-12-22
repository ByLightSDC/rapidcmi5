import { MenuItem, SxProps } from '@mui/material';

import AnySelector from '../AnySelector';

import { useEffect } from 'react';

import { Course } from '../../../redux/repoManagerReducer';

/**
 * Selector Component for displaying packages and L3s in a Package Group
 * @param param0 Props
 * @returns React Component
 */
export default function CourseSelector({
  availableCourses,
  currentCoursePath,
  currentRepo,
  disabled,
  onSelect,
  styleProps = {},
  onAction,
}: {
  currentCoursePath?: string;
  currentRepo?: string;
  availableCourses: Course[];
  disabled?: boolean;
  styleProps?: SxProps;
  onAction?: () => void;
  onSelect?: (coursePath: string) => void;
}) {
  const noneFound = 'No Courses Found';
  const noRepoSel = 'No Repo Selected';
  const handleSelect = (coursePath: string) => {
    if (onSelect) {
      onSelect(coursePath);
    }
  };

  //REF console.log('data', data);

  const hasNoCourse =
    (!currentCoursePath && !availableCourses) || availableCourses.length === 0;

  const hasNoRepo = !currentRepo;

  useEffect(() => {
    //REF selector doesnt always pick up default value changes
    //console.log('[Course Selector] currentCoursePath', currentCoursePath);
    //console.log('[Course Selector] availableCourses', availableCourses);
  }, [currentCoursePath, availableCourses]);

  useEffect(() => {
    //REF
    //console.log('[Course Selector] hasNoCourse', hasNoCourse);
  }, [hasNoCourse]);

  return (
    <AnySelector
      id="courses"
      data-testid='course-selector'
      theValue={currentCoursePath || ''}
      onChange={handleSelect}
      topicLabel="Course"
      hasNoOptions={hasNoCourse}
      noOptionsPlaceholder={hasNoRepo ? noRepoSel : noneFound}
      optionsPlaceholder="Select Course"
      iconButtonHandler={onAction}
      iconButtonTooltip="Create Course"
      iconButtonDisabled={false}
      styleProps={styleProps}
      selectorStyleProps={{ width: '180px' }}
    >
      {availableCourses &&
        availableCourses.map((course) => (
          <MenuItem key={course.basePath} value={course.basePath} onClick={() => handleSelect(course.basePath)}>
            {course.basePath}
          </MenuItem>
        ))}
    </AnySelector>
  );
}
