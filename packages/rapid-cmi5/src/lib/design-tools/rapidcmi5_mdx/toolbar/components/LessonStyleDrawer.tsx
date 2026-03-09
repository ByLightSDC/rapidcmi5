import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  Drawer,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  alpha,
  useTheme,
  Box,
  Alert,
} from '@mui/material';

/* MUI */
import Grid from '@mui/material/Grid2';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE } from './drawers';

import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaletteIcon from '@mui/icons-material/Palette';

import {
  BlockPaddingEnum,
  ContentWidthEnum,
  DefaultAlignmentEnum,
} from '@rapid-cmi5/cmi5-build-common';
import { useAuContext } from '../../data-hooks/useAuContext';
import {
  blockPaddingDescriptions,
  contentWidthDescriptions,
  defaultAlignmentLabels,
} from '../../drawers/constants';
import { RC5Context } from '../../contexts/RC5Context';
import { currentAu } from 'packages/rapid-cmi5/src/lib/redux/courseBuilderReducer';
import { ILessonNode } from '../../drawers/components/LessonTreeNode';


/**
 * LessonStyle
 * Apply styles globally
 */
export function LessonStyleDrawer() {
  useLexicalComposerContext(); // Ensures we are inside a Lexical editor context
  const drawerMode = useCellValue(drawerMode$);
  const changeViewMode = usePublisher(drawerMode$);
  const currentAuIndex = useSelector(currentAu);
  const { changeLessonTheme } = useContext(RC5Context);
  const theme = useTheme();
  const { au } = useAuContext();

  const [currentLessonNode, setLessonNode] = useState<ILessonNode>();
  const [contentWidth, setContentWidth] = useState<ContentWidthEnum>(
    ContentWidthEnum.None,
  );
  const [blockPadding, setBlockPadding] = useState<BlockPaddingEnum>(
    BlockPaddingEnum.None,
  );
  const [customPadding, setCustomPadding] = useState<number>(16);
  const [defaultAlignment, setDefaultAlignment] =
    useState<DefaultAlignmentEnum>(DefaultAlignmentEnum.Left);

  const isOpen = useMemo(() => {
    return drawerMode === DRAWER_TYPE.STYLES;
  }, [drawerMode]);

  const handleClose = useCallback(() => {
    changeViewMode(DRAWER_TYPE.NONE);
  }, [changeViewMode]);

  /**
   * apply content width changes
   */
  const handleSetContentWidth = useCallback(
    (val: ContentWidthEnum) => {
      setContentWidth(val);
      if (currentLessonNode) {
        changeLessonTheme(
          { ...au?.lessonTheme, contentWidth: val },
          currentLessonNode,
        );
      }
    },
    [currentLessonNode, au],
  );

  /**
   * apply block padding changes
   */
  const handleSetBlockPadding = useCallback(
    (val: BlockPaddingEnum) => {
      setBlockPadding(val);
      if (currentLessonNode) {
        changeLessonTheme(
          { ...au?.lessonTheme, blockPadding: val },
          currentLessonNode,
        );
      }
    },
    [currentLessonNode, au],
  );

  /**
   * apply default alignment changes
   */
  const handleSetCustomPadding = useCallback(
    (val: number) => {
      setCustomPadding(val);
      if (currentLessonNode) {
        changeLessonTheme(
          { ...au?.lessonTheme, blockPaddingCustomValue: val },
          currentLessonNode,
        );
      }
    },
    [currentLessonNode, au],
  );

  /**
   * apply default alignment changes
   */
  const handleSetDefaultAlignment = useCallback(
    (val: DefaultAlignmentEnum) => {
      setDefaultAlignment(val);
      if (currentLessonNode) {
        changeLessonTheme(
          { ...au?.lessonTheme, defaultAlignment: val },
          currentLessonNode,
        );
      }
    },
    [currentLessonNode, au],
  );

  /**
   * UE set default values from persisted lesson
   */
  useEffect(() => {
    if (au?.lessonTheme) {
      setContentWidth(au?.lessonTheme.contentWidth || ContentWidthEnum.None);
      setBlockPadding(au?.lessonTheme.blockPadding || BlockPaddingEnum.None);
      setCustomPadding(au?.lessonTheme.blockPaddingCustomValue ?? 16);
      setDefaultAlignment(
        au?.lessonTheme.defaultAlignment || DefaultAlignmentEnum.Left,
      );
    }
  }, [au, au?.lessonTheme]);

  /**
   * UE creates fake lesson node to pass to change lesson method when a setting is applied
   */
  useEffect(() => {
    setLessonNode({
      id: currentAuIndex,
      name: '',
      parent: null,
      children: [],
    });
  }, [currentAuIndex]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      variant="persistent" // Stay open while user clicks elsewhere
      onClose={handleClose}
      sx={{
        position: 'absolute',
        zIndex: 1400,
        // Higher than MUI modals (1300) and directive editors
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
      PaperProps={{
        sx: {
          zIndex: 1400, // Ensure paper also has high z-index
        },
      }}
    >
      <Stack
        id="lesson-styles"
        direction="column"
        sx={{ height: '100%', zIndex: 200 }}
        spacing={0}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            padding: 2,
            background: alpha(theme.palette.primary.main, 0.15),
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <PaletteIcon color="primary" />
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', flex: 1, marginLeft: 1 }}
          >
            Lesson Appearance
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Close Lesson Appearance"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Alert severity="info" sx={{ margin: 2 }}>
          Settings are applied to the current lesson
        </Alert>
        <Grid container sx={{ margin: 2 }}>
          {/* Content Width */}
          <Grid size={11.5}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Content Width
            </Typography>
            <ToggleButtonGroup
              value={contentWidth}
              exclusive
              onChange={(_, val) => {
                if (val !== null) {
                  handleSetContentWidth(val);
                }
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value={ContentWidthEnum.None}>None</ToggleButton>
              <ToggleButton value={ContentWidthEnum.Small}>S</ToggleButton>
              <ToggleButton value={ContentWidthEnum.Medium}>M</ToggleButton>
              <ToggleButton value={ContentWidthEnum.Large}>L</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {contentWidthDescriptions.get(contentWidth)}
            </Typography>
          </Grid>

          {/* Block Padding */}
          <Grid size={11.5} sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Block Padding
            </Typography>
            <ToggleButtonGroup
              value={blockPadding}
              exclusive
              onChange={(_, val) => {
                if (val !== null) handleSetBlockPadding(val);
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value={BlockPaddingEnum.None}>None</ToggleButton>
              <ToggleButton value={BlockPaddingEnum.Small}>S</ToggleButton>
              <ToggleButton value={BlockPaddingEnum.Medium}>M</ToggleButton>
              <ToggleButton value={BlockPaddingEnum.Large}>L</ToggleButton>
              <ToggleButton value={BlockPaddingEnum.Custom}>
                <MoreHorizIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {blockPaddingDescriptions.get(blockPadding)}
            </Typography>
            {blockPadding === BlockPaddingEnum.Custom && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Top and Bottom
                </Typography>
                <Grid container alignItems="center" spacing={2}>
                  <Grid size={9}>
                    <Slider
                      value={customPadding}
                      onChange={(_, val) =>
                        handleSetCustomPadding(val as number)
                      }
                      min={0}
                      max={64}
                      step={4}
                    />
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" textAlign="center">
                      {customPadding}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>

          {/* Default Alignment */}
          <Grid size={11.5} sx={{ mt: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Text Alignment
            </Typography>
            <ToggleButtonGroup
              value={defaultAlignment}
              exclusive
              onChange={(_, val) => {
                handleSetDefaultAlignment(val as DefaultAlignmentEnum);
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value={DefaultAlignmentEnum.Left}>
                Left
              </ToggleButton>
              <ToggleButton value={DefaultAlignmentEnum.Center}>
                Center
              </ToggleButton>
              <ToggleButton value={DefaultAlignmentEnum.Right}>
                Right
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {defaultAlignmentLabels.get(defaultAlignment) ?? 'Left'} align
              text
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    </Drawer>
  );
}
