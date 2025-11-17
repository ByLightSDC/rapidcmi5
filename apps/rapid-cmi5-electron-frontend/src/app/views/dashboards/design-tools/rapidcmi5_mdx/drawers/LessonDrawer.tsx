import {
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
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
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
import {
  ButtonMinorUi,
  ButtonOptions,
  debugLogError,
  RowAction,
} from '@rangeos-nx/ui/branded';
import { listItemProps } from './components/LessonTreeNode';
import { useSelector } from 'react-redux';
import { Renamer } from './components/Renamer';
import { RootState } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/store';
import { RepoState } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';
import ChangeRepoExpander from './components/ChangeRepoExpander';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

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
    tooltip: 'Create Course',
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
  const {
    availableCourses,
    currentCourse,
    currentRepo,
    handleChangeRepo,
    handleChangeFileSystem,
    isElectron,
  } = useContext(GitContext);

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
  const { fileSystemType, availableRepos }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const [isRepoSelecterExpanded, setIsRepoSelecterExpanded] = useState(false);

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
        saveSlide();
        promptDownloadCourseCMI5Zip();
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
        direction="row"
        sx={{
          display: 'flex',
          alignContent: 'center',
          marginBottom: '12px',
        }}
      >
        <CourseSelector
          currentCoursePath={currentCourse?.basePath || undefined}
          currentRepo={currentRepo || undefined}
          availableCourses={availableCourses}
          disabled={!availableCourses || availableCourses?.length === 0}
          styleProps={{
            marginTop: '12px',
          }}
          //REF onAction={promptCreateCourse}
          onSelect={(coursePath: string) => {
            saveSlide();
            promptChangeCourse(coursePath);
          }}
        />

        <ButtonOptions
          optionButton={(handleClick: any, tooltip: string) => {
            return (
              <IconButton
                aria-label="apps"
                className="nodrag"
                disabled={!currentRepo}
                sx={{
                  color: 'primary',
                  maxHeight: '30px',
                  marginTop: '12px',
                }}
                onClick={handleClick}
              >
                <MoreVertIcon fontSize="inherit" color="inherit" />
              </IconButton>
            );
          }}
          closeOnClick={true}
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
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <React.Fragment key={option.tooltip}>
                {!option.hidden && (
                  <>
                    {index > 0 && <Divider />}
                    <ListItemButton
                      sx={{
                        height: 30,
                      }}
                      onClick={(event) => {
                        onCourseContextAction(event, index);
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          padding: '0px',
                          margin: '0px',
                          marginRight: '2px',
                          minWidth: '0px',
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

      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignContent: 'center',
        }}
      >
        <ButtonMinorUi
          startIcon=<AddIcon />
          disabled={!currentRepo}
          sxProps={{}}
          onClick={onCreateLesson}
        >
          Lesson
        </ButtonMinorUi>
        <ButtonMinorUi
          startIcon=<AddIcon />
          disabled={!currentRepo}
          sxProps={{ height: '30px' }}
          onClick={promptCreateCourse}
        >
          Course
        </ButtonMinorUi>
        <Tooltip
          title={
            isRepoSelecterExpanded
              ? 'Hide repository and file system options'
              : 'Show repository and file system options'
          }
          placement="top"
          arrow
        >
          <IconButton
            onClick={() => setIsRepoSelecterExpanded(!isRepoSelecterExpanded)}
            size="small"
            sx={{
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected',
              },
            }}
          >
            {isRepoSelecterExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Tooltip>
      </Stack>

      <ChangeRepoExpander
        isExpanded={isRepoSelecterExpanded}
        isElectron={isElectron}
        availableRepos={availableRepos}
        currentRepo={currentRepo}
        fileSystemType={fileSystemType}
        handleChangeFileSystem={handleChangeFileSystem}
        handleChangeRepo={handleChangeRepo}
      />

      <Stack
        direction="row"
        sx={{
          margin: '12px',
          marginBottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {/*REF <IconButton
          disabled={currentCourse?.name ? false : true}
          color="inherit"
          onClick={onCreateLesson}
        >
          <Tooltip arrow title="Create Lesson" {...tooltipStyle}>
            <AddBoxIcon />
          </Tooltip>
        </IconButton> */}
      </Stack>

      {courseData?.courseTitle ? (
        <>
          <Typography
            sx={{ color: 'text.hint', width: 'auto', marginBottom: '4px' }}
            variant="caption"
          >
            Lessons
          </Typography>
          <LessonTree courseData={courseData} />
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
