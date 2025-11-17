/* eslint-disable @typescript-eslint/no-explicit-any */

import { useContext, useEffect, useRef, useState } from 'react';
import {
  message,
  setMessage,
  setModal,
  useGetCacheMultipleSelection,
  useSetCacheMultipleSelection,
} from '@rangeos-nx/ui/redux';
import { useDispatch, useSelector } from 'react-redux';

/* MUI */
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

/*Icons */
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

/* Branded */
import {
  ButtonCopyText,
  ButtonIcon,
  ModalDialog,
} from '@rangeos-nx/ui/branded';

import { BulkDeleteActionContext } from './BulkDeleteActionContext';
import {
  allowsBulkDelete,
  apiTopicsHookData,
  Topic,
} from '@rangeos-nx/ui/api/hooks';
import { auth } from '@rangeos-nx/ui/keycloak';

const confirmationDialogButtons = ['Cancel', 'Continue'];

/**
 * @typedef {Object} tProps
 * @property {Topic} [topicId] Topic Id for delete
 * @property {string} [tooltip="Bulk Delete"] optional override of button tooltip
 * @property {*} [listPayload] additional parameters to pass to get api hook
 * @property {*} [deletePayload] additional parameters to pass to delete api hook
 * @property {number} [buttonIndex] index of button on page when multiple may be present
 */
