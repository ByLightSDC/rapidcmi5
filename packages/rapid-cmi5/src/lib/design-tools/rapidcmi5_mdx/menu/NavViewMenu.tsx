import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewMode,
  currentViewMode,
} from '../../../redux/courseBuilderReducer';
import { ViewModeEnum } from '../../course-builder/CourseBuilderTypes';
import { setBreadCrumbVisible } from '@rapid-cmi5/ui';
import {
  getSvgStyleIcon,
  StyleIconTypeEnum,
} from '../styles/styleSvgConstants';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RC5Context } from '../contexts/RC5Context';

/**
 * Icons
 */
import {
  ArrowLeft,
  Files,
  PanelLeft,
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
  const {
    isRepoConnectedToRemote,
    handleNavToDesigner,
    modifiedFiles,
    numStaged,
    unpushedCommits,
  } = useContext(GitContext);
  const { saveSlide } = useContext(RC5Context);
  const { promptNavAway } = useRC5Prompts();

  const theme = useTheme();
  const { palette } = theme;

  const primaryIconColor = palette.text.secondary;
  const activeIconColor = palette.text.secondary;

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

  const gitIconActive = useMemo(
    () =>
      getSvgStyleIcon(StyleIconTypeEnum.GIT, {
        color: activeIconColor,
        fontSize: 'inherit',
      }),
    [activeIconColor],
  );

  const gitIcon = useMemo(() => {
    return getSvgStyleIcon(StyleIconTypeEnum.GIT, {
      color: primaryIconColor,
      fontSize: 'inherit',
    });
  }, [primaryIconColor]);

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
  }, [isRepoConnectedToRemote, unpushedCommits, modifiedFiles, numStaged]);

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

  /**
   * UE debugging
   */
  useEffect(() => {
    //console.log('viewMode', viewMode);
  }, [viewMode]);

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
      {onToggleLeftPanel && (
        <IconButton
          aria-label="toggle-left-panel"
          data-testid="toggle-left-panel-button"
          color="warning"
          size={iconButtonSize}
          sx={buildIconButtonSx(false)}
          disableRipple
          onClick={onToggleLeftPanel}
        >
          <Tooltip
            arrow
            placement="right"
            title={isLeftPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <PanelLeft
              color={palette.text.hint}
              strokeWidth={1.25}
              style={navIconStyle}
            />
          </Tooltip>
        </IconButton>
      )}

      <IconButton
        aria-label="select-design"
        color="warning"
        size={iconButtonSize}
        sx={buildIconButtonSx(viewMode === ViewModeEnum.Designer)}
        disableRipple
        onClick={() => {
          handleNavToDesigner();
        }}
      >
        <Tooltip arrow placement="right" title="Visual Designer">
          {viewMode === ViewModeEnum.Designer ? (
            <PencilRuler
              color={activeIconColor}
              strokeWidth={1.35}
              style={navIconStyle}
            />
          ) : (
            <PencilRuler
              color={primaryIconColor}
              strokeWidth={1.25}
              style={navIconStyle}
            />
          )}
        </Tooltip>
      </IconButton>

      <IconButton
        aria-label="select-git"
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
          {viewMode === ViewModeEnum.CodeEditor ? (
            <Files
              color={activeIconColor}
              strokeWidth={1.35}
              style={navIconStyle}
            />
          ) : (
            <Files
              color={primaryIconColor}
              strokeWidth={1.25}
              style={navIconStyle}
            />
          )}
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
              {viewMode === ViewModeEnum.GitEditor ? (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>{gitIconActive}</>
              ) : (
                <>
                  {gitIcon}
                  {gitBadgeIndicator}
                </>
              )}
            </Box>
            {!isRepoConnectedToRemote &&
              viewMode !== ViewModeEnum.GitEditor && (
                <TriangleAlert
                  color={palette.warning.main}
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 20,
                    marginTop: 12,
                    padding: 0,
                  }}
                />
              )}
          </Stack>
        </Tooltip>
      </IconButton>
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
            {viewMode === ViewModeEnum.RepoSelector ? (
              <ArrowLeft
                color={activeIconColor}
                strokeWidth={1.35}
                style={navIconStyle}
              />
            ) : (
              <ArrowLeft
                color={primaryIconColor}
                strokeWidth={1.25}
                style={navIconStyle}
              />
            )}
          </Tooltip>
        </IconButton>
      )}
    </Stack>
  );
};
