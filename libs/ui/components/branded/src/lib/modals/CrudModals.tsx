/*
This class prompts the user to do a thing
The prompt appears within a modal dialog
The user can either accept the action or cancel
If the user accepts the action, an API request is triggered with the appropriate payload
  If the API request is successful, the modal dialog is closed
  If the API results in an error, the error appears within the body of the modal message
If the user opts to cancel, the modal dialog is closed
*/

/*
The most common use case for this class is a deletion prompt
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-useless-fragment */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ButtonCopyText, useQueryDetails, useToaster } from '@rangeos-nx/ui/api/hooks';

import { auth } from '@rangeos-nx/ui/keycloak';
import { isLoading, setLoader, modal, setModal } from '@rangeos-nx/ui/redux';
import { ErrorMessageDetail } from '@rangeos-nx/ui/validation';

/* MUI */
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import ModalDialog from './ModalDialog';
import { Typography } from '@mui/material';

/* Constants */
const deleteDialogButtons = ['Cancel', 'Delete'];

/**
 * @typedef {object} CrudModalProps
 * @property {boolean} [appendModalIdToPayload=false] Whether to append the id in modalObj to the payload
 * @property {string} apiHook Hook for handling dialog
 * @property {(whichModalId: string, meta: any, whichButton: number, isSuccess?: boolean, responseData?: any) => void} [callbackFxn] Function to call on api response
 * @property {boolean} [confirmNameOnDelete=false] Whether to force typing of item name on delete to confirm (put data.author in modalObj.meta.author for author warning)
 * @property {string} [errorAlertTitle] Title to display on alert when error occurs
 * @property {string} [promptModalId] Id for modal dialog that prompts user
 * @property {any} [hookPayload] Additional payload for API request
 * @property {string} [promptMessage] Message to display when prompting user
 * @property {string} [permanentWarning] Override warning to display that this is permanent action
 * @property {string} [promptTitle] Title to display when prompting user
 * @property {string[]} [modalButtonText] Override button text on modal
 * @property {boolean} [shouldDisplayErrorToaster=false] Whether to display toaster when error occurs
 * @property {boolean} [shouldDisplaySuccessToaster=false] Whether to display toaster when dialog action is successful
 * @property {string} [successMessage] Override message to display upon success
 * @property {string} [testId] Override modal dialog test id
 */
export type CrudModalProps = {
  appendModalIdToPayload?: boolean;
  apiHook: any;
  callbackFxn?: (
    whichModalId: string,
    meta: any,
    whichButton: number,
    isSuccess?: boolean,
    responseData?: any,
  ) => void;
  confirmNameOnDelete?: boolean;
  errorAlertTitle?: string;
  promptModalId: string;
  hookPayload?: any;
  promptMessage: string;
  permanentWarning?: string;
  promptTitle: string;
  hookOptions?: any;
  modalButtonText?: string[];
  shouldDisplayErrorToaster?: boolean;
  shouldDisplaySuccessToaster?: boolean;
  successMessage?: string;
  testId: string;
};