type tProps = {
  authoredByStr?: string;
  authorLabel?: string;
  topicId?: Topic;
  tooltip?: string;
  listPayload?: any;
  deletePayload?: any;
  buttonIndex?: number;
};
export function BulkDeleteButton(props: tProps) {
  const {
    authorLabel = 'Author',
    authoredByStr = 'authored by',
    buttonIndex,
    deletePayload,
    listPayload,
    tooltip = 'Bulk Delete',
    topicId,
  } = props;
  const dispatch = useDispatch();
  const messageObj = useSelector(message);
  const { createProcess } = useContext(BulkDeleteActionContext);
  const apiHooks = apiTopicsHookData[topicId || ''];
  const deleteQuery =
    apiHooks && apiHooks.deleteApiHook
      ? apiHooks.deleteApiHook('', true)
      : null; // skip invalidate query until we're done
  const queryKey = apiHooks ? apiHooks.queryKey : '';
  const currentAuth = useSelector(auth);

  const [confirmationAuthor, setConfirmationAuthor] = useState('');
  const isNameMatch =
    confirmationAuthor.toLowerCase() ===
    currentAuth?.parsedUserToken?.email?.toLowerCase();
  const forceDisableSubmit = !isNameMatch;
  const authorConfirmedError = isNameMatch
    ? ''
    : `You must enter ${authorLabel.toLowerCase()} to confirm ...`;

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteItems = useRef<any[]>([]);
  const setMultiSelectionCaches = useSetCacheMultipleSelection();
  const getMultiSelectionCache = useGetCacheMultipleSelection();
  const selectModalId = `multidelete-${topicId ? topicId.toLowerCase() : ''}`;
  const deleteTitle = `Delete ${topicId}s`;
  const apiError = useRef<string>('');

  /**
   * Render tags to confirm author
   */
  const confirmMessage = (
    <>
      {`Are you sure you want to delete ${deleteItems.current.length} ${topicId}${deleteItems.current.length > 1 ? 's' : ''} ${authoredByStr} `}
      <ButtonCopyText
        label={
          <Typography
            color="textPrimary"
            variant="body1"
            sx={{
              paddingBottom: '2px',
              marginRight: '4px',
              height: 'auto',
            }}
          >
            <strong>{currentAuth?.parsedUserToken?.email}</strong>
          </Typography>
        }
        name="copy-name"
        text={currentAuth?.parsedUserToken?.email}
        tooltip={`Copy ${authorLabel}`}
        iconColor="primary"
      />

      {`? Confirm ${authorLabel.toLowerCase()} below...`}
    </>
  );

  /**
   * Use Effect confirms bulk delete when Apply message is received
   */
  useEffect(() => {
    if (messageObj.message !== 'apply') {
      return;
    }

    // check for mismatch when multiple buttons on page
    if (buttonIndex && buttonIndex !== messageObj.meta?.buttonIndex) {
      return;
    }
    if (messageObj.type === selectModalId) {
      const cache = getMultiSelectionCache(selectModalId)?.selections || [];

      if (cache) {
        if (cache.length > 0) {
          deleteItems.current = structuredClone(cache);
          // confirm deletion request
          setConfirmationAuthor('');
          setIsDeleting(true);
        } else {
          dispatch(setMessage({ type: '', message: '' }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageObj.message]);

  const openMultiDeletion = () => {
    //send to cache used by the selection view
    setMultiSelectionCaches(selectModalId, []);
    //open modal
    dispatch(
      setModal({
        id: null,
        name: null,
        topic: topicId,
        type: 'bulk-delete',
        meta: { listPayload: listPayload, buttonIndex: buttonIndex },
      }),
    );
  };

  const handleConfirmationAction = async (buttonId: number) => {
    if (buttonId === 1) {
      // Continue
      createProcess(deleteItems.current, topicId || '', deleteQuery, queryKey, {
        deletePayload,
      });
    }
    // close dialog -- context will output the toaster with results
    setIsDeleting(false);
    dispatch(setMessage({ type: '', message: '' }));
  };

  if (topicId && allowsBulkDelete.includes(topicId)) {
    return (
      <>
        <ButtonIcon
          name={'bulk-deletion'}
          props={{
            disabled: false,
            onClick: (event) => {
              event.stopPropagation();
              openMultiDeletion();
            },
          }}
          tooltip={tooltip}
        >
          <DeleteSweepIcon fontSize="medium" />
        </ButtonIcon>
        {isDeleting && (
          <ModalDialog
            testId={'bulk-delete-dialog'}
            buttons={confirmationDialogButtons}
            dialogProps={{ open: isDeleting }}
            message={confirmMessage}
            title={deleteTitle}
            alertMessage={
              apiError.current ? (
                <div style={{ whiteSpace: 'pre-line' }}>{apiError.current}</div>
              ) : (
                ''
              )
            }
            alertTitle="Delete Error"
            disableSubmit={forceDisableSubmit}
            handleAction={handleConfirmationAction}
            maxWidth="xs"
          >
            <Box sx={{ marginLeft: '24px', marginRight: '24px', width: '90%' }}>
              <TextField
                autoComplete="off"
                sx={{
                  borderRadius: '4px',
                  width: '100%',
                }}
                InputLabelProps={{ shrink: true }} // always put label above box even if empty
                InputProps={{
                  sx: {
                    backgroundColor: (theme: any) => `${theme.input.fill}`,
                  },
                  inputProps: {
                    'data-testid': 'field-author-confirmation',
                  },
                }}
                data-testid={'author-confirmation'}
                id={'author-confirmation'}
                aria-label={`${authorLabel} Confirmation`}
                label={authorLabel}
                name={'author-confirmation'}
                value={confirmationAuthor}
                required
                error={Boolean(authorConfirmedError)}
                helperText={authorConfirmedError}
                margin="dense"
                variant="outlined"
                fullWidth={true}
                size="small"
                spellCheck={false}
                multiline={false}
                placeholder={`Type ${authorLabel.toLowerCase()} here...`}
                onChange={(event) => {
                  const newEntry = event.target.value;
                  setConfirmationAuthor(newEntry);
                }}
                onKeyDown={(event) => {
                  if (event.code === 'Enter') {
                    // prevent enter from causing submit of form...
                    event.preventDefault();
                  }
                }}
              />
              <Alert sx={{ width: 'auto' }} severity="warning">
                This action is permanent!
              </Alert>
            </Box>
          </ModalDialog>
        )}
      </>
    );
  }
  return null;
}

export default BulkDeleteButton;
