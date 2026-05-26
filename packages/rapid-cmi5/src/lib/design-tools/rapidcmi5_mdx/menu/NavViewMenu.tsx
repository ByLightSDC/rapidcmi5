import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewMode,
  currentViewMode,
} from '../../../redux/courseBuilderReducer';
import { ViewModeEnum } from '../../course-builder/CourseBuilderTypes';
import { setBreadCrumbVisible } from '@rapid-cmi5/ui';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RC5Context } from '../contexts/RC5Context';

/**
 * Icons https://lucide.dev/icons/
 */
import {
  ArrowLeft,
  Files,
  GitCompareArrows,
  PanelLeftClose,
  PanelLeftOpen,
  PencilRuler,
  TriangleAlert,
} from 'lucide-react';
import { alpha, useTheme } from '@mui/system';

const navIconStyle = { position: 'relative' as const };

/**
 * Vertical nav menu for changing between MdxEditor, File Editor, and Git GUI
 * @returns
 */
export const NavViewMenu = ({
  showHomeButton,
  isLeftPanelCollapsed,
  onToggleLeftPanel,
}: {
  showHomeButton?: boolean;
  isLeftPanelCollapsed?: boolean;
  onToggleLeftPanel?: () => void;
}) => {
  const dispatch = useDispatch();
  const viewMode = useSelector(currentViewMode);
  const { isRepoConnectedToRemote, handleNavToDesigner, unpushedCommits } =
    useContext(GitContext);
  const { saveSlide } = useContext(RC5Context);
  const { promptNavAway } = useRC5Prompts();
  const [isToggleTooltipShowing, setIsToggleTooltipShowing] = useState(false);
  const theme = useTheme();
  const { palette } = theme;

  const iconColor = palette.text.secondary;

  const buildIconButtonSx = (active: boolean) => ({
    padding: '1px',
    margin: '3px',
    width: '36px',
    height: '36px',
    borderRadius: '3px',
    position: 'relative' as const,
    backgroundColor: active
      ? alpha(palette.secondary.main, 0.15)
      : 'transparent',
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: active
        ? alpha(palette.secondary.main, 0.28)
        : alpha(palette.primary.main, 0.08),
    },
    ...(active && {
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '10%',
        bottom: '10%',
        width: '1.5px',
        borderRadius: '2px',
        backgroundColor: alpha(palette.primary.main, 0.8),
      },
    }),
  });

  const iconButtonSize = 'large';

  /**
   * Indicates files changed, files staged, and unpushed commits
   */
  const gitBadgeIndicator = useMemo(() => {
    if (!isRepoConnectedToRemote) {
      return null;
    }

    return (
      <Stack
        direction="column"
        sx={{ position: 'absolute', right: -10, top: -4 }}
      >
        {unpushedCommits > 0 && (
          <Box
            sx={{
              backgroundColor: 'primary.main',
              width: '16px',
              height: '16px',
              borderRadius: 2,
            }}
          >
            <Typography
              color="common.white"
              sx={{
                fontSize: '12px',
              }}
            >
              {unpushedCommits > 99 ? '99+' : unpushedCommits}
            </Typography>
          </Box>
        )}
      </Stack>
    );
  }, [isRepoConnectedToRemote, unpushedCommits]);

  /**
   * Ensure tooltip is hiding before transition starts
   * Otherwise, the tooltip flickers on top of the RapidCMI5 logog
   */
  const onToggleClicked = () => {
    setIsToggleTooltipShowing(false);
    if (onToggleLeftPanel) {
      onToggleLeftPanel();
    }
  };

  /**
   * UE hides breadcrumbs
   */
  useEffect(() => {
    dispatch(changeViewMode(ViewModeEnum.Designer));
    dispatch(setBreadCrumbVisible(false));
    return () => {
      dispatch(setBreadCrumbVisible(true));
    };
  }, []);

  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{
        width: '48px',
        height: '100%',
        minHeight: 0,
        marginTop: '8px',
        paddingX: 2,
      }}
      spacing={0}
    >
      {showHomeButton && (
        <IconButton
          aria-label="repo-selection-button"
          data-testid="repo-selection-button"
          color="inherit"
          size={iconButtonSize}
          sx={buildIconButtonSx(viewMode === ViewModeEnum.RepoSelector)}
          disableRipple
          onClick={() => {
            if (viewMode === ViewModeEnum.Designer) {
              saveSlide();
              promptNavAway(ViewModeEnum.RepoSelector);
            } else {
              dispatch(changeViewMode(ViewModeEnum.RepoSelector));
            }
          }}
        >
          <Tooltip arrow placement="right" title="All Projects">
            <ArrowLeft
              color={iconColor}
              strokeWidth={1.25}
              style={navIconStyle}
            />
          </Tooltip>
        </IconButton>
      )}
      <Box sx={{ height: '2px' }} />
      <IconButton
        aria-label="select-design"
        color="inherit"
        size={iconButtonSize}
        sx={buildIconButtonSx(viewMode === ViewModeEnum.Designer)}
        disableRipple
        onClick={() => {
          handleNavToDesigner();
        }}
      >
        <Tooltip arrow placement="right" title="Visual Designer">
          <PencilRuler
            color={iconColor}
            strokeWidth={1.15}
            style={navIconStyle}
          />
        </Tooltip>
      </IconButton>

      <IconButton
        aria-label="select-files"
        data-testid="code-editor-button"
        color="inherit"
        size={iconButtonSize}
        sx={buildIconButtonSx(viewMode === ViewModeEnum.CodeEditor)}
        disableRipple
        onClick={() => {
          if (viewMode === ViewModeEnum.Designer) {
            saveSlide();
            promptNavAway(ViewModeEnum.CodeEditor);
          } else {
            dispatch(changeViewMode(ViewModeEnum.CodeEditor));
          }
        }}
      >
        <Tooltip arrow placement="right" title="Course Files">
          <Files color={iconColor} strokeWidth={1.15} style={navIconStyle} />
        </Tooltip>
      </IconButton>
      <IconButton
        aria-label="select-git"
        data-testid="git-editor-button"
        color="inherit"
        size={iconButtonSize}
        sx={buildIconButtonSx(viewMode === ViewModeEnum.GitEditor)}
        disableRipple
        onClick={() => {
          //REF was promptGitModal();
          if (viewMode === ViewModeEnum.Designer) {
            saveSlide();
            promptNavAway(ViewModeEnum.GitEditor);
          } else {
            dispatch(changeViewMode(ViewModeEnum.GitEditor));
          }
        }}
      >
        <Tooltip
          arrow
          placement="right"
          title={
            isRepoConnectedToRemote
              ? 'Version Control'
              : 'No remote repository configured. Click the settings ⚙️ icon to add a remote.'
          }
        >
          <Stack direction="row">
            <Box sx={navIconStyle}>
              <GitCompareArrows
                color={iconColor}
                strokeWidth={1.15}
                style={navIconStyle}
              />
              {viewMode !== ViewModeEnum.GitEditor && gitBadgeIndicator}
            </Box>
            {!isRepoConnectedToRemote && (
              <TriangleAlert
                color={palette.warning.main}
                size={9}
                style={{
                  position: 'absolute',
                  right: 1,
                  marginTop: 1,
                  padding: 0,
                }}
              />
            )}
          </Stack>
        </Tooltip>
      </IconButton>
      <Box sx={{ flexGrow: 1 }} />
      {onToggleLeftPanel && (
        <IconButton
          aria-label="toggle-left-panel"
          data-testid="toggle-left-panel-button"
          color="inherit"
          size={iconButtonSize}
          sx={buildIconButtonSx(false)}
          disableRipple
          onClick={onToggleClicked}
        >
          <Tooltip
            arrow
            enterDelay={1000}
            enterNextDelay={1000}
            open={isToggleTooltipShowing}
            onOpen={() => setIsToggleTooltipShowing(true)}
            onClose={() => setIsToggleTooltipShowing(false)}
            placement="right"
            title={isLeftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
            slotProps={{
              transition: { exit: false }
            }}
          >
            {isLeftPanelCollapsed ? (
              <PanelLeftOpen
                color={palette.text.hint}
                strokeWidth={1.25}
                style={navIconStyle}
              />
            ) : (
              <PanelLeftClose
                color={palette.text.hint}
                strokeWidth={1.25}
                style={navIconStyle}
              />
            )}
          </Tooltip>
        </IconButton>
      )}
      {/* {showHomeButton && (
        <IconButton
          aria-label="repo-selection-button"
          data-testid="repo-selection-button"
          color="inherit"
          size={iconButtonSize}
          sx={buildIconButtonSx(viewMode === ViewModeEnum.RepoSelector)}
          disableRipple
          onClick={() => {
            if (viewMode === ViewModeEnum.Designer) {
              saveSlide();
              promptNavAway(ViewModeEnum.RepoSelector);
            } else {
              dispatch(changeViewMode(ViewModeEnum.RepoSelector));
            }
          }}
        >
          <Tooltip arrow placement="right" title="All Projects">
            <ArrowLeft
              color={iconColor}
              strokeWidth={1.25}
              style={navIconStyle}
            />
          </Tooltip>
        </IconButton>
      )} */}
      <Box sx={{ height: '32px' }} />
    </Stack>
  );
};
