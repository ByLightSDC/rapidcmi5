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
  const [currentPosition, setCurrentPosition] = useState([0, 0]);
  const currentPositionRef = useRef<number[]>([0, 0]);
  const currentDimensionsRef = useRef<number[]>([0, 0]);
  const boxRef = useRef<HTMLDivElement | null>(null);

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

    /**
     * Background color context menu
     */
  const bgColor =
    !readOnly && !isPlayback && isHovered
      ? muiTheme.palette.mode === 'dark'
        ? '#282b30cc'
        : '#EEEEEEcc'
      : undefined;

  /**
   * Start listening for mouse move
   * Store offset position bw mouse and move target
   * Set flag
   * @param e
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      // store image rect dimensions for the purpose of keeping text inside image area
      const imgEl = document.getElementById(imageId);
      if (imgEl) {
        imageBounds.current = imgEl.getBoundingClientRect();
      }

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (isDraggingRef.current) {
        //stop dragging will be processed by mouse up handler
      } else {
        // start listeners and set flag
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        isDraggingRef.current = true;

        // store label dimensions for the purpose of keeping text inside image area
        if (boxRef.current) {
          const rect = boxRef.current.getBoundingClientRect();
          currentDimensionsRef.current[0] = rect.width;
          currentDimensionsRef.current[1] = rect.height;
        }

        // save offset and current position
        const xx = e.clientX - currentPosition[0];
        const yy = e.clientY - currentPosition[1];
        currentOffset.current = [xx, yy];
        currentPositionRef.current = [currentPosition[0], currentPosition[1]];
      }
    },
    [currentPosition],
  );

  /**
   * Set text position to follow mouse
   * Don't allow it outside of the box
   * @param e
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const newClientX = imageBounds.current
        ? Math.max(
            imageBounds.current.left,
            Math.min(
              imageBounds.current.right - currentDimensionsRef.current[0],
              e.clientX,
            ),
          )
        : e.clientX;
      const newClientY = imageBounds.current
        ? Math.max(
            imageBounds.current.top,
            Math.min(
              imageBounds.current.bottom - currentDimensionsRef.current[1],
              e.clientY,
            ),
          )
        : e.clientX;
      const xx = newClientX - currentOffset.current[0];
      const yy = newClientY - currentOffset.current[1];
      setCurrentPosition([xx, yy]);
      currentPositionRef.current = [xx, yy];
    },
    [setCurrentPosition, currentOffset],
  );

  /**
   * Stop drag listeners and update mdast node position
   */
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        updateMdastNode({
          ...mdastNode,
          attributes: {
            ...mdastNode.attributes,
            x: '' + currentPositionRef.current[0],
            y: '' + currentPositionRef.current[1],
          },
        });
      }
    },
    [currentPosition[0], currentPosition[1]],
  );

  /**
   * UE parses starting position
   */
  useEffect(() => {
    // get portal layer to draw text into
    const interval = setInterval(() => {
      const el = document.getElementById(`image-labels-${imageId}`);
      if (el) {
        setPortalTarget(el);
        clearInterval(interval);
      }
    }, 50);

    // set default current position based on mdast attributes x & y
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
          ref={boxRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          direction="row"
          sx={{
            backgroundColor: bgColor,
            borderRadius: 4,
            position: 'absolute',
            left: currentPosition[0],
            top: currentPosition[1],
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Stack
            direction="row"
            sx={{
              minWidth: '32px',
              maxHeight: '32px',
            }}
          >
            {!readOnly && !isPlayback && isHovered && (
              <IconButton onMouseDown={handleMouseDown}>
                <DragIndicatorIcon color="warning" />
              </IconButton>
            )}
          </Stack>

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
              sx={{ maxHeight: '32px' }}
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
