import {
  alpha,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

import { useDispatch, useSelector } from 'react-redux';
import {
  addASlide,
  currentAu,
  currentAuPath,
  currentBlock,
  currentSlideNum,
  deleteSlide,
  navigateSlide,
} from '../../../redux/courseBuilderReducer';
import { defaultSlideContent } from '@rapid-cmi5/cmi5-build-common';

import { RC5Context } from '../contexts/RC5Context';
import { useContext } from 'react';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

/**
 * Icons
 */

import { currentRepoAccessObjectSel } from '../../../redux/repoManagerReducer';
import { MUIButtonWithTooltip } from '../toolbar/components/MUIButtonWithTooltip';
import { slugifyPath } from '../../course-builder/GitViewer/utils/useCourseOperationsUtils';

/**
 * Menu to deal with adding slides, navigating slides, deleting slide
 * @param param0
 * @returns
 */
export const SlideMenu = () => {
  const dispatch = useDispatch();
  const currentSlideIndex = useSelector(currentSlideNum);
  const currentBlockIndex = useSelector(currentBlock);
  const currentAuIndex = useSelector(currentAu);

  const currentAuDir = useSelector(currentAuPath);
  const { currentRepo, handleGetUniqueFilePath } = useContext(GitContext);
  const { saveSlide, lessonSlides } = useContext(RC5Context);
  const repoAccessObject = useSelector(currentRepoAccessObjectSel);

  const onAddSlide = async () => {
    if (!currentRepo) return;
    saveSlide(); //save before navigating away from this slide
    // Insert at the next value
    const insertionPoint = currentSlideIndex + 1;
    // Go from index value to actual slide numbering starting at 1
    const slideTitle = `Slide ${insertionPoint + 1}`;

    if (!currentAuDir) {
      throw new Error('Current AU Dir has not been set');
    }

    if (!repoAccessObject) {
      throw new Error('Repo access object is required');
    }

    const filepath = await handleGetUniqueFilePath(
      repoAccessObject,
      slugifyPath(slideTitle),
      currentAuDir,
    );

    dispatch(
      addASlide({
        auIndex: currentAuIndex,
        blockIndex: currentBlockIndex,
        slide: {
          content: defaultSlideContent,
          slideTitle: slideTitle,
          filepath,
        },
        insertionPoint,
      }),
    );
  };

  const onDeleteSlide = (slideIndex?: number) => {
    const slideToDelete = slideIndex ?? currentSlideIndex;
    saveSlide();
    dispatch(
      deleteSlide({
        lessonIndex: currentAuIndex,
        slideIndex: slideToDelete,
      }),
    );
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

  const theme = useTheme();
  const { palette } = theme;
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
          backgroundColor: 'transparent',

          borderRadius: '6px',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0.2,
          paddingLeft: 1,
          paddingRight: 1,
        }}
      >
        <MUIButtonWithTooltip
          disabled={lessonSlides.length <= 1}
          sx={{ color: 'secondary' }}
          title="Delete Slide"
          aria-label="delete-slide"
          onClick={() => {
            onDeleteSlide();
          }}
        >
          <DeleteForeverIcon
            color="inherit"
            style={{
              fill:
                lessonSlides.length <= 1
                  ? theme.palette.action.disabled
                  : theme.palette.primary.main,
            }}
          />
        </MUIButtonWithTooltip>
        <MUIButtonWithTooltip
          disabled={currentSlideIndex <= 0}
          sx={{ color: 'primary' }}
          title="Previous Slide"
          aria-label="prev-slide"
          onClick={onPrevSlide}
        >
          <ArrowBackIcon
            color="inherit"
            style={{
              fill:
                currentSlideIndex <= 0
                  ? theme.palette.action.disabled
                  : theme.palette.primary.main,
            }}
          />
        </MUIButtonWithTooltip>
        <Typography
          sx={{
            height: '20px',
            color: palette.text.secondary,
          }}
        >
          {`${currentSlideIndex + 1} / ${lessonSlides.length}`}
        </Typography>
        <MUIButtonWithTooltip
          disabled={currentSlideIndex >= lessonSlides.length - 1}
          sx={{ color: 'primary' }}
          title="Next Slide"
          aria-label="next-slide"
          onClick={onNextSlide}
        >
          <ArrowForwardIcon
            color="inherit"
            style={{
              fill:
                currentSlideIndex >= lessonSlides.length - 1
                  ? theme.palette.action.disabled
                  : theme.palette.primary.main,
            }}
          />
        </MUIButtonWithTooltip>
        <MUIButtonWithTooltip
          data-testid="add-markdown-slide-button"
          disabled={lessonSlides.length < 1}
          sx={{ color: 'secondary' }}
          title="Add Slide"
          aria-label="add-markdown-slide"
          onClick={() => onAddSlide()}
        >
          <NoteAddIcon
            color="inherit"
            style={{
              fill:
                lessonSlides.length < 1
                  ? theme.palette.action.disabled
                  : theme.palette.primary.main,
            }}
          />
        </MUIButtonWithTooltip>
      </Stack>
    </Stack>
  );
};
