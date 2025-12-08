import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import FileCopyIcon from '@mui/icons-material/FileCopy';

import { iconButtonStyle } from '../styles/styles';
import { useContext, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeViewMode,
  currentViewMode,
} from '../../../redux/courseBuilderReducer';
import { ViewModeEnum } from '../../course-builder/CourseBuilderTypes';
import { setBreadCrumbVisible, themeColor } from '@rangeos-nx/ui/redux';
import {
  getSvgStyleIcon,
  StyleIconTypeEnum,
} from '../styles/styleSvgConstants';
import { lightTheme } from '../../../styles/muiTheme';
import { darkTheme } from '../../../styles/muiThemeDark';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { useRC5Prompts } from '../modals/useRC5Prompts';
import { RC5Context } from '../contexts/RC5Context';

/**
 * Icons
 */
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const navIconStyle = { marginTop: '4px', position: 'relative' };

/**
 * Vertical nav menu for changing between MdxEditor, File Editor, and Git GUI
 * @returns
 */
export const NavViewMenu = () => {
  const dispatch = useDispatch();
  const themeSel = useSelector(themeColor);
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

  const disabledIconColor = lightTheme.header.buttonColor;

  const menuIconStyle = {
    ...iconButtonStyle,
    padding: '4px',
    margin: '8px',
    marginBottom: '8px',
    color: 'inherited',
    borderColor: disabledIconColor,
    borderStyle: 'solid',
    borderWidth: '0px',
    width: '36px',
    height: '36px',
  };

  const disabledMenuIconStyle = {
    ...menuIconStyle,
    borderWidth: '1px',
  };

  const gitIconDisabled = useMemo(
    () =>
      getSvgStyleIcon(StyleIconTypeEnum.GIT, {
        color: disabledIconColor,
        fontSize: 'inherit',
      }),
    [disabledIconColor],
  );

  const gitIcon = useMemo(() => {
    let iconColor = lightTheme.palette.primary.main;
    if (themeSel === 'dark') {
      iconColor = darkTheme.palette.primary.main;
    }
    return getSvgStyleIcon(StyleIconTypeEnum.GIT, {
      color: iconColor,
      fontSize: 'inherit',
    });
  }, [themeSel]);

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
        {/* ref overkill */}
        {/* {modifiedFiles.length > 0 && modifiedFiles.length === numStaged && (
          <Box
            sx={{
              backgroundColor: 'success.main',
              width: '16px',
              height: '16px',
              borderRadius: 1,
            }}
          >
            <Typography
              color="common.white"
              sx={{
                fontSize: '12px',
              }}
            >
              {numStaged}
            </Typography>
          </Box>
        )}
        {modifiedFiles.length > 0 && modifiedFiles.length !== numStaged && (
          <>
            <Box
              sx={{
                width: '16px',
                height: '16px',
                borderRadius: 1,
              }}
            >
              <Typography
                color="common.white"
                sx={{
                  fontSize: '12px',
                }}
              >
                {modifiedFiles.length}
              </Typography>
            </Box>
            {numStaged > 0 && (
              <Box
                sx={{
                  backgroundColor: 'success.main',
                  width: '16px',
                  height: '16px',
                  borderRadius: 1,
                }}
              >
                <Typography
                  color="common.white"
                  sx={{
                    fontSize: '12px',
                  }}
                >
                  {numStaged}
                </Typography>
              </Box>
            )}
          </>
        )} */}

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
              {unpushedCommits}
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
      sx={{
        width: '48px',
        height: '100%',
      }}
      spacing={0}
    >
      <IconButton
        aria-label="select-git"
        color="inherit"
        size={iconButtonSize}
        style={
          viewMode === ViewModeEnum.Designer
            ? disabledMenuIconStyle
            : menuIconStyle
        }
        onClick={() => {
          handleNavToDesigner();
          dispatch(changeViewMode(ViewModeEnum.Designer));
        }}
      >
        <Tooltip arrow placement="right" title="Visual Designer">
          {viewMode === ViewModeEnum.Designer ? (
            <div
              style={{
                color: disabledIconColor,
              }}
            >
              <DesignServicesIcon color="inherit" sx={navIconStyle} />
            </div>
          ) : (
            <DesignServicesIcon color="primary" sx={navIconStyle} />
          )}
        </Tooltip>
      </IconButton>

      <IconButton
        aria-label="select-git"
        data-testid="code-editor-button"
        color="inherit"
        size={iconButtonSize}
        style={
          viewMode === ViewModeEnum.CodeEditor
            ? disabledMenuIconStyle
            : menuIconStyle
        }
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
            <div
              style={{
                color: disabledIconColor,
              }}
            >
              <FileCopyIcon color="inherit" sx={navIconStyle} />
            </div>
          ) : (
            <FileCopyIcon color="primary" sx={navIconStyle} />
          )}
        </Tooltip>
      </IconButton>
      <IconButton
        aria-label="select-git"
        data-testid="git-editor-button"
        color="inherit"
        size={iconButtonSize}
        style={
          viewMode === ViewModeEnum.GitEditor
            ? disabledMenuIconStyle
            : menuIconStyle
        }
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
              : 'Connect to a Remote Repository'
          }
        >
          <Stack direction="row">
            <Box sx={navIconStyle}>
              {viewMode === ViewModeEnum.GitEditor ? (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>{gitIconDisabled}</>
              ) : (
                <>
                  {gitIcon}
                  {gitBadgeIndicator}
                </>
              )}
            </Box>
            {!isRepoConnectedToRemote &&
              viewMode !== ViewModeEnum.GitEditor && (
                <WarningAmberIcon
                  color="warning"
                  sx={{
                    position: 'absolute',
                    left: 22,
                    marginTop: 1,
                    padding: 0,
                    fontSize: 'medium',
                  }}
                />
              )}
          </Stack>
        </Tooltip>
      </IconButton>
    </Stack>
  );
};
