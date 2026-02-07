import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
} from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';

import { Paragraph } from 'mdast';
import { fromMarkdown, type Options } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { useEffect, useMemo, useState } from 'react';


import Popper, { PopperPlacementType } from '@mui/material/Popper';
import { createPortal } from 'react-dom';
import { useSignalEffect } from '@preact/signals-react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  SxProps,
  Tooltip,
  useTheme,
} from '@mui/material';
import Fade from '@mui/material/Fade';

/** Icons */
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { ImageLabelDirectiveNode } from './types';
import { imageLabelKeys$ } from './vars';
import { useSelector } from 'react-redux';
import { ButtonIcon } from '../../../../utility/buttons';
import { debugLog } from '../../../../utility/logger';
import { editorInPlayback$ } from '../../state/vars';
import { dividerColor } from '@rapid-cmi5/ui';

/**
 * Accordion Editor for accordion directives
 * @param param0
 * @returns
 */
export const ImageLabelEditor: React.FC<
  DirectiveEditorProps<ImageLabelDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const [maxHeight, setMaxHeight] = useState<number>(999);
  const [maxWidth, setMaxWidth] = useState<number>(999);
  const [portalTarget, setPortalTarget] = useState<any>(null);

  const [isHovered, setIsHovered] = useState(false);
  const muiTheme = useTheme();
  const themedDividerColor = useSelector(dividerColor);

  const [sxProps, setSxProps] = useState<SxProps>({});
  const [title, setTitle] = useState(mdastNode.attributes.title);

  const [isPlayback, readOnly, syntaxExtensions] = useCellValues(
    editorInPlayback$,
    readOnly$,
    syntaxExtensions$,
  );

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
   * Label Title
   */
  const theTitle: string =
    getAttributeValue(mdastNode.attributes, 'title') || '';
  const transientId = lexicalNode.getKey();

  /**
   * Label Position from attributes
   */
  const pos = useMemo(() => {
    const xyPos = [0, 0];

    try {
      if (typeof mdastNode.attributes?.x !== 'undefined') {
        xyPos[0] = parseFloat(mdastNode.attributes.x);
      }
      if (typeof mdastNode.attributes?.y !== 'undefined') {
        xyPos[1] = parseFloat(mdastNode.attributes.y);
      }
    } catch (e) {
      debugLog('image label x y could not be parsed');
    }
    return xyPos;
  }, [mdastNode.attributes?.x, mdastNode.attributes?.y]);

  /**
   * Determines vertical or horizontal image layout
   * then sets placement based on what provides the most space for content
   * @returns
   */
  const checkLabelPlacement = () => {
    const imgEl = document.getElementById(imageId);
    if (imgEl) {
      const imageRect = imgEl.getBoundingClientRect();

      //pos 0 is X distance from image left to marker
      //pos 1 is Y dist from image top to marker

      // determine vertical or horizontal layout
      // then determine placement based on where there is the most space
      if (imageRect.height > imageRect.width) {
        //align top or bottom
        const bottomHeight = imageRect.height - pos[1];
        setMaxWidth(imageRect.width);
        if (pos[1] > bottomHeight) {
          //align left
          setPlacement('top');
          setMaxHeight(pos[1]);
        } else {
          //align right
          setPlacement('bottom');
          setMaxHeight(bottomHeight);
        }
      } else {
        //align left or right
        setMaxHeight(imageRect.height);
        const rightWidth = imageRect.width - pos[0];
        if (pos[0] > imageRect.width - pos[0]) {
          //align left
          setPlacement('left');
          setMaxHeight(pos[0]);
        } else {
          //align right
          setPlacement('right');
          setMaxHeight(rightWidth);
        }
      }
    }
  };
  /**
   * Open Label Content
   * @param event
   */
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (imageId) {
      checkLabelPlacement();

      setAnchorEl(event?.currentTarget);
      imageLabelKeys$.value = {
        ...imageLabelKeys$.value,
        [imageId]: transientId,
      };
    } else {
      debugLog('no imageId found for label');
    }
  };

  /**
   * Listen for image label open change
   * synch with local state
   */
  useSignalEffect(() => {
    const labels = imageLabelKeys$.value;
    if (Object.prototype.hasOwnProperty.call(labels, imageId)) {
      if (labels[imageId] === transientId) {
        setIsOpen(true);
        return;
      }
    }

    setIsOpen(false);
  });

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
    return () => clearInterval(interval);
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
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            borderRadius: 16,
            position: 'absolute',
            left: pos[0],
            top: pos[1],
          }}
        >
          <ButtonIcon
            name="image-marker"
            props={{
              onClick: (event) => {
                handleOpen(event);
              },
            }}
          >
            <AddCircleIcon color="warning" />
          </ButtonIcon>
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
        {/* disablePortal prevents breaking theme and layout */}
        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          autoFocus={true}
          placement={placement}
          transition
          sx={{ zIndex: 2 }}
          disablePortal
          keepMounted
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Stack
                direction="column"
                sx={{
                  maxWidth: maxWidth,
                  maxHeight: maxHeight,
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  borderColor: themedDividerColor,
                  borderStyle: 'solid',
                  borderWidth: '1px',
                }}
              >
                {/* title editor */}
                <Box sx={{ padding: 2 }}>
                  <NestedLexicalEditor<Paragraph>
                    getContent={(node) => {
                      const theNode = fromMarkdown(theTitle, {
                        extensions: syntaxExtensions,
                        mdastExtensions: null,
                      });
                      return theNode.children;
                    }}
                    getUpdatedMdastNode={(
                      mdastParagraphNode,
                      paragraphChildren: any,
                    ) => {
                      if (paragraphChildren.length > 0) {
                        const titleStr = toMarkdown(paragraphChildren[0]);
                        if (titleStr === title) {
                          return mdastParagraphNode;
                        }

                        setTitle(titleStr);

                        return {
                          ...mdastParagraphNode,
                          attributes: {
                            ...mdastNode.attributes,
                            title: titleStr,
                          },
                        };
                      }

                      return mdastParagraphNode;
                    }}
                  />
                </Box>
                <Divider sx={{ paddingTop: 0, marginBottom: 0 }} />
                {/* content editor */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    padding: 2,
                  }}
                >
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
                </Box>
              </Stack>
            </Fade>
          )}
        </Popper>
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
        ...sxProps,
      }}
    />
  );
};
