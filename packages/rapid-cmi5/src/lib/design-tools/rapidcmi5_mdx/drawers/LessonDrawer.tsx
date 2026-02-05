import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

import CourseSelector from '../../course-builder/selectors/CourseSelector';
import LessonTree from './components/LessonTree';
import {
  courseDataCache,
  currentBlock,
} from '../../../redux/courseBuilderReducer';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RC5Context } from '../contexts/RC5Context';

/**
 * Icons
 */
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ImportExportIcon from '@mui/icons-material/ImportExport';

//import SettingsIcon from '@mui/icons-material/Settings';
import { debugLogError, RowAction } from '@rapid-cmi5/ui';
import { listItemProps } from './components/LessonTreeNode';
import { useSelector } from 'react-redux';
import { Renamer } from './components/Renamer';

import { ButtonOptions, ButtonMinorUi } from '@rapid-cmi5/ui';

/** Order important actions */
export enum CourseActionEnum {
  TriggerRename, // this will be hidden to just bring up edit field
  Create,
  Rename,
  Publish,
  Delete,
}

/**
 * context menu for course
 */
const courseActions = [
  // {
  //   tooltip: 'Course Settings',
  //   icon: <SettingsIcon color="inherit" />,
  // },
  {
    tooltip: 'Rename Course',
    icon: <EditIcon color="inherit" />,
    hidden: true, // hidden for showing the edit field to rename course
  },
  {
    tooltip: 'Course',
    icon: <AddIcon color="inherit" />,
  },
  {
    tooltip: 'Rename Course',
    icon: <EditIcon color="inherit" />,
  },
  {
    tooltip: 'Publish Course',
    icon: (
      <Stack direction="row">
        <ImportExportIcon />
        <FolderZipIcon color="inherit" />
      </Stack>
    ),
  },
  {
    tooltip: 'Delete Course',
    icon: <DeleteForeverIcon color="inherit" />,
  },
];

/**
 * Drawer for Visual Designer view
 * Displays course and lesson tree (TODO)
 * @returns
 */
