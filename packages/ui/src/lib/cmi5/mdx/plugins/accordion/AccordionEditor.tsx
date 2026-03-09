import {
  DirectiveEditorProps,
  insertMarkdown$,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
  useLexicalNodeRemove,
  usePublisher,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { BlockContent, DefinitionContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { $createParagraphNode } from 'lexical';

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
import EditIcon from '@mui/icons-material/Edit';

import { TextFieldMainUi } from '../../../../inputs/textfields/textfields';
import { AccordionContentDirectiveNode, AccordionDirectiveNode } from './types';

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
import {
  DIRECTIVE_GUTTER_GAP,
  DIRECTIVE_GUTTER_PADDING_RIGHT,
  DIRECTIVE_INNER_BOX_SHADOW,
} from '../../constants/directiveLayout';

/**
 * Accordion Editor for accordion directive
 */
export const AccordionEditor: React.FC<
  DirectiveEditorProps<AccordionDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const [formData, setFormData] = useState<Array<AccordionContentDirectiveNode>>(
    structuredClone(mdastNode.children),
  );
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [editor] = useLexicalComposerContext();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [sxProps, setSxProps] = useState<SxProps>({});
  const [backgroundColor, setBackgroundColor] = useState<string>(
    mdastNode?.attributes.backgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [pendingColor, setPendingColor] = useState<string>(
    mdastNode?.attributes.backgroundColor ?? '',
  );
  // Ref so onClose always sees the latest pendingColor regardless of closure staleness.
  const pendingColorRef = useRef(pendingColor);
  // Set to true when handleClearColor already rebuilt, so onClose skips its rebuild.
  const skipNextCloseRebuildRef = useRef(false);
  const colorPickerOpen = Boolean(colorPickerAnchor);
  const [isPlayback, readOnly, syntaxExtensions] = useCellValues(
    editorInPlayback$,
    readOnly$,
    syntaxExtensions$,
  );
  const removeNode = useLexicalNodeRemove();

  /**
   * Safely retrieves the value of a specific attribute from a node's attributes object.
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
   * Adds an accordion to the end
   */
  const handleAddAccordion = useCallback(() => {
    const children = [...formData];
    const newContentNode = structuredClone(DEFAULT_ACCORDION);
    children.push(newContentNode);
    setFormData(children);
  }, [formData]);

  /**
   * Reverts changes
   */
  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Removes accordion at index
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
   * Used by both handleSubmit (section management) and handleApplyColor.
   */
  const rebuildNode = useCallback(
    async (children: AccordionContentDirectiveNode[], bgColor: string) => {
      if (!parentEditor) return;

      // Insert a plain paragraph immediately after lexicalNode as the insertion anchor.
      // We cannot use nextSibling.selectStart() because it could be a DecoratorNode
      // (e.g. TOCHeadingNode), which yields a NodeSelection rather than a RangeSelection,
      // causing insertMarkdown to throw "Expected node N to have a parent".
      // We insert the safe paragraph as a sibling (not root append) so that insertMarkdown
      // places the rebuilt node at the correct position in the document.
      parentEditor.update(() => {
        const safeParagraph = $createParagraphNode();
        lexicalNode.insertAfter(safeParagraph);
        safeParagraph.selectEnd();
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

        const childMarkdown = convertMdastToMarkdown(
          mdast as Mdast.RootContent,
        );
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
   * Saves accordion structure changes (from configure modal)
   */
  const handleSubmit = useCallback(async () => {
    setIsConfiguring(false);
    await rebuildNode(formData, backgroundColor);
  }, [rebuildNode, formData, backgroundColor]);

  /**
   * Clears the background color
   */
  const handleClearColor = useCallback(async () => {
    setColorPickerAnchor(null);
    pendingColorRef.current = '';
    skipNextCloseRebuildRef.current = true;
    setPendingColor('');
    setBackgroundColor('');
    await rebuildNode(formData, '');
  }, [rebuildNode, formData]);

  /**
   * Updates accordion title text
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
   */
  const handleConfigure = useCallback(() => {
    setIsConfiguring(!isConfiguring);
  }, [isConfiguring]);

  /**
   * Syncs style and backgroundColor from mdastNode on change
   */
  useEffect(() => {
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

  // Outer box: full-width background color band when backgroundColor is set,
  // otherwise a plain drop shadow block.
  // clipPath negative top/bottom insets absorb the decorator margin-top/bottom gap
  // added by lesson theme CSS, so the colored band fills flush to adjacent blocks.
  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(-${blockPadding} -100vmax -${blockPadding})`,
        backgroundColor,
      }
    : {};

  // Inner box: page background color creates the visual separation from the outer colored band.
  const innerSx: SxProps = backgroundColor
    ? {
        backgroundColor: muiTheme.palette.background.paper,
        boxShadow: DIRECTIVE_INNER_BOX_SHADOW,
      }
    : {};

  /**
   * Render Accordion and Nested Content
   */
  return (
    <>
      {/* Outer box is a flex row: inner content expands, gutter sits to its right. */}
      <Box
        sx={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: isPlayback ? 0 : DIRECTIVE_GUTTER_GAP,
          paddingRight: isPlayback ? 0 : DIRECTIVE_GUTTER_PADDING_RIGHT,
          ...outerSx,
          ...sxProps,
        }}
      >
        {/* Inner content box — flex:1 fills all space left of the gutter */}
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
            contentEditableProps={{
              style: { background: 'transparent', padding: 0 },
            }}
          />
        </Box>

        {/* Gutter buttons — flex sibling, sits in the colored band to the right of the inner box */}
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

            <Tooltip title="Edit Accordion Settings">
              <IconButton onClick={handleConfigure}>
                <EditIcon />
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

      {/* Background Color Popover */}
      <ColorSelectionPopover
        anchorEl={colorPickerAnchor}
        onClose={() => {
          // onClose fires on both swatch selection and backdrop dismiss.
          // Use the ref (not state) so we always see the latest value even
          // when setPendingColor and onClose fire in the same React batch.
          // Skip if handleClearColor already rebuilt (None swatch path).
          setColorPickerAnchor(null);
          if (skipNextCloseRebuildRef.current) {
            skipNextCloseRebuildRef.current = false;
            return;
          }
          const latest = pendingColorRef.current;
          if (latest !== backgroundColor) {
            setBackgroundColor(latest);
            rebuildNode(formData, latest);
          }
        }}
        lastColor={pendingColor}
        palette={SHAPE_PRESET_COLORS}
        onPickColor={(color) => {
          // Track locally; rebuild happens in onClose (once) to avoid repeated
          // lexical node removal when MuiColorInput fires on every keystroke.
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
                        <Stack direction="row" key={index}>
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
                                sx={{ height: 30 }}
                                onClick={() => {
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
                                  primary="Insert Section Before"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{ height: 30 }}
                                onClick={() => {
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
                                  primary="Insert Section After"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{ height: 30 }}
                                onClick={() => {
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
                                  primary="Remove Section"
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
