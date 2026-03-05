import {
  DirectiveEditorProps,
  insertMarkdown$,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
  usePublisher,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { BlockContent, DefinitionContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { $createParagraphNode, $getRoot } from 'lexical';

import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  SxProps,
  Tooltip,
  TypographyOwnProps,
  useTheme,
} from '@mui/material';

/** Icons */
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaletteIcon from '@mui/icons-material/Palette';
import SettingsIcon from '@mui/icons-material/Settings';

import { TextFieldMainUi } from '../../../../inputs/textfields/textfields';
import { AccordionContentDirectiveNode, AccordionDirectiveNode } from './types';

import { $isElementNode } from 'lexical';
import { DEFAULT_ACCORDION } from './constants';
import ModalDialog from '../../../../modals/ModalDialog';
import { ButtonMinorUi, ButtonOptions } from '../../../../utility/buttons';
import { parseStyleString } from '../../../markdown/MarkDownParser';
import { editorInPlayback$ } from '../../state/vars';
import { convertMdastToMarkdown } from '../../util/conversion';
import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { getDirectiveBlockShadow } from '../../../../styles/directiveStyles';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../../constants/colors';

/**
 * Accordion Editor for accordion directives
 * @param param0
 * @returns
 */
export const AccordionEditor: React.FC<
  DirectiveEditorProps<AccordionDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const [sxProps, setSxProps] = useState<SxProps>({});
  const [formData, setFormData] = useState<
    Array<AccordionContentDirectiveNode>
  >(structuredClone(mdastNode.children));
  const insertMarkdown = usePublisher(insertMarkdown$);
  const updateMdastNode = useMdastNodeUpdater();
  const [editor] = useLexicalComposerContext();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    mdastNode?.attributes.backgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [pendingColor, setPendingColor] = useState<string>(
    mdastNode?.attributes.backgroundColor ?? '',
  );
  const pendingColorRef = useRef(pendingColor);
  const skipNextCloseRebuildRef = useRef(false);
  const [isPlayback, readOnly, syntaxExtensions] = useCellValues(
    editorInPlayback$,
    readOnly$,
    syntaxExtensions$,
  );
  const removeNode = useLexicalNodeRemove();

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
   * Inserts new accordion before accordion index
   * @param index - Accordion index.
   */
  const handleAddAccordionBefore = useCallback(
    (index: number) => {
      const newContentNode = structuredClone(DEFAULT_ACCORDION);
      const children = [...formData];
      children.splice(index, 0, newContentNode);
      setFormData(children);
    },
    [formData],
  );

  /**
   * Inserts new accordion after accordion index
   * @param index - Accordion index.
   */
  const handleAddAccordionAfter = useCallback(
    (index: number) => {
      const newContentNode = structuredClone(DEFAULT_ACCORDION);
      const children = [...formData];
      if (index + 1 >= formData.length) {
        children.push(newContentNode);
      } else {
        children.splice(index + 1, 0, newContentNode);
      }
      setFormData(children);
    },
    [formData],
  );

  /**
   * Reverts changes
   */
  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Adds a accordion to the end
   */
  const handleAddAccordion = useCallback(() => {
    const children = [...formData];
    const newContentNode = structuredClone(DEFAULT_ACCORDION);
    children.push(newContentNode);
    setFormData(children);
  }, [formData]);

  /**
   * Removes accordion at accordion index
   * @param index - Accordion index.
   */
  const handleRemoveAccordion = useCallback(
    (index: number) => {
      const children = [...formData];
      children.splice(index, 1);
      setFormData(children);
    },
    [formData],
  );

  /**
   * Core rebuild: inserts a new accordion node with given data then removes old node.
   */
  const rebuildNode = useCallback(
    async (children: AccordionContentDirectiveNode[], bgColor: string) => {
      if (!parentEditor) return;

      parentEditor.update(() => {
        // Only use standard block nodes (paragraph/heading) as selection anchors.
        // TOCHeadingNode and other custom nodes extend ElementNode but can't be used for insertion.
        const SAFE_TYPES = new Set(['paragraph', 'heading']);
        const isSafeElement = (node: ReturnType<typeof lexicalNode.getNextSibling>) =>
          node !== null && $isElementNode(node) && SAFE_TYPES.has(node.getType());

        const nextSibling = lexicalNode.getNextSibling();
        const prevSibling = lexicalNode.getPreviousSibling();

        if (isSafeElement(nextSibling)) {
          nextSibling!.selectStart();
        } else if (isSafeElement(prevSibling)) {
          prevSibling!.selectEnd();
        } else {
          // No safe sibling — append a temporary paragraph to anchor the selection
          const para = $createParagraphNode();
          $getRoot().append(para);
          para.selectEnd();
        }
      });

      await delay(50);

      parentEditor.update(() => {
        const attributes: Record<string, string> = {};
        if (bgColor) {
          attributes['backgroundColor'] = bgColor;
        }

        const mdast: ContainerDirective = {
          type: 'containerDirective',
          name: 'accordion',
          attributes,
          children: [...children],
        };

        const childMarkdown = convertMdastToMarkdown(mdast as Mdast.RootContent);
        insertMarkdown(childMarkdown);
      });

      await delay(50);

      parentEditor.update(() => {
        lexicalNode.remove();
      });
    },
    [insertMarkdown, lexicalNode, parentEditor],
  );

  /**
   * Saves changes (from configure modal)
   */
  const handleSubmit = useCallback(async () => {
    setIsConfiguring(false);
    await rebuildNode(formData, backgroundColor);
  }, [rebuildNode, formData, backgroundColor]);

  /**
   * Clears the background color
   */
  /**
   * Updates just the backgroundColor attribute without a full node rebuild.
   * Safe for color-only changes — avoids the sibling selection issues of rebuildNode.
   */
  const updateColor = useCallback((color: string) => {
    const updatedAttributes = { ...mdastNode.attributes };
    if (color) {
      updatedAttributes.backgroundColor = color;
    } else {
      delete updatedAttributes.backgroundColor;
    }
    updateMdastNode({ ...mdastNode, attributes: updatedAttributes });
  }, [mdastNode, updateMdastNode]);

  const handleClearColor = useCallback(() => {
    setColorPickerAnchor(null);
    pendingColorRef.current = '';
    skipNextCloseRebuildRef.current = true;
    setPendingColor('');
    setBackgroundColor('');
    updateColor('');
  }, [updateColor]);

  /**
   * Updates accordion title text
   * @param index - Accordion index.
   */
  const handleUpdateAccordionText = useCallback(
    (index: number, text: string) => {
      const children = [...formData];
      children[index].attributes['title'] = text;
      setFormData(children);
    },
    [formData],
  );

  /**
   * list item props for Accordion Options
   */
  const listItemProps: TypographyOwnProps = {
    color: 'primary',
    fontSize: 'small',
    fontWeight: 'lighter',
    textTransform: 'none',
  };

  /**
   * Turns editing on
   * Triggers Modal
   */
  const handleConfigure = useCallback(() => {
    setIsConfiguring(!isConfiguring);
  }, [isConfiguring]);

  /**
   * Syncs form data, style and backgroundColor from mdastNode on change
   */
  useEffect(() => {
    setFormData(mdastNode.children);

    if (mdastNode.attributes.style) {
      try {
        const theSx = parseStyleString(mdastNode.attributes.style);
        setSxProps(theSx);
      } catch (e) {
        // no styles applied
      }
    }
    const bgColor = mdastNode.attributes.backgroundColor ?? '';
    setBackgroundColor(bgColor);
    pendingColorRef.current = bgColor;
    setPendingColor(bgColor);
  }, [mdastNode]);

  const dropShadow = getDirectiveBlockShadow(muiTheme);

  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(-${blockPadding} -100vmax -${blockPadding})`,
        backgroundColor,
      }
    : {
        boxShadow: dropShadow,
      };

  const innerSx: SxProps = backgroundColor
    ? {
        backgroundColor: muiTheme.palette.background.paper,
        // Remove all padding from the outer nestedEditor wrapper when bgcolor is active
        // (eliminates white border). Uses > to avoid affecting each accordion item's own editor.
        '& > [class*="_nestedEditor"]': {
          padding: 0,
        },
      }
    : {
        // Remove all padding from the outer nestedEditor wrapper (no bgcolor case).
        // Each accordion item's own nested editor retains its padding via the > selector.
        '& > [class*="_nestedEditor"]': {
          padding: 0,
        },
      };

  /**
   * Render Accordion and Nested Content
   */
  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 0,
          position: 'relative',
          // Always use flex row in edit mode so the gutter buttons are always a flex sibling
          // and never overlap the accordion content.
          ...(!isPlayback
            ? { display: 'flex', alignItems: 'flex-start', paddingRight: '20px' }
            : {}),
          ...outerSx,
          ...sxProps,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, ...innerSx }}>
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

        {!isPlayback && (
          <Box
            sx={{
              backgroundColor:
                muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
              display: 'flex',
              flexShrink: 0,
              alignSelf: 'flex-start',
            }}
          >
            <Tooltip title="Background Color">
              <IconButton
                onClick={(e) => {
                  pendingColorRef.current = backgroundColor;
                  setPendingColor(backgroundColor);
                  setColorPickerAnchor(e.currentTarget);
                }}
                size="small"
              >
                <PaletteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Sections">
              <IconButton onClick={handleConfigure}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="delete"
              disabled={readOnly}
              onClick={async (e) => {
                e.preventDefault();
                parentEditor.update(() => {
                  if (lexicalNode.getPreviousSibling()) {
                    lexicalNode.selectPrevious();
                  } else {
                    lexicalNode.selectNext();
                  }
                });
                await delay(50);
                removeNode();
              }}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <ColorSelectionPopover
        anchorEl={colorPickerAnchor}
        onClose={() => {
          setColorPickerAnchor(null);
          if (skipNextCloseRebuildRef.current) {
            skipNextCloseRebuildRef.current = false;
            return;
          }
          const latest = pendingColorRef.current;
          if (latest !== backgroundColor) {
            setBackgroundColor(latest);
            updateColor(latest);
          }
        }}
        lastColor={pendingColor}
        palette={SHAPE_PRESET_COLORS}
        onPickColor={(color) => {
          pendingColorRef.current = color;
          setPendingColor(color);
        }}
        onClear={handleClearColor}
        noneLabel="No background"
      />
      {isConfiguring && (
        <ModalDialog
          maxWidth="md"
          title="Edit Accordion"
          buttons={['Cancel', 'Apply']}
          dialogProps={{
            open: true,
          }}
          handleAction={(index: number) => {
            if (index === 0) {
              handleCancel();
            } else {
              handleSubmit();
            }
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
            }}
          >
            <Stack direction="column">
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    width: '100%',
                  }}
                >
                  <ButtonMinorUi
                    startIcon={<AddIcon />}
                    onClick={handleAddAccordion}
                  >
                    Add Section
                  </ButtonMinorUi>
                </div>
                {formData.map(
                  (
                    accordionContent: BlockContent | DefinitionContent,
                    index: number,
                  ) => {
                    if (
                      accordionContent.type === 'containerDirective' &&
                      accordionContent.attributes &&
                      Object.keys(accordionContent.attributes)
                    ) {
                      const theTitle = getAttributeValue(
                        accordionContent.attributes,
                        'title',
                      );

                      return (
                        <Stack direction="row">
                          <TextFieldMainUi
                            value={theTitle}
                            onChange={(textValue: string) => {
                              handleUpdateAccordionText(index, textValue);
                            }}
                          />
                          <ButtonOptions
                            optionButton={(
                              handleClick:
                                | React.MouseEventHandler<HTMLButtonElement>
                                | undefined,
                              tooltip: string,
                            ) => {
                              return (
                                <IconButton
                                  aria-label="accordion options"
                                  sx={{
                                    color: 'primary',
                                    maxHeight: '30px',
                                    marginTop: '12px',
                                  }}
                                  onClick={handleClick}
                                >
                                  <MoreVertIcon
                                    fontSize="inherit"
                                    color="inherit"
                                  />
                                </IconButton>
                              );
                            }}
                            closeOnClick={true}
                          >
                            <List
                              sx={{
                                backgroundColor: (theme: any) =>
                                  `${theme.nav.fill}`,
                                color: (theme: any) => `${theme.nav.icon}`,
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                height: 'auto',
                              }}
                              component="nav"
                            >
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleAddAccordionBefore(index);
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    padding: '0px',
                                    margin: '0px',
                                    marginRight: '2px',
                                    minWidth: '0px',
                                  }}
                                >
                                  <AddIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Insert Accordion Before"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleAddAccordionAfter(index);
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    padding: '0px',
                                    margin: '0px',
                                    marginRight: '2px',
                                    minWidth: '0px',
                                  }}
                                >
                                  <AddIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Insert Accordion After"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleRemoveAccordion(index);
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    padding: '0px',
                                    margin: '0px',
                                    marginRight: '2px',
                                    minWidth: '0px',
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Remove Accordion"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                            </List>
                          </ButtonOptions>
                        </Stack>
                      );
                    }
                    return null;
                  },
                )}
              </>
            </Stack>
          </Paper>
        </ModalDialog>
      )}
    </>
  );
};