export const LessonDrawer = () => {
  const { availableCourses, currentCourse, currentRepo } =
    useContext(GitContext);

  const courseData = useSelector(courseDataCache);
  const currentBlockIndex = useSelector(currentBlock);
  const { changeCourseName, saveSlide } = useContext(RC5Context);
  const {
    promptChangeCourse,
    promptCreateCourse,
    promptCreateLesson,
    promptDeleteCourse,
    promptDownloadCourseCMI5Zip,
  } = useRC5Prompts();

  const [menuAnchor, setMenuAnchor] = useState<any>(null);
  const [menuAnchorPos, setMenuAnchorPos] = useState<number[]>([0, 0]);

  const onCreateLesson = useCallback(() => {
    saveSlide();
    if (!currentCourse) {
      debugLogError('No course selected');
      return;
    }
    if (
      !courseData ||
      !courseData.blocks ||
      !courseData.blocks[currentBlockIndex]
    ) {
      debugLogError('Course data not available');
      return;
    }
    promptCreateLesson(
      courseData.courseTitle,
      courseData.blocks[currentBlockIndex].blockName,
      currentCourse?.basePath,
    );
  }, [courseData, currentBlockIndex, promptCreateLesson, saveSlide]);

  const publishCourse = () => {
    saveSlide();
    promptDownloadCourseCMI5Zip();
  };
  const onCourseContextAction = (event: any, whichAction: number) => {
    switch (whichAction) {
      // case CourseActionEnum.Configure:
      //   break;
      case CourseActionEnum.TriggerRename:
        setMenuAnchorPos([event.clientX - 60, event.clientY + 20]);
        break;
      case CourseActionEnum.Create:
        promptCreateCourse();
        break;
      case CourseActionEnum.Rename:
        setMenuAnchor(event.target);
        break;
      case CourseActionEnum.Delete:
        if (currentCourse?.basePath) {
          promptDeleteCourse(currentCourse.basePath, currentCourse.basePath);
        }
        break;
      case CourseActionEnum.Publish:
        publishCourse();
        break;
    }
  };

  const handleCancelNameChange = () => {
    setMenuAnchor(null);
  };

  const updateCourseName = (newName: string, record: any) => {
    changeCourseName(newName);
  };

  return (
    <Stack
      sx={{
        backgroundColor: 'background.default',
        height: '100%',
        padding: '8px',
        overflowY: 'auto',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
        VISUAL DESIGNER
      </Typography>

      <Stack
        direction="column"
        spacing={1}
        sx={{
          mb: 1,
          p: 1,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 1,
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
          }}
        >
          {/* Col 1 */}
          <Box>
            <CourseSelector
              currentCoursePath={currentCourse?.basePath || undefined}
              currentRepo={currentRepo || undefined}
              availableCourses={availableCourses}
              disabled={!availableCourses || availableCourses?.length === 0}
              onSelect={(coursePath: string) => {
                saveSlide();
                promptChangeCourse(coursePath);
              }}
            />
          </Box>

          {/* Col 2 */}
          <Tooltip
            title={
              currentRepo ? 'Create course' : 'Select a repo to create a course'
            }
          >
            <span>
              <IconButton
                aria-label="create new course"
                id="create-course-button"
                data-testid="create-course-button"
                disabled={!currentRepo}
                onClick={promptCreateCourse}
                size="small"
                sx={(theme) => ({
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`,
                  transition:
                    'transform 120ms ease, background-color 120ms ease',
                  '&:hover': {
                    bgcolor: theme.palette.action.selected,
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-disabled': { opacity: 0.45 },
                })}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          {/* Col 3 */}
          <ButtonOptions
            optionButton={(handleClick: any) => (
              <Tooltip title="More Options">
                <span>
                  <IconButton
                    aria-label="course options"
                    className="nodrag"
                    disabled={!currentRepo}
                    size="small"
                    onClick={handleClick}
                    sx={(theme) => ({
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': { bgcolor: theme.palette.action.selected },
                      '&.Mui-disabled': { opacity: 0.45 },
                    })}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            closeOnClick
            onTrigger={(event?: any) => {
              onCourseContextAction(event, CourseActionEnum.TriggerRename);
            }}
          >
            <List
              sx={{
                backgroundColor: (theme: any) => `${theme.nav.fill}`,
                color: (theme: any) => `${theme.nav.icon}`,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: 'auto',
              }}
              component="nav"
            >
              <Typography sx={{ marginLeft: '12px' }} variant="caption">
                {courseData?.courseTitle || 'No Course Selected'}
              </Typography>

              {courseActions.map((option: RowAction, index: number) => (
                <React.Fragment key={option.tooltip}>
                  {!option.hidden && (
                    <>
                      {index > 0 && <Divider />}
                      <ListItemButton
                        sx={{ height: 30 }}
                        onClick={(event) => onCourseContextAction(event, index)}
                      >
                        <ListItemIcon
                          sx={{
                            p: 0,
                            m: 0,
                            mr: '2px',
                            minWidth: 0,
                          }}
                        >
                          {option.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={option.tooltip}
                          slotProps={{ primary: listItemProps }}
                        />
                      </ListItemButton>
                    </>
                  )}
                </React.Fragment>
              ))}
            </List>
          </ButtonOptions>

          {/* Row 2: Publish spans ALL columns */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <ButtonMinorUi
              id="publish-course-button"
              startIcon={<PublishIcon />}
              disabled={!currentRepo}
              onClick={publishCourse}
              fullWidth
              sx={(theme) => ({
                borderRadius: 1,
                fontWeight: 700,
              })}
            >
              Publish
            </ButtonMinorUi>
          </Box>
        </Box>
      </Stack>

      {menuAnchor && (
        <Renamer
          anchor={menuAnchor}
          anchorPos={menuAnchorPos}
          element={{
            id: '',
            name: courseData?.courseTitle || '',
            parent: '',
            children: [],
          }}
          onClose={handleCancelNameChange}
          onSave={updateCourseName}
        />
      )}
      {courseData?.courseTitle ? (
        <>
          <Typography
            sx={{ color: 'text.hint', width: 'auto', marginBottom: '4px' }}
            variant="caption"
          >
            Lessons
          </Typography>
          <LessonTree courseData={courseData} onCreateLesson={onCreateLesson} />
          
        </>
      ) : (
        <Typography
          sx={{ color: 'text.hint', width: 'auto', marginBottom: '4px' }}
          variant="caption"
        >
          Please create a course to get started.
        </Typography>
      )}
    </Stack>
  );
};
