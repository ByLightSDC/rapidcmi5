import {
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SaveIcon from '@mui/icons-material/Save';
import ImportExportIcon from '@mui/icons-material/ImportExport';

import {
  iconButtonSize,
  iconButtonStyle,
  textColorGray,
  tooltipStyle,
} from '../styles/styles';
import { useDispatch, useSelector } from 'react-redux';
import {
  addASlide,
  currentAuPath,
  currentSlideNum,
  deleteASlide,
  isDisplayDirty,
  navigateSlide,
} from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';
import { defaultSlideContent, SlideTypeEnum } from '@rangeos-nx/types/cmi5';
import { MessageType } from '../../course-builder/CourseBuilderTypes';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RC5Context } from '../contexts/RC5Context';
import { useContext, useMemo } from 'react';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { join } from 'path-browserify';

/**
 * Icons
 */

import {
  createUniquePath,
  slugifyPath,
} from '../../course-builder/GitViewer/session/useCourseOperations';
import { appHeaderVisible } from '@rangeos-nx/ui/redux';
import { getRepoPath } from '../../course-builder/GitViewer/utils/fileSystem';
import { currentRepoAccessObjectSel } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/repoManagerReducer';

/**
 * Menu to deal with adding slides, navigating slides, deleting slide
 * @param param0
 * @returns
 */
export const SlideMenu = () => {
  const dispatch = useDispatch();
  const currentSlideIndex = useSelector(currentSlideNum);
  const currentAuDir = useSelector(currentAuPath);
  const isAppHeaderVisible = useSelector(appHeaderVisible);
  const { currentRepo, isGitLoaded, handleGetUniqueFilePath } =
    useContext(GitContext);
  const isDirty = useSelector(isDisplayDirty);
  const { promptDownloadCourseCMI5Zip, promptSaveCourseFile } = useRC5Prompts();
  const { lessonSlides, saveSlide } = useContext(RC5Context);
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);

  const onAddSlide = async (insert?: number, trimPrevious?: boolean) => {
    if (!currentRepo) return;
    saveSlide(); //save before navigating away from this slide
    const slideTitle = `Slide ${lessonSlides.length + 1}`;

    if (!repoAccessObject) return;

    dispatch(
      addASlide({
        content: defaultSlideContent,
        display: defaultSlideContent,
        slideTitle: slideTitle,
        type: SlideTypeEnum.Markdown,
        filepath: await handleGetUniqueFilePath(
          repoAccessObject,
          slideTitle,
          currentAuDir || '',
        ),
      }),
    );
  };

  const onDeleteSlide = (slideIndex?: number) => {
    const slideToDelete = slideIndex || currentSlideIndex;
    saveSlide();
    dispatch(deleteASlide(slideToDelete));
  };

  /**
   * setCurrentSlideIndex
   */
  const onNextSlide = () => {
    saveSlide(); //save before navigating away from this slide
    dispatch(navigateSlide(currentSlideIndex + 1));
  };

  /**
   * setCurrentSlideIndex
   * @param slideNum
   */
  const onPrevSlide = () => {
    saveSlide(); //save before navigating away from this slide
    dispatch(navigateSlide(currentSlideIndex - 1));
  };

  const topOffset = useMemo(() => {
    return isAppHeaderVisible ? 88 : 48;
  }, [isAppHeaderVisible]);

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack
        direction="row"
        sx={{
          zIndex: 999,
          position: 'absolute',
          top: topOffset, //128 to bump out of toolbar area in toolbar area 82,
          marginRight: '320px', //this might be my width
          backgroundColor: 'transparent', //'#2222260D', //'background.paper' with 10% transparent,
          borderRadius: '12px',
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* <Divider orientation="vertical" flexItem /> */}
        <IconButton
          aria-label="delete-slide"
          color="primary"
          size={iconButtonSize}
          style={iconButtonStyle}
          disabled={lessonSlides.length <= 1}
          onClick={() => {
            onDeleteSlide();
          }}
        >
          <Tooltip arrow title={`Delete Current Slide`} {...tooltipStyle}>
            <DeleteForeverIcon color="inherit" />
          </Tooltip>
        </IconButton>
        <IconButton
          aria-label="prev-slide"
          color="inherit"
          disabled={currentSlideIndex <= 0}
          style={iconButtonStyle}
          onClick={onPrevSlide}
        >
          <ArrowBackIcon color="inherit" />
        </IconButton>
        <Typography
          sx={{
            height: '20px',
            color: textColorGray,
          }}
        >
          {`${currentSlideIndex + 1} / ${lessonSlides.length}`}
        </Typography>
        <IconButton
          aria-label="next-slide"
          disabled={currentSlideIndex >= lessonSlides.length - 1}
          style={iconButtonStyle}
          color="inherit"
          onClick={onNextSlide}
        >
          <ArrowForwardIcon color="inherit" />
        </IconButton>

        <IconButton
          aria-label="add-markdown-slide"
          color="primary"
          size={iconButtonSize}
          style={iconButtonStyle}
          onClick={() => onAddSlide()}
        >
          <Tooltip arrow title={`Add Slide`} {...tooltipStyle}>
            <NoteAddIcon color="primary" />
          </Tooltip>
        </IconButton>
        {isGitLoaded ? (
          <IconButton
            className={isDirty ? 'blink-animation' : undefined}
            aria-label="save-files"
            disabled={!isDirty}
            color="inherit"
            size={iconButtonSize}
            style={{
              ...iconButtonStyle,
              boxShadow: isDirty
                ? '0 0 0 3px rgba(234, 147, 16, .50)'
                : undefined,
            }}
            onClick={() => {
              saveSlide();
              promptSaveCourseFile(undefined, undefined, {
                notify: MessageType.remountLesson,
              });
            }}
          >
            <Tooltip arrow title={`Save Files`} {...tooltipStyle}>
              <SaveIcon color="inherit" />
            </Tooltip>
          </IconButton>
        ) : (
          <Tooltip title="Initializing Git repository - save functionality will be enabled soon.">
            <CircularProgress size="1.5rem" />
          </Tooltip>
        )}
        {/* <IconButton
          aria-label="download-cmi5-zip"
          color="inherit"
          disabled={lessonSlides.length <= 0}
          style={iconButtonStyle}
          onClick={() => {
            saveSlide();
            promptDownloadCourseCMI5Zip();
          }}
        >
          <Tooltip title="Publish Course" {...tooltipStyle}>
            <Stack direction="row">
              <ImportExportIcon />
              <FolderZipIcon color="inherit" />
            </Stack>
          </Tooltip>
        </IconButton> */}
        <div
          id="preview-icon-target"
          style={{ width: '60px', height: '30px' }}
        ></div>
      </Stack>
    </Stack>
  );
};
