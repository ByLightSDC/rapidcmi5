import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import { readOnly$ } from '@mdxeditor/editor';
import { $getNodeByKey } from 'lexical';

// MUI
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';

/** Icons */
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RoomIcon from '@mui/icons-material/Room';
import PaletteIcon from '@mui/icons-material/Palette'; //MB


import { openEditImageDialog$ } from './index';
import {useEffect, useState } from 'react';
import { useTheme } from '@mui/system';


import { useSignalEffect } from '@preact/signals-react';
import { clickPosition$, isLabelDropping$ } from '@rapid-cmi5/ui';


//MB
//import { imageStyleDialogOpen$ } from './index';
import { StyleDialog } from './StyleDialog';

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
}: EditImageToolbarProps): JSX.Element {
  const [readOnly] =
    useCellValues(readOnly$);
  const [editor] = useLexicalComposerContext();
  const openEditImageDialog = usePublisher(openEditImageDialog$);
  //const openStyleDialog = usePublisher(imageStyleDialogOpen$); //MB

  const [isMarking, setIsMarking] = useState(false);
  const muiTheme = useTheme();

  const [position, setPosition] = useState({ x: 0, y: 0 });

  //For letting style dialogue work outside imagedialog.
const [imageStyle, setImageStyle] = useState<string>('');
const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);


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

  
  return (
    
    // Wrap this in a fragment so styledialog can liv eOUTSIDE of imageDialogue without us having to rewire it compltely. 
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
        <SettingsIcon />
      </IconButton>

      <IconButton
        aria-label="edit styles"
        disabled={readOnly}
        onClick={() => {
          setIsStyleDialogOpen(true)
          console.log('Button was clicked!')}}
      >
        {/* MB */}
              
        <PaletteIcon /> 
      </IconButton>
 
      <IconButton
        aria-label="Add Label"
        disabled={readOnly}
        onClick={(e) => {
          handleDragLabelStart(e);
        }}
      >
        <RoomIcon />
      </IconButton>

      {isMarking && (
        <div
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <AddCircleIcon color='warning'/>
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

    {/* Dialog lives OUTSIDE the button, but inside the component */}
    <StyleDialog
      isOpen={isStyleDialogOpen}
      style={imageStyle}
      setImageStyle={setImageStyle}
      setIsStyleDialogOpen={setIsStyleDialogOpen}
    />
  </>
  );
}