export function CrudModals(props: CrudModalProps) {
  const {
    apiHook,
    callbackFxn,
    confirmNameOnDelete = false,
    errorAlertTitle = 'Delete Error',
    promptModalId,
    hookPayload,
    promptMessage,
    permanentWarning = 'This action is permanent!',
    promptTitle,
    modalButtonText = deleteDialogButtons,
    appendModalIdToPayload = false,
    shouldDisplayErrorToaster = false,
    shouldDisplaySuccessToaster = false,
    successMessage = 'Success!',
    testId,
  } = props;
  const dispatch = useDispatch();
  const displayToaster = useToaster();
  const [apiError, setApiError] = useState<string | JSX.Element>('');
  const loading = useSelector(isLoading);

  const modalObj = useSelector(modal);
  const query = apiHook ? apiHook(hookPayload) : null;

  const [confirmationName, setConfirmationName] = useState('');
  const currentAuth = useSelector(auth);

  /** @constant
   * Payload with appended uuid if applicable
   *  @type {any}
   */
  const payload = appendModalIdToPayload
    ? { ...hookPayload, uuid: modalObj.id || modalObj.name }
    : hookPayload;

  const deployedBy = modalObj?.meta?.deployedBy;
  const isNotAuthor = deployedBy
    ? deployedBy !== currentAuth?.parsedUserToken?.preferred_username
    : currentAuth?.parsedUserToken?.email !== modalObj?.meta?.author;

  /**
   * Render tags to confirm item name
   */
  const confirmMessage = (
    <>
      {promptMessage}
      {modalObj?.name &&
        (promptMessage.indexOf('named') >= 0 || modalObj?.meta?.showName) && (
          <>
            {confirmNameOnDelete ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <ButtonCopyText
                  label={
                    <Typography
                      color="textPrimary"
                      variant="body1"
                      sx={{
                        paddingBottom: '2px',
                        paddingRight: '4px',
                        height: 'auto',
                      }}
                    >
                      <strong>{modalObj.name}</strong>
                    </Typography>
                  }
                  name="copy-name"
                  data-testid="copy-name"
                  text={modalObj.name}
                  tooltip={'Copy Name'}
                  iconColor="primary"
                />
                ?
              </div>
            ) : (
              <>
                <strong>{modalObj.name}</strong>?
              </>
            )}
          </>
        )}
      <div>
        {confirmNameOnDelete
          ? `
Confirm item name below...`
          : `${permanentWarning}`}
      </div>
    </>
  );

  const isOpen = modalObj.type === promptModalId;

  const authorTitle = deployedBy
    ? `You are not the deployer! ${permanentWarning}`
    : `You are not the author! ${permanentWarning}`;
  const authorMessage = deployedBy
    ? 'deployer: ' + modalObj?.meta?.deployedBy
    : 'author: ' + modalObj?.meta?.author;

  const isNameMatch =
    confirmationName.toLowerCase() === modalObj?.name?.toLowerCase();
  const forceDisableSubmit = confirmNameOnDelete ? !isNameMatch : false;
  const nameConfirmedError = isNameMatch
    ? ''
    : 'You must enter name to match item ...';

  /**
   * Use Effect to clear confirmation name upon (re)opening dialog
   */
  useEffect(() => {
    if (isOpen) {
      setConfirmationName('');
    }
  }, [isOpen]);

  const handleApiResponse = async (buttonIndex: number) => {
    if (buttonIndex === 1) {
      try {
        let response = null;
        if (query) {
          response = await query.mutateAsync(payload || modalObj.id || '');

          if (shouldDisplaySuccessToaster) {
            displayToaster({
              message: successMessage,
              severity: 'success',
            });
          }
        }
        if (callbackFxn) {
          callbackFxn(
            promptModalId,
            modalObj.meta || {},
            buttonIndex,
            true,
            response,
          );
        }

        // for cases where parent doesn't do full reload
        dispatch(setLoader(false));
        dispatch(setModal({ type: '', id: null, name: null }));
      } catch (error: any) {
        const errorMessage = ErrorMessageDetail(error, null, true);
        if (callbackFxn) {
          callbackFxn(
            promptModalId,
            modalObj.meta || {},
            buttonIndex,
            false,
            errorMessage,
          );
        }
        setApiError(errorMessage);
      }
    } else {
      if (callbackFxn) {
        callbackFxn(promptModalId, modalObj.meta || {}, buttonIndex);
      }
      setApiError('');
      dispatch(setModal({ type: '', id: null, name: null }));
    }
  };

  if (query) {
    useQueryDetails({
      queryObj: query,
      loaderFunction: (isLoading: boolean) => {
        if (isOpen) {
          dispatch(setLoader(isLoading ? true : false));
        }
      },
      errorFunction: (errorState) => {
        // no toaster - alert handled separately
      },
      shouldDisplayToaster: shouldDisplayErrorToaster,
    });
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  return (
    <div data-testid="modals">
      {modalObj.type !== '' && (
        <ModalDialog
          testId={testId}
          buttons={modalButtonText}
          dialogProps={{ open: modalObj.type === promptModalId }}
          disableSubmit={forceDisableSubmit}
          isLoading={loading}
          message={confirmMessage}
          title={promptTitle}
          alertMessage={apiError}
          alertTitle={errorAlertTitle}
          handleAction={handleApiResponse}
          maxWidth={confirmNameOnDelete ? 'sm' : 'xs'}
        >
          <>
            {confirmNameOnDelete && (
              <Box
                sx={{ marginLeft: '24px', marginRight: '24px', width: '90%' }}
              >
                <TextField
                  autoComplete="off"
                  sx={{
                    borderRadius: '4px',
                    width: '100%',
                    marginBottom: '8px',
                  }}
                  InputLabelProps={{ shrink: true }} // always put label above box even if empty
                  InputProps={{
                    sx: {
                      backgroundColor: (theme: any) => `${theme.input.fill}`,
                    },
                    inputProps: {
                      'data-testid': 'field-name-confirmation',
                    },
                  }}
                  data-testid={'name-confirmation'}
                  id={'name-confirmation'}
                  aria-label={'Name Confirmation'}
                  name={'name-confirmation'}
                  value={confirmationName}
                  required
                  error={Boolean(nameConfirmedError)}
                  helperText={nameConfirmedError}
                  margin="dense"
                  variant="outlined"
                  fullWidth={true}
                  size="small"
                  spellCheck={false}
                  multiline={false}
                  placeholder={'Type item name here...'}
                  onChange={(event) => {
                    const newEntry = event.target.value;
                    setConfirmationName(newEntry);
                  }}
                  onKeyDown={(event) => {
                    if (event.code === 'Enter') {
                      // prevent enter from causing submit of form...
                      event.preventDefault();
                    }
                  }}
                />
                {isNotAuthor ? (
                  <Alert sx={{ width: 'auto' }} severity="warning">
                    <AlertTitle>{authorTitle}</AlertTitle>
                    {authorMessage}
                  </Alert>
                ) : (
                  <Alert sx={{ width: 'auto' }} severity="warning">
                    {permanentWarning}
                  </Alert>
                )}
              </Box>
            )}
          </>
        </ModalDialog>
      )}
    </div>
  );
}

export default CrudModals;
