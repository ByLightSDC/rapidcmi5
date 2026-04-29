import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import { readOnly$ } from '@mdxeditor/editor';
import { $getNodeByKey } from 'lexical';

// MUI
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';

/** Icons */
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RoomIcon from '@mui/icons-material/Room';
import PaletteIcon from '@mui/icons-material/Palette';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import { openEditImageDialog$ } from './index';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/system';

import { useSignalEffect } from '@preact/signals-react';
import {
  clickImageTextPosition$,
  clickPosition$,
  isLabelDropping$,
  isTextDropping$,
  BlockAppearanceForm,
  AlignmentToolbarControls,
} from '@rapid-cmi5/ui';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';
import { MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import { $isImageNode } from './ImageNode';

import { StyleDialog } from './StyleDialog';
import { useImageStyle } from './useImageStyle';

export interface EditImageToolbarProps {
  nodeKey: string;
  imageSource: string;
  initialImagePath: string | null;
  title: string;
  alt: string;
  rest: any;
  width?: number;
  height?: number;
  href?: string;
  contentWidth?: ContentWidthEnum;
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * This little toolbar appears in the top-right corner of an image in the editor.
 * @param nodeKey
 * @param imageSource
 * @param initialImagePath
 * @param title
 * @param alt
 * @param rest
 * @constructor
 */
export function EditImageToolbar({
  nodeKey,
  imageSource,
  initialImagePath,
  title,
  alt,
  rest,
  width,
  height,
  href,
  contentWidth,
  textAlign,
}: EditImageToolbarProps): JSX.Element {
  const [readOnly] = useCellValues(readOnly$);
  const [editor] = useLexicalComposerContext();
  const openEditImageDialog = usePublisher(openEditImageDialog$);

  const [isMarking, setIsMarking] = useState(false);
  const muiTheme = useTheme();
  const [isTextDropping, setIsTextDropping] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // For letting style dialogue work outside of image dialog.
  const { imageStyle, setImageStyle } = useImageStyle(nodeKey);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [blockAppearanceOpen, setBlockAppearanceOpen] = useState(false);
  const [isAlignOpen, setIsAlignOpen] = useState(false);

  /**
   * Set marker position to follow mouse
   * @param e
   */
  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  /**
   * Listen for mouse move
   * Store mouse position when Label/Marker button is clicked
   * clickPosition is used from ImageEditor to avoid dropping marker on the Add Marker button since the button is positioned inside the image area
   * set a flag when label is being dropped
   * @param e
   */
  const handleDragLabelStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleMouseMove);
    clickPosition$.value = [e?.clientX, e?.clientY];
    isLabelDropping$.value = true;
  };

  /**
   * Clean up mouse move listener
   */
  useEffect(() => {
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /**
   * Listen for flag and update internal React state
   */
  useSignalEffect(() => {
    setIsMarking(isLabelDropping$.value);
    if (isLabelDropping$.value === false) {
      clickPosition$.value = [-1, -1];
    }
  });

  /**
   * Listen for mouse move
   * Store mouse position when text button is clicked
   * clickPosition is used from ImageEditor to avoid dropping marker on the Add Marker button since the button is positioned inside the image area
   * set a flag when label is being dropped
   * @param e
   */
  const handlePlaceTextStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleMouseMove);
    clickImageTextPosition$.value = [e?.clientX, e?.clientY];
    isTextDropping$.value = true;
  };
  /**
   * Listen for text being dropped and update internal React state
   */
  useSignalEffect(() => {
    setIsTextDropping(isTextDropping$.value);
    if (isTextDropping$.value === false) {
      clickImageTextPosition$.value = [-1, -1];
    }
  });

  return (
    // Wrap this in a fragment so StyleDialog can live OUTSIDE of imageDialogue without us having to rewire it completely.
    <>
      <Stack
        direction="row"
        spacing={0}
        sx={{
          backgroundColor:
            muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
          position: 'absolute',
          right: 0,
          top: 0,
          display: 'flex',
          zIndex: 1,
        }}
      >
        <IconButton
          aria-label="edit"
          disabled={readOnly}
          onClick={(e) => {
            openEditImageDialog({
              nodeKey: nodeKey,
              initialValues: {
                src: !initialImagePath ? imageSource : initialImagePath,
                title,
                altText: alt,
                rest: rest,
                width, // undefined if 'inherit'
                height, // undefined if 'inherit'
                href,
              },
            });
          }}
        >
          <EditIcon />
        </IconButton>

        <IconButton
          aria-label="edit styles"
          disabled={readOnly}
          onClick={() => {
            setIsStyleDialogOpen(true);
          }}
        >
          <PaletteIcon />
        </IconButton>

        <Tooltip title="Block Appearance">
          <IconButton
            aria-label="block appearance"
            disabled={readOnly}
            onClick={() => setBlockAppearanceOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Alignment">
          <IconButton
            aria-label="toggle alignment"
            disabled={readOnly}
            onClick={() => setIsAlignOpen((v) => !v)}
            sx={{ opacity: isAlignOpen ? 1 : 0.5 }}
          >
            {textAlign === 'right' ? <FormatAlignRightIcon /> : textAlign === 'center' ? <FormatAlignCenterIcon /> : <FormatAlignLeftIcon />}
          </IconButton>
        </Tooltip>

        <IconButton
          aria-label="Add Label"
          disabled={readOnly}
          onClick={(e) => {
            handleDragLabelStart(e);
          }}
        >
          <RoomIcon />
        </IconButton>
        <IconButton
          aria-label="Add Text"
          disabled={readOnly}
          onClick={(e) => {
            handlePlaceTextStart(e);
          }}
        >
          <TextFieldsIcon />
        </IconButton>
        {isTextDropping && (
          <div
            style={{
              position: 'fixed',
              top: position.y,
              left: position.x,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <TextFieldsIcon color="warning" />
          </div>
        )}

        {isMarking && (
          <div
            style={{
              position: 'fixed',
              top: position.y,
              left: position.x,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <AddCircleIcon color="warning" />
          </div>
        )}
        <IconButton
          aria-label="delete"
          disabled={readOnly}
          onClick={(e) => {
            e.preventDefault();
            editor.update(() => {
              $getNodeByKey(nodeKey)?.remove();
            });
          }}
        >
          <DeleteForeverIcon />
        </IconButton>
      </Stack>

      {/* Second-row alignment toolbar — revealed by toggle button */}
      {isAlignOpen && <Stack
        direction="row"
        spacing={0}
        sx={{
          backgroundColor:
            muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
          position: 'absolute',
          right: 0,
          top: 36,
          display: 'flex',
          zIndex: 1,
        }}
      >
        <AlignmentToolbarControls
          currentAlignment={textAlign ?? 'left'}
          onAlignmentChange={(value) => {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if ($isImageNode(node)) {
                const filteredRest = (rest ?? []).filter(
                  (a: MdxJsxAttribute) => a.name !== 'textAlign',
                );
                if (value !== 'left') {
                  filteredRest.push({
                    type: 'mdxJsxAttribute',
                    name: 'textAlign',
                    value,
                  } as MdxJsxAttribute);
                }
                node.setRest(filteredRest);
              }
            });
          }}
          disabled={readOnly}
        />
      </Stack>}

      {/* Style Dialog lives OUTSIDE the button, but inside the toolbar component */}
      <StyleDialog
        isOpen={isStyleDialogOpen}
        style={imageStyle}
        setImageStyle={setImageStyle}
        setIsStyleDialogOpen={setIsStyleDialogOpen}
      />

      {/* Block Appearance dialog — controls content width override */}
      <BlockAppearanceForm
        open={blockAppearanceOpen}
        currentContentWidth={contentWidth}
        onClose={() => setBlockAppearanceOpen(false)}
        onSave={(newContentWidth) => {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
              const filteredRest = (rest ?? []).filter(
                (a: MdxJsxAttribute) => a.name !== 'contentWidth',
              );
              if (newContentWidth !== undefined) {
                filteredRest.push({
                  type: 'mdxJsxAttribute',
                  name: 'contentWidth',
                  value: newContentWidth,
                } as MdxJsxAttribute);
              }
              node.setRest(filteredRest);
            }
          });
        }}
      />
    </>
  );
}
