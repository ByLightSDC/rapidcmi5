/* MUI */
import Alert, { AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

/* ICONS */
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DangerousIcon from '@mui/icons-material/Dangerous';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PauseIcon from '@mui/icons-material/Pause';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RepartitionIcon from '@mui/icons-material/Repartition';
import ReplayIcon from '@mui/icons-material/Replay';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { ButtonLoadingUi } from '../inputs/buttons/buttons';

import { ButtonModalCancelUi } from '../inputs/buttons/buttonsmodal';
import React, { Fragment } from 'react';

/**
 * @interface ModalDialogProps
 * @prop {DialogProps} dialogProps Basic MUI props associated with a dialog
 * @prop {string | JSX.Element} [alertMessage] Alert text or element to display in dialog
 * @prop {string} [alertTitle] Title for alert
 * @prop {AlertColor} [alertSeverity] Indication of type of alert to display
 * @prop {string[]} [buttons] Override button(s) to display at bottom of dialog (vs just OK)
 * @prop {JSX.Element} [children] Additional item(s) to render in dialog
 * @prop {boolean} [disableSubmit] Indication to disable the Submit button (should be last button in button array prop)
 * @prop {boolean} [isLoading] Indication that data is currently loading
 * @prop {any} [maxWidth] Override maximum width of dialog
 * @prop {string | JSX.Element} [message] Message to display at top of dialog
 * @prop {any} [shouldBlockInteraction = true] If true, events will not propogate to content underneath dialog
 * @prop {any} [sxProps] Additional styling props
 * @prop {string} [testId] Test id to assign the dialog
 * @prop {string} [title] Title for dialog
 * @prop {(index: number) => void} [handleAction] Method to call when a button is clicked
 */
interface ModalDialogProps {
  dialogProps: DialogProps;
  dialogContentProps?: any;
  alertMessage?: string | JSX.Element;
  alertTitle?: string;
  alertSeverity?: AlertColor;
  buttons?: string[];
  children?: JSX.Element;

  disableSubmit?: boolean;
  isLoading?: boolean;
  maxWidth?: any;
  message?: string | JSX.Element;
  shouldBlockInteraction?: boolean;
  shouldClickAway?: boolean;
  specialCancelLayout?: string;
  sxProps?: any;
  testId?: string;

  title?: string | JSX.Element;
  titleSeverity?: AlertColor;
  handleAction?: (index: number) => void;
}

/**
 * Provides Dialog display
 * @param {ModalDialogProps} props dialog props
 * @returns {React.ReactElement}
 */
export function ModalDialog(props: ModalDialogProps) {
  const {
    title = '',
    titleSeverity,
    maxWidth = 'sm', // for larger dialogs pass 'md'
    children,
    message,
    alertTitle = '',
    alertMessage,
    alertSeverity = 'error',
    buttons = ['Ok'],
    dialogProps,
    dialogContentProps,
    disableSubmit = false,
    isLoading = false,
    shouldBlockInteraction = true,
    shouldClickAway = false,
    specialCancelLayout,
    sxProps = {},
    testId = 'dialog',
    handleAction,
  } = props;

  const handleClick = (index = -1) => {
    if (handleAction) {
      handleAction(index);
    }
  };

  const getIcon = (buttonText: string) => {
    switch (buttonText) {
      case 'delete':
      case 'remove':
        return <DeleteIcon />;
      case 'apply':
        return <DoneIcon />;
      case 'deploy':
        return <RocketLaunchIcon />;
      case 'discard':
        return <ReplayIcon />;
      case 'download':
        return <CloudDownloadIcon />;
      case 'export':
        return <FileUploadIcon />;
      case 'insert':
        return <AddIcon />;
      case 'restore':
        return <RepartitionIcon />;
      case 'pause':
        return <PauseIcon />;
      case 'resume':
      case 'save':
        return <CheckIcon />;
      case 'start':
        return <PlayArrowIcon />;
      case 'snapshot':
        return <PhotoCameraIcon />;
      case 'stop':
        return <DangerousIcon color="error" />;
      default:
        break;
    }
    return null;
  };

  const getTitleIcon = (severityColor?: AlertColor) => {
    switch (severityColor) {
      case undefined:
        return null;
      case 'warning':
        return (
          <WarningAmberIcon color={severityColor} sx={{ marginRight: '4px' }} />
        );
    }
    return null;
  };

  return (
    // don't allow propagation outside the dialog
    <Dialog
      data-testid={testId}
      maxWidth={maxWidth}
      {...dialogProps}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '12px',
            backgroundColor: 'background.default',
          },
        },
      }}
      //handles click outside the dialog content - close dialog
      onClick={(event) => {
        event.stopPropagation();
        if (shouldClickAway) {
          handleClick();
        }
      }}
    >
      <Box
        sx={{ backgroundColor: 'background.default' }}
        className={'contentBox'}
        id="content"
        //  solves issue where actions inside dialog content propogate to page behind dialog
        onClick={(event: any) => {
          if (shouldBlockInteraction) {
            event.stopPropagation();
          }
        }}
        onMouseDown={(event: any) => {
          if (shouldBlockInteraction) {
            event.stopPropagation();
          }
        }}
        onMouseUp={(event: any) => {
          if (shouldBlockInteraction) {
            event.stopPropagation();
          }
        }}
        {...dialogContentProps}
      >
        {title && (
          <DialogTitle sx={{ padding: '24px 24px 12px', typography: 'h4' }}>
            {getTitleIcon(titleSeverity)}
            {title}
          </DialogTitle>
        )}
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '0px',
            margin: '0px',
            ...sxProps,
          }}
        >
          <>
            {message && (
              <DialogContentText
                sx={{
                  padding: '0px 24px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </DialogContentText>
            )}
            {children}
            {alertMessage && (
              <Box sx={{ marginTop: '16px', padding: '0px 24px' }}>
                <Alert severity={alertSeverity} sx={{}}>
                  <AlertTitle>{alertTitle}</AlertTitle>
                  {alertMessage}
                </Alert>
              </Box>
            )}
          </>
        </DialogContent>
        {buttons && buttons.length > 0 && (
          <DialogActions
            key="actions"
            sx={{ margin: '0px', padding: '16px 24px' }}
          >
            {buttons?.map((button: string, index: number) => {
              const buttonIcon = getIcon(button.toLowerCase());

              if (index === buttons.length - 1) {
                return (
                  <ButtonLoadingUi
                    key={'button_' + index}
                    startIcon={buttonIcon}
                    onClick={(event) => {
                      //  solves issue where click on modal button fires an action row click
                      event.stopPropagation();
                      handleClick(index);
                    }}
                    disabled={disableSubmit}
                    loading={isLoading}
                    type="button"
                  >
                    {button}
                  </ButtonLoadingUi>
                );
              }

              return (
                <Fragment key={`button_${index}`}>
                  <ButtonModalCancelUi
                    startIcon={buttonIcon}
                    onClick={(event) => {
                      //  solves issue where click on modal button fires an action row click
                      event.stopPropagation();
                      handleClick(index);
                    }}
                  >
                    {button}
                  </ButtonModalCancelUi>
                  {specialCancelLayout && index === 0 && (
                    <div
                      key={'button-div-_' + index}
                      style={{
                        backgroundColor: 'yellow',
                        width: specialCancelLayout,
                      }}
                    ></div>
                  )}
                </Fragment>
              );
            })}
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
}

export default ModalDialog;
