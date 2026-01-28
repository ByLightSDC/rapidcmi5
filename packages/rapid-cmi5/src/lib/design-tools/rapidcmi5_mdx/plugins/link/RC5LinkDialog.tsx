import {
  activeEditor$,
  cancelLinkEdit$,
  currentSelection$,
  EditLinkDialog,
  linkDialogState$,
  onWindowChange$,
  PreviewLinkDialog,
  removeLink$,
  switchFromPreviewToLinkEdit$,
  updateLink$,
  useCellValues,
  usePublisher,
  viewMode$,
} from '@mdxeditor/editor';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import * as yup from 'yup';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid2';
import { IconButton, Stack } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import LinkOffIcon from '@mui/icons-material/LinkOff';

import Popper from '@mui/material/Popper';
import { useTheme } from '@mui/system';

import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';

import { $setSelection } from 'lexical';
import { useClickOutside } from './useClickOutside';
import RC5LinkEditor from './RC5LinkEditor';
import { useSelector } from 'react-redux';
import { editorInPlayback$, debugLog, FormStateType, FormControlTextField, ModalDialog, FormControlUIProvider, MiniForm, delay } from '@rapid-cmi5/ui';
import { currentSlideNum } from 'packages/rapid-cmi5/src/lib/redux/courseBuilderReducer';

/**
 * Dialog for previewing and editing links in MdxEditor
 * @returns
 */
