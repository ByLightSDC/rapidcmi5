import {
  DirectiveEditorProps,
  insertMarkdown$,
  NestedLexicalEditor,
  readOnly$,
  syntaxExtensions$,
  useCellValues,
  usePublisher,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { BlockContent, DefinitionContent } from 'mdast';
import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { $getRoot } from 'lexical';

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
  Tab,
  Tabs,
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
import EditIcon from '@mui/icons-material/Edit';

import { TextFieldMainUi } from '../../../../inputs/textfields/textfields';
import { TabsContext } from './TabsContext';
import { TabContentDirectiveNode, TabDirectiveNode } from './types';

import { $isElementNode } from 'lexical';
import { DEFAULT_TAB } from './constants';
import { darkTab } from './styles';
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
 * Tabs Editor for tabs directive
 * @param param0
 * @returns
 */
export const TabsEditor: React.FC<DirectiveEditorProps<TabDirectiveNode>> = ({
  lexicalNode,
  mdastNode,
  parentEditor,
}) => {
  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  // When a theme is set but padding is None, resolvedThemeCSS.blockPadding is null — use 0.
  // When no theme is set at all (resolvedThemeCSS is null), default to M (32px).
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const [tab, setTab] = useState(0);

  const [formData, setFormData] = useState<Array<TabContentDirectiveNode>>(
    structuredClone(mdastNode.children),
  );
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [editor] = useLexicalComposerContext();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [boxStyle, setBoxStyle] = useState<string | undefined>(
    mdastNode?.attributes.style,
  );
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

  /**
   * Accessibility params
   * @param index
   * @returns
   */
  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  };

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
   * Inserts new tab before tab index
   */
  const handleAddTabBefore = useCallback(
    (index: number) => {
      const newTabContentNode = structuredClone(DEFAULT_TAB);
      const children = [...formData];
      children.splice(index, 0, newTabContentNode);
      setFormData(children);
    },
    [formData],
  );

  /**
   * Inserts new tab after tab index
   */
  const handleAddTabAfter = useCallback(
    (index: number) => {
      const newTabContentNode = structuredClone(DEFAULT_TAB);
      const children = [...formData];
      if (index + 1 >= formData.length) {
        children.push(newTabContentNode);
      } else {
        children.splice(index + 1, 0, newTabContentNode);
      }

      setFormData(children);
    },
    [formData],
  );

  /**
   * Adds a tab to the end
   */
  const handleAddTab = useCallback(() => {
    const children = [...formData];
    const newTabContentNode = structuredClone(DEFAULT_TAB);
    children.push(newTabContentNode);
    setFormData(children);
  }, [formData]);

  /**
   * Reverts changes
   */
  const handleCancel = () => {
    setIsConfiguring(false);
  };

  /**
   * Removes tab at tab index
   */
  const handleRemoveTab = useCallback(
    (index: number) => {
      const children = [...formData];
      children.splice(index, 1);
      setFormData(children);
    },
    [formData],
  );

  /**
   * Core rebuild: inserts a new tabs node with given data then removes old node.
   * Used by both handleSubmit (tab management) and handleApplyColor.
   */
  const rebuildNode = useCallback(
    async (children: TabContentDirectiveNode[], bgColor: string) => {
      if (!parentEditor) return;

      // select AFTER the current tab first
      parentEditor.update(() => {
        const nextSibling = lexicalNode.getNextSibling();
        if (nextSibling) {
          nextSibling.selectStart();
        } else {
          const root = $getRoot();
          const lastChild = root.getChildren().at(-1);
          if (lastChild) {
            if ($isElementNode(lastChild)) {
              const lastText = lastChild.getLastDescendant();
              if (lastText) {
                lastText.selectEnd();
              } else {
                lastChild.selectEnd();
              }
            } else {
              lastChild.selectEnd();
            }
          }
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
          name: 'tabs',
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
   * Saves tab structure changes (from configure modal)
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
   * Handle Change Tab
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  /**
   * Updates tab title text
   */
  const handleUpdateTabText = useCallback(
    (index: number, text: string) => {
      const children = [...formData];
      children[index].attributes['title'] = text;
      setFormData(children);
    },
    [formData],
  );

  /**
   * list item props for Tab Options
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
  }, [tab, mdastNode]);

  const dropShadow = getDirectiveBlockShadow(muiTheme);

  // Outer box: full-width background color band when backgroundColor is set,
  // otherwise a plain drop shadow block.
  // clipPath negative top/bottom insets absorb the decorator margin-top/bottom gap
  // added by lesson theme CSS, so the colored band fills flush to adjacent blocks.
  // No extra paddingTop/Bottom needed — the clip-path extension provides the visual fill.
  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(-${blockPadding} -100vmax -${blockPadding})`,
        backgroundColor,
      }
    : {};

  // Inner box: fills all available width (lesson content width applies to text
  // inside via lesson theme CSS, not to this container). Page background color
  // creates the visual separation from the outer colored band.
  const innerSx: SxProps = backgroundColor
    ? {
        backgroundColor: muiTheme.palette.background.paper,
        boxShadow: DIRECTIVE_INNER_BOX_SHADOW,
      }
    : {};

  /**
   * Render Tabs and Nested Content
   */
  return (
    <>
      {/* Outer box is a flex row: inner content expands, gutter sits to its right.
          paddingRight: 20px keeps the gutter 20px from the right edge of the content area
          (which equals the viewport right edge at L content width). */}
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
          <Tabs
            variant="fullWidth"
            sx={{ width: '100%' }}
            value={tab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            textColor="secondary"
            indicatorColor="primary"
          >
            {mdastNode.children.map((item, index) => {
              if (
                (item.type === 'containerDirective' ||
                  item.type === 'leafDirective') &&
                item.name === 'tabContent'
              ) {
                return (
                  <Tab
                    //force dark theme styling in RC5Player since CMI5 player does not support theme switching
                    sx={
                      readOnly
                        ? { ...darkTab, borderRadius: 0 }
                        : { borderRadius: 0 }
                    }
                    label={item.attributes?.title}
                    {...a11yProps(index)}
                    key={index}
                  />
                );
              }

              return null;
            })}
          </Tabs>

          <TabsContext.Provider value={{ tab }}>
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
          </TabsContext.Provider>
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

            <Tooltip title="Edit Tabs Settings">
              <IconButton onClick={handleConfigure}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              aria-label="delete"
              disabled={readOnly}
              onClick={(e) => {
                e.preventDefault();
                parentEditor.update(() => {
                  if (lexicalNode.getPreviousSibling()) {
                    lexicalNode.selectPrevious();
                  } else {
                    lexicalNode.selectNext();
                  }
                  lexicalNode.remove();
                });
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
          title="Edit Tabs"
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
                  <ButtonMinorUi startIcon={<AddIcon />} onClick={handleAddTab}>
                    Add Tab
                  </ButtonMinorUi>
                </div>
                {formData.map(
                  (
                    tabContent: BlockContent | DefinitionContent,
                    index: number,
                  ) => {
                    if (
                      tabContent.type === 'containerDirective' &&
                      tabContent.attributes &&
                      Object.keys(tabContent.attributes)
                    ) {
                      const theTitle = getAttributeValue(
                        tabContent.attributes,
                        'title',
                      );

                      return (
                        <Stack direction="row" key={index}>
                          <TextFieldMainUi
                            value={theTitle}
                            onChange={(textValue: string) => {
                              handleUpdateTabText(index, textValue);
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
                                  aria-label="tab options"
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
                                  handleAddTabBefore(index);
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
                                  primary="Insert Tab Before"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleAddTabAfter(index);
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
                                  primary="Insert Tab After"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleRemoveTab(index);
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
                                  primary="Remove Tab"
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
