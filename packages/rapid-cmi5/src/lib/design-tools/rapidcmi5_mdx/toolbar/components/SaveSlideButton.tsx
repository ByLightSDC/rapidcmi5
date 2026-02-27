import {
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';

import { useSelector } from 'react-redux';
import {
  iconButtonSize,
  iconButtonStyle,
  tooltipStyle,
} from '../../styles/styles';


/** Icons */
import SaveIcon from '@mui/icons-material/Save';

import { useContext } from 'react';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';
import { isDisplayDirty } from 'packages/rapid-cmi5/src/lib/redux/courseBuilderReducer';
import { useRC5Prompts } from '../../modals/useRC5Prompts';
import { RC5Context } from '../../contexts/RC5Context';
import { MessageType } from '../../../course-builder/CourseBuilderTypes';

/**
 * Save Button
 * saves changes to slide
 * blinks to communicate pending changes
 * @returns
 */
export const SaveSlideButton = () => {
  const { isGitLoaded } = useContext(GitContext);
  const isDirty = useSelector(isDisplayDirty);
  const { promptSaveCourseFile } = useRC5Prompts();
  const { saveSlide } = useContext(RC5Context);

  return (
    <>
      {isGitLoaded ? (
        <IconButton
          className={isDirty ? 'blink-animation' : undefined}
          aria-label="save-files"
          data-testid="save-files-button"
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
    </>
  );
};
