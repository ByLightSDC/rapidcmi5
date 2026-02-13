import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
  useMdastNodeUpdater,
} from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { Box, IconButton, Stack, useTheme } from '@mui/material';

/** Icons */
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { ImageTextDirectiveNode } from './types';
import { debugLog } from '../../../../utility/logger';
import { editorInPlayback$ } from '../../state/vars';
import { clickImageTextPosition$ } from './vars';

/**
 * Accordion Editor for accordion directives
 * @param param0
 * @returns
 */
export const ImageTextEditor: React.FC<
  DirectiveEditorProps<ImageTextDirectiveNode>
> = ({ lexicalNode, mdastNode }) => {
  const [editor] = useLexicalComposerContext();
  const [portalTarget, setPortalTarget] = useState<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  const updateMdastNode = useMdastNodeUpdater();
  const muiTheme = useTheme();

  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);
  const isDraggingRef = useRef<boolean>(false);
  const currentOffset = useRef<number[]>([0, 0]);
  const imageBounds = useRef<DOMRect | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState([0, 0]);
  const currentPositionRef = useRef<number[]>([0, 0]);

  /**
   * Safely retrieves the value of a specific attribute from a node's attributes object.
   *
   * @param nodeAttributes - An object representing attribute key-value pairs,
   *                         where each value can be a string, null, or undefined.
   * @param attributeName - The name of the attribute to retrieve.
   *
   * @returns The value of the attribute if it exists (even if null), or `undefined` if the key is not present.
   */
  const getAttributeValue = (
    nodeAttributes: Record<string, string | null | undefined>,
    attributeName: string,
  ) => {
    if (attributeName in nodeAttributes) {
      return nodeAttributes[attributeName];
    }
    return undefined;
  };

  /**
   * Image Id from attributes
   */
  const imageId: string =
    getAttributeValue(mdastNode.attributes, 'imageId') || '';

  const bgColor =
    !readOnly && !isPlayback && isHovered
      ? muiTheme.palette.mode === 'dark'
        ? '#282b30e6'
        : '#EEEEEEe6'
      : undefined;

  /**
   * Listen for mouse move
   * Store mouse position when Label/Marker button is clicked
   * clickPosition is used from ImageEditor to avoid dropping marker on the Add Marker button since the button is positioned inside the image area
   * set a flag when label is being dropped
   * @param e
   */
  const handleDragTextStart = useCallback(
    (e: any) => {
      const imgEl = document.getElementById(imageId);
      if (imgEl) {
        imageBounds.current = imgEl.getBoundingClientRect();
        console.log('imageBounds.current ', imageBounds.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (isDraggingRef.current) {
        console.log('STOP MD');
      } else {
        console.log('CHECK START MD');
        if (startTimeRef.current) {
          if (Date.now() - startTimeRef.current < 1000) {
            return;
          }
        }
        console.log('START MD');
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        isDraggingRef.current = true;
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        console.log('rect', rect);
        console.log('e.clientX', e.clientX);
        console.log('e.clientX', e.clientX);
        const xx = e.clientX - currentPosition[0];
        const yy = e.clientY - currentPosition[1];
        console.log('offset', [xx, yy]);
        currentOffset.current = [xx, yy];
        currentPositionRef.current = [currentPosition[0], currentPosition[1]];
      }
    },
    [currentPosition],
  );


  /**
   * Set marker position to follow mouse
   * @param e
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      //console.log('handleMouseMove', e.clientX);
      let nClientX = imageBounds.current
        ? Math.max(
            imageBounds.current.left,
            Math.min(imageBounds.current.right, e.clientX),
          )
        : e.clientX;
      let nClientY = imageBounds.current
        ? Math.max(
            imageBounds.current.top,
            Math.min(imageBounds.current.bottom, e.clientY),
          )
        : e.clientX;
      const xx = nClientX - currentOffset.current[0];
      const yy = nClientY - currentOffset.current[1];
      console.log('xx', xx);
      setCurrentPosition([xx, yy]);
      currentPositionRef.current = [xx, yy];
    },
    [setCurrentPosition, currentOffset],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      startTimeRef.current = Date.now();
      console.log('STOP2');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      console.log('updateMdastNode currentPosition', currentPosition);
      console.log(
        'clickImageTextPosition$.value',
        clickImageTextPosition$.value,
      );
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        updateMdastNode({
          ...mdastNode,
          attributes: {
            ...mdastNode.attributes,
            x: '' + currentPositionRef.current,
            y: '' + currentPositionRef.current,
          },
        });
        // updateTheThing();
      }
    },
    [currentPosition[0], currentPosition[1]],
  );

  /**
   * Find container div in ImageEditor to portal labels into
   * Retrieved with imageId
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.getElementById(`image-labels-${imageId}`);
      if (el) {
        setPortalTarget(el);
        clearInterval(interval);
      }
    }, 50);

    const xyPos = [0, 0];
    try {
      if (typeof mdastNode.attributes.x !== 'undefined') {
        xyPos[0] = parseFloat(mdastNode.attributes.x);
      }
      if (typeof mdastNode.attributes.y !== 'undefined') {
        xyPos[1] = parseFloat(mdastNode.attributes.y);
      }
    } catch (e) {
      debugLog('image text x y could not be parsed');
    }
    setCurrentPosition(xyPos);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Get the target DOM node
  if (portalTarget) {
    return createPortal(
      <>
        <Stack
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          direction="row"
          sx={{
            backgroundColor: bgColor,
            borderRadius: 16,
            position: 'absolute',
            left: currentPosition[0],
            top: currentPosition[1],
          }}
        >
          <IconButton onMouseDown={handleDragTextStart}>
            <DragIndicatorIcon color="warning" />
          </IconButton>
          <NestedLexicalEditor<ContainerDirective>
            block={true}
            getContent={(node) => {
              return node.children;
            }}
            getUpdatedMdastNode={(node, children: any) => ({
              ...node,
              children,
            })}
          />
          {!readOnly && !isPlayback && isHovered && (
            <IconButton
              aria-label="delete"
              onClick={(e) => {
                e.preventDefault();
                editor.update(() => {
                  lexicalNode?.remove();
                });
              }}
            >
              <DeleteForeverIcon />
            </IconButton>
          )}
        </Stack>
      </>,
      portalTarget, // Render the children into the portalTarget DOM node
    );
  }

  /**
   * Render blank, no target found
   */
  return (
    <Box
      sx={{
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
    />
  );
};
