import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValue, usePublisher } from '@mdxeditor/gurx';

import { drawerMode$, DRAWER_TYPE, stylesShowSeq$ } from '../drawers';

import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

import { useDrawerAutoHide } from '../useDrawerAutoHide';

import {
  BlockPaddingEnum,
  ContentWidthEnum,
  DefaultAlignmentEnum,
} from '@rapid-cmi5/cmi5-build-common';
import { useAuContext } from '../../../data-hooks/useAuContext';
import { ThemeContext } from '../../../contexts/ThemeContext';
import { ILessonNode } from '../../../drawers/components/LessonTreeNode';
import {
  courseDataCache,
  currentAu,
  currentBlock,
} from '../../../../../redux/courseBuilderReducer';
import ThemeSettingsForm from './ThemeSettingsForm';

type ThemeTab = 'lesson' | 'course';

/**
 * Combined lesson + course appearance drawer. Switch between scopes via
 * the tabs at the top; each tab edits its own theme on the AU /
 * courseData respectively.
 */
export function LessonStyleDrawer() {
  useLexicalComposerContext(); // Ensures we are inside a Lexical editor context
  const drawerMode = useCellValue(drawerMode$);
  const changeViewMode = usePublisher(drawerMode$);
  const currentAuIndex = useSelector(currentAu);
  const currentBlockIndex = useSelector(currentBlock);
  const courseData = useSelector(courseDataCache);

  const { changeLessonTheme, changeCourseTheme } = useContext(ThemeContext);

  const theme = useTheme();
  const { au } = useAuContext();

  const [activeTab, setActiveTab] = useState<ThemeTab>('lesson');

  // ── Lesson-scope state ──────────────────────────────────────────
  const [currentLessonNode, setLessonNode] = useState<ILessonNode>();
  const [lessonContentWidth, setLessonContentWidth] = useState<ContentWidthEnum>(
    ContentWidthEnum.None,
  );
  const [lessonBlockPadding, setLessonBlockPadding] = useState<BlockPaddingEnum>(
    BlockPaddingEnum.None,
  );
  const [lessonCustomPadding, setLessonCustomPadding] = useState<number>(16);
  const [lessonDefaultAlignment, setLessonDefaultAlignment] =
    useState<DefaultAlignmentEnum>(DefaultAlignmentEnum.Left);
  const [lessonDefaultActivityAlignment, setLessonDefaultActivityAlignment] =
    useState<DefaultAlignmentEnum>(DefaultAlignmentEnum.Center);
  const [lessonLogoLight, setLessonLogoLight] = useState<string>('');
  const [lessonLogoDark, setLessonLogoDark] = useState<string>('');

  // ── Course-scope state ──────────────────────────────────────────
  const [courseContentWidth, setCourseContentWidth] = useState<ContentWidthEnum>(
    ContentWidthEnum.None,
  );
  const [courseBlockPadding, setCourseBlockPadding] = useState<BlockPaddingEnum>(
    BlockPaddingEnum.None,
  );
  const [courseCustomPadding, setCourseCustomPadding] = useState<number>(16);
  const [courseDefaultAlignment, setCourseDefaultAlignment] =
    useState<DefaultAlignmentEnum>(DefaultAlignmentEnum.Left);
  const [courseDefaultActivityAlignment, setCourseDefaultActivityAlignment] =
    useState<DefaultAlignmentEnum>(DefaultAlignmentEnum.Center);
  const [courseLogoLight, setCourseLogoLight] = useState<string>('');
  const [courseLogoDark, setCourseLogoDark] = useState<string>('');

  const isOpen = useMemo(
    () => drawerMode === DRAWER_TYPE.STYLES,
    [drawerMode],
  );

  const showSeq = useCellValue(stylesShowSeq$);

  const handleClose = useCallback(() => {
    changeViewMode(DRAWER_TYPE.NONE);
  }, [changeViewMode]);

  const {
    autoHide,
    toggleAutoHide,
    handleMouseEnter,
    handleMouseLeave,
    effectiveOpen,
    getDrawerSx,
  } = useDrawerAutoHide('styles', isOpen, showSeq);

  // ── Lesson handlers ─────────────────────────────────────────────
  const applyLessonChange = useCallback(
    (patch: Record<string, unknown>) => {
      if (!currentLessonNode) return;
      changeLessonTheme(
        { ...au?.lessonTheme, ...patch },
        currentLessonNode,
      );
    },
    [au, currentLessonNode, changeLessonTheme],
  );

  const handleSetLessonContentWidth = useCallback(
    (val: ContentWidthEnum) => {
      setLessonContentWidth(val);
      applyLessonChange({ contentWidth: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonBlockPadding = useCallback(
    (val: BlockPaddingEnum) => {
      setLessonBlockPadding(val);
      applyLessonChange({ blockPadding: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonCustomPadding = useCallback(
    (val: number) => {
      setLessonCustomPadding(val);
      applyLessonChange({ blockPaddingCustomValue: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonDefaultAlignment = useCallback(
    (val: DefaultAlignmentEnum) => {
      setLessonDefaultAlignment(val);
      applyLessonChange({ defaultAlignment: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonDefaultActivityAlignment = useCallback(
    (val: DefaultAlignmentEnum) => {
      setLessonDefaultActivityAlignment(val);
      applyLessonChange({ defaultActivityAlignment: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonLightLogo = useCallback(
    (val: string) => {
      setLessonLogoLight(val);
      applyLessonChange({ lessonLogoLight: val });
    },
    [applyLessonChange],
  );
  const handleSetLessonDarkLogo = useCallback(
    (val: string) => {
      setLessonLogoDark(val);
      applyLessonChange({ lessonLogoDark: val });
    },
    [applyLessonChange],
  );

  // ── Course handlers ─────────────────────────────────────────────
  const applyCourseChange = useCallback(
    (patch: Record<string, unknown>) => {
      changeCourseTheme({ ...courseData.courseTheme, ...patch });
    },
    [courseData, changeCourseTheme],
  );

  const handleSetCourseContentWidth = useCallback(
    (val: ContentWidthEnum) => {
      setCourseContentWidth(val);
      applyCourseChange({ contentWidth: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseBlockPadding = useCallback(
    (val: BlockPaddingEnum) => {
      setCourseBlockPadding(val);
      applyCourseChange({ blockPadding: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseCustomPadding = useCallback(
    (val: number) => {
      setCourseCustomPadding(val);
      applyCourseChange({ blockPaddingCustomValue: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseDefaultAlignment = useCallback(
    (val: DefaultAlignmentEnum) => {
      setCourseDefaultAlignment(val);
      applyCourseChange({ defaultAlignment: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseDefaultActivityAlignment = useCallback(
    (val: DefaultAlignmentEnum) => {
      setCourseDefaultActivityAlignment(val);
      applyCourseChange({ defaultActivityAlignment: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseLightLogo = useCallback(
    (val: string) => {
      setCourseLogoLight(val);
      applyCourseChange({ lessonLogoLight: val });
    },
    [applyCourseChange],
  );
  const handleSetCourseDarkLogo = useCallback(
    (val: string) => {
      setCourseLogoDark(val);
      applyCourseChange({ lessonLogoDark: val });
    },
    [applyCourseChange],
  );

  // Seed lesson-scope state from the active AU
  useEffect(() => {
    setLessonContentWidth(
      au?.lessonTheme?.contentWidth ?? ContentWidthEnum.None,
    );
    setLessonBlockPadding(
      au?.lessonTheme?.blockPadding ?? BlockPaddingEnum.None,
    );
    setLessonCustomPadding(au?.lessonTheme?.blockPaddingCustomValue ?? 16);
    setLessonDefaultAlignment(
      au?.lessonTheme?.defaultAlignment ?? DefaultAlignmentEnum.Left,
    );
    setLessonDefaultActivityAlignment(
      au?.lessonTheme?.defaultActivityAlignment ?? DefaultAlignmentEnum.Center,
    );
    setLessonLogoLight(au?.lessonTheme?.lessonLogoLight ?? '');
    setLessonLogoDark(au?.lessonTheme?.lessonLogoDark ?? '');
  }, [au, currentAuIndex]);

  // Seed course-scope state from courseData.courseTheme
  useEffect(() => {
    const ct = courseData.courseTheme;
    setCourseContentWidth(ct?.contentWidth ?? ContentWidthEnum.None);
    setCourseBlockPadding(ct?.blockPadding ?? BlockPaddingEnum.None);
    setCourseCustomPadding(ct?.blockPaddingCustomValue ?? 16);
    setCourseDefaultAlignment(ct?.defaultAlignment ?? DefaultAlignmentEnum.Left);
    setCourseDefaultActivityAlignment(
      ct?.defaultActivityAlignment ?? DefaultAlignmentEnum.Center,
    );
    setCourseLogoLight(ct?.lessonLogoLight ?? '');
    setCourseLogoDark(ct?.lessonLogoDark ?? '');
  }, [courseData.courseTheme]);

  // Fake lesson node for the lesson-theme handler
  useEffect(() => {
    setLessonNode({
      id: currentAuIndex,
      lesson: currentAuIndex,
      name: '',
      parent: null,
      children: [],
      block: currentBlockIndex,
    });
  }, [currentAuIndex, currentBlockIndex]);

  return (
    <Drawer
      anchor="right"
      open={effectiveOpen}
      variant="persistent"
      onClose={handleClose}
      sx={getDrawerSx({
        position: 'absolute',
        zIndex: 1400,
        pointerEvents: 'none',
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
          zIndex: 1400,
          pointerEvents: 'auto',
        },
      })}
      PaperProps={{
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        sx: { zIndex: 1400 },
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
            Appearance
          </Typography>
          <Tooltip
            title={
              autoHide
                ? 'Auto-hide on (click to pin)'
                : 'Auto-hide off (click to enable)'
            }
          >
            <IconButton
              onClick={toggleAutoHide}
              aria-label={autoHide ? 'Disable auto-hide' : 'Enable auto-hide'}
              size="small"
              sx={{ color: autoHide ? 'primary.main' : 'text.disabled' }}
            >
              {autoHide ? (
                <PushPinOutlinedIcon fontSize="small" />
              ) : (
                <PushPinIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleClose} aria-label="Close Appearance">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_, val: ThemeTab) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="lesson" label="Lesson" />
          <Tab value="course" label="Course" />
        </Tabs>

        {activeTab === 'lesson' ? (
          <ThemeSettingsForm
            scopeLabel="Settings are applied to the current lesson"
            logoCaption="This logo will appear at the top left of the lesson"
            contentWidth={lessonContentWidth}
            blockPadding={lessonBlockPadding}
            customPadding={lessonCustomPadding}
            defaultAlignment={lessonDefaultAlignment}
            defaultActivityAlignment={lessonDefaultActivityAlignment}
            lightLogo={lessonLogoLight}
            darkLogo={lessonLogoDark}
            onSetContentWidth={handleSetLessonContentWidth}
            onSetBlockPadding={handleSetLessonBlockPadding}
            onSetCustomPadding={handleSetLessonCustomPadding}
            onSetDefaultAlignment={handleSetLessonDefaultAlignment}
            onSetDefaultActivityAlignment={
              handleSetLessonDefaultActivityAlignment
            }
            onSetLightLogo={handleSetLessonLightLogo}
            onSetDarkLogo={handleSetLessonDarkLogo}
          />
        ) : (
          <ThemeSettingsForm
            scopeLabel="Settings are applied to the entire course"
            logoCaption="This logo will appear at the top left of the course"
            contentWidth={courseContentWidth}
            blockPadding={courseBlockPadding}
            customPadding={courseCustomPadding}
            defaultAlignment={courseDefaultAlignment}
            defaultActivityAlignment={courseDefaultActivityAlignment}
            lightLogo={courseLogoLight}
            darkLogo={courseLogoDark}
            onSetContentWidth={handleSetCourseContentWidth}
            onSetBlockPadding={handleSetCourseBlockPadding}
            onSetCustomPadding={handleSetCourseCustomPadding}
            onSetDefaultAlignment={handleSetCourseDefaultAlignment}
            onSetDefaultActivityAlignment={
              handleSetCourseDefaultActivityAlignment
            }
            onSetLightLogo={handleSetCourseLightLogo}
            onSetDarkLogo={handleSetCourseDarkLogo}
          />
        )}
      </Stack>
    </Drawer>
  );
}
