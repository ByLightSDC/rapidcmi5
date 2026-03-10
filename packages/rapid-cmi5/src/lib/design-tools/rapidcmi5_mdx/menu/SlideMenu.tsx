import {
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

import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../styles/styles';
import { useDispatch, useSelector } from 'react-redux';
import {
  addASlide,
  currentAuPath,
  currentSlideNum,
  deleteASlide,
  navigateSlide,
} from '../../../redux/courseBuilderReducer';
import {
  defaultSlideContent,
  SlideTypeEnum,
} from '@rapid-cmi5/cmi5-build-common';

import { RC5Context } from '../contexts/RC5Context';
import { useContext } from 'react';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';

/**
 * Icons
 */

import { appHeaderVisible } from '@rapid-cmi5/ui';
import { currentRepoAccessObjectSel } from '../../../redux/repoManagerReducer';
import { MUIButtonWithTooltip } from '../toolbar/components/MUIButtonWithTooltip';

/**
 * Menu to deal with adding slides, navigating slides, deleting slide
 * @param param0
 * @returns
 */
export const SlideMenu = () => {
  const dispatch = useDispatch();
  const currentSlideIndex = useSelector(currentSlideNum);
  const currentAuDir = useSelector(currentAuPath);
  const { currentRepo, isGitLoaded, handleGetUniqueFilePath } =
    useContext(GitContext);
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
          <DeleteForeverIcon color="inherit" />
        </MUIButtonWithTooltip>
        <MUIButtonWithTooltip
          disabled={currentSlideIndex <= 0}
          sx={{ color: 'secondary' }}
          title="Previous Slide"
          aria-label="prev-slide"
          onClick={onPrevSlide}
        >
          <ArrowBackIcon color="inherit" />
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
          sx={{ color: 'secondary' }}
          title="Next Slide"
          aria-label="next-slide"
          onClick={onNextSlide}
        >
          <ArrowForwardIcon color="inherit" />
        </MUIButtonWithTooltip>
        <MUIButtonWithTooltip
          data-testid="add-markdown-slide-button"
          disabled={lessonSlides.length < 1}
          sx={{ color: 'secondary' }}
          title="Add Slide"
          aria-label="add-markdown-slide"
          onClick={() => onAddSlide()}
        >
          <NoteAddIcon color="primary" />
        </MUIButtonWithTooltip>
      </Stack>
    </Stack>
  );
};