export const RC5LinkDialog: React.FC = () => {
  const theme = useTheme();

  const [
    activeEditor,
    linkDialogState,
    isPlayback,
    currentSelection,
    viewMode,
  ] = useCellValues(
    activeEditor$,
    linkDialogState$,
    editorInPlayback$,
    currentSelection$,
    viewMode$,
  );
  const currentSlideIndex = useSelector(currentSlideNum); //would be better to detect lexical refresh
  const [editor] = useLexicalComposerContext();
  const publishWindowChange = usePublisher(onWindowChange$);
  const updateLinkDialogState = usePublisher(linkDialogState$);
  const updateLink = usePublisher(updateLink$);
  const cancelLinkEdit = usePublisher(cancelLinkEdit$);
  const switchFromPreviewToLinkEdit = usePublisher(
    switchFromPreviewToLinkEdit$,
  );
  const removeLink = usePublisher(removeLink$);

  const ref = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef<number>(-1);

  const secondsSincePreviewTrigger = useRef<number>(0);

  const theURL = linkDialogState?.type === 'preview' ? linkDialogState.url : '';
  const urlIsExternal =
    linkDialogState?.type === 'preview' && theURL.startsWith('http');

  const onEditLink = useCallback(() => {
    activeEditor?.update(() => {
      $setSelection(null);
      switchFromPreviewToLinkEdit();
    });
  }, [activeEditor, switchFromPreviewToLinkEdit]);

  const onRemoveLink = useCallback(() => {
    activeEditor?.update(() => {
      removeLink();
    });
  }, [activeEditor, removeLink]);

  /**
   * Open link in playback mode
   * Resets dialog state back to inactive
   */
  const onClickPlaybackLink = () => {
    if (linkDialogState?.type === 'preview') {
      const theURL = (linkDialogState as PreviewLinkDialog).url;
      if (isPlayback && theURL && urlIsExternal) {
        updateLinkDialogState({
          type: 'inactive',
        });
        window.open(theURL, '_blank', 'noreferrer');
      }
    }
  };

  /**
   * Handle click outside of popper
   * ignore if preview was triggered recently
   */
  const onClickOutside = useCallback(() => {
    const elapsed = Date.now() - secondsSincePreviewTrigger.current;
    if (linkDialogState?.type === 'preview') {
      if (elapsed > 1200) {
        debugLog('click away - hide popper');
        updateLinkDialogState({
          type: 'inactive',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theURL]);

  const onMouseDownWindow = (evt: MouseEvent) => {
    mouseDownRef.current = evt.clientX;
  };

  //detect click outside popper
  useClickOutside(ref, onClickOutside);

  /**
   * UE recalcutes bounds of selected link
   * not perfect by any means
   */
  useEffect(() => {
    const update = () => {
      activeEditor?.getEditorState().read(() => {
        publishWindowChange(true);
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);
    window.addEventListener('mousedown', onMouseDownWindow);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('mousedown', onMouseDownWindow);
    };
  }, [activeEditor, publishWindowChange]);

  /**
   * UE sets a timer when preview mode is triggered for a new selection
   */
  useEffect(() => {
    secondsSincePreviewTrigger.current = Date.now();
  }, [currentSelection]);

  /** UE set linkDialogState to inactive
   * this addresses a bug due to lexical focusing last element in the view
   * focusing a link triggers linkDialogState active
   * which causes the link display to appear
   */
  useEffect(() => {
    debugLog('set link state to inactive');
    const hideLink = async () => {
      await delay(100);
      updateLinkDialogState({
        type: 'inactive',
      });
    };
    hideLink();
  }, [viewMode, updateLinkDialogState, currentSlideIndex]);

  //nothing to display

  if (linkDialogState.type === 'inactive') return null;

  //text selection rect for positioning popper
  const theRect = linkDialogState.rectangle;
  const validationSchema = yup.object().shape({});

  /**
   * Virtual element for positioning MUI Popper
   */
  const virtualElement = {
    getBoundingClientRect: (): DOMRect => ({
      top: theRect.top,
      left: mouseDownRef.current - 20, //theRect.left,
      bottom: theRect.top + 100,
      right: theRect.left + 400,
      width: 0,
      height: 0,
      x: theRect.left,
      y: theRect.top,
      toJSON: () => {
        return false;
      },
    }),
  };

  /**
   * Form fields for editing link
   * @param {UseFormReturn} formMethods React hook form methods
   * @param {FormStateType} formState React hook form state fields (ex. errors, isValid)
   * @return {JSX.Element} Render elements
   */
  const getFormFields = (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ): JSX.Element => {
    const { control } = formMethods;
    const { errors } = formState;
    return (
      <>
        <Grid size={12}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.url)}
            helperText={errors?.url?.message}
            name="url"
            required
            label="Link URL"
            readOnly={false}
          />
        </Grid>
        <Grid size={6}>
          <FormControlTextField
            control={control}
            error={Boolean(errors?.title)}
            helperText={errors?.title?.message}
            name="title"
            required
            label="Title"
            readOnly={false}
          />
        </Grid>
      </>
    );
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      <ModalDialog
        testId={'edit-link'}
        buttons={[]}
        dialogProps={{
          open: linkDialogState.type === 'edit',
        }}
        maxWidth="sm"
      >
        <FormControlUIProvider>
          <MiniForm
            dataCache={linkDialogState}
            doAction={(req: EditLinkDialog) => {
              updateLink({ text: req.title, title: req.title, url: req.url });
            }}
            formTitle="Link"
            getFormFields={getFormFields}
            submitButtonText="Apply"
            onCancel={() => {
              cancelLinkEdit();
            }}
            validationSchema={validationSchema}
          />
        </FormControlUIProvider>
      </ModalDialog>
      {/* preview link */}
      <RC5LinkEditor
        isOpen={linkDialogState.type === 'preview' && !isPlayback}
        onEditLink={onEditLink}
        onRemoveLink={onRemoveLink}
        linkNodeKey={linkDialogState.linkNodeKey}
        ref={ref}
        url={linkDialogState.url}
        urlIsExternal={urlIsExternal}
        virtualElement={virtualElement}
      />
      {/* playback link */}
      <Popper
        open={linkDialogState.type === 'preview' && isPlayback}
        anchorEl={virtualElement}
        autoFocus={true}
        placement={'bottom-start'}
      >
        <div
          style={{
            width: '120px',
            height: theRect.height,
          }}
          onMouseUp={onClickPlaybackLink}
        />
      </Popper>
    </>
  );
};
