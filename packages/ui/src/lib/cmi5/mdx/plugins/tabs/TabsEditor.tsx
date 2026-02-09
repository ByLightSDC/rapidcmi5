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
import { useCallback, useEffect, useState } from 'react';

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
import SettingsIcon from '@mui/icons-material/Settings';

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
   * Inserts new tab before tab index
   * @param index - Tab index.
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
   * @param index - Tab index.
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
   * @param index - Tab index.
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
   * Saves changes
   * inserts new node with updated content
   * removes the original
   * this flow is work around for not being able to create custom directive node without cloning the directives plugin
   * the tabContent directives dont appear in the lexical tree, probably because the lexical DirectiveNode extends DecoratorNode which does not support children
   * the hasChildren property specifies that a directive can have children, but this does not add implementing append, getChildren, etc to the lexical node
   */
  const handleSubmit = useCallback(async () => {
    setIsConfiguring(false);
    if (!parentEditor) return;

    // first select AFTER the current tab
    parentEditor.update(() => {
      const nextSibling = lexicalNode.getNextSibling();
      if (nextSibling) {
        nextSibling.selectStart();
      } else {
        const root = $getRoot();
        const lastChild = root.getChildren().at(-1);
        if (lastChild) {
          // If it's a text container (like paragraph), move cursor to end
          if ($isElementNode(lastChild)) {
            const lastText = lastChild.getLastDescendant();
            if (lastText) {
              lastText.selectEnd();
            } else {
              lastChild.selectEnd();
            }
          } else {
            // If it's just a text node
            lastChild.selectEnd();
          }
        }
      }
    });
    //selection is not immediate
    await delay(50);

    // Insert a brand new tab directive node with updated tabs using markdown
    // using the insertMarkdown method ensures new node will have correct position information so nested content displays correctly
    // tried hard to find an alternate solution that would allow me to simply update existing mdastnode, but no solution found
    // since position data is generated from markdown and mdast utilities during parsing
    parentEditor.update(() => {
      const mdast: ContainerDirective = {
        type: 'containerDirective',
        name: 'tabs',
        attributes: {
          color: 'transparent',
        },
        children: [...formData],
      };

      const childMarkdown = convertMdastToMarkdown(mdast as Mdast.RootContent);

      insertMarkdown(childMarkdown);
    });
    //selection is not immediate
    await delay(50);

    //remove original node
    parentEditor.update(() => {
      lexicalNode.remove();
    });
  }, [insertMarkdown, formData, lexicalNode, parentEditor]);

  /**
   * Handle Change Tab
   * @param event
   * @param newValue
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  /**
   * Updates tab title text
   * @param index - Tab index.
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
   * Triggers Modal
   */
  const handleConfigure = useCallback(() => {
    setIsConfiguring(!isConfiguring);
  }, [isConfiguring]);

  /**
   * Sets position offset of selected tab item
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
  }, [tab, mdastNode]);

  /**
   * Render Tabs and Nested Content
   */
  return (
    <>
      <Box sx={{ margin: 0, padding: 0, position: 'relative', ...sxProps }}>
        <Stack direction="row" spacing={1}>
          <Tabs
            sx={{ minWidth: 'maxContent' }}
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
          <div>
            {!isPlayback && (
              <Box
                sx={{
                  backgroundColor:
                    muiTheme.palette.mode === 'dark'
                      ? '#282b30e6'
                      : '#EEEEEEe6',
                  position: 'absolute',
                  display: 'flex',
                }}
              >
                <Tooltip title="Edit Tabs Settings">
                  <IconButton onClick={handleConfigure}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <IconButton
                  aria-label="delete"
                  disabled={readOnly}
                  onClick={(e) => {
                    e.preventDefault();
                    editor.update(() => {
                      lexicalNode?.remove();
                    });
                  }}
                >
                  <DeleteForeverIcon />
                </IconButton>
              </Box>
            )}
          </div>
        </Stack>

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
                        <Stack direction="row">
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
              {/* Style section FUTURE */}
              {/* <Grid2 container alignItems="center" sx={{ width: '100%' }}>
                <Grid2 size={1}>
                  <ButtonIcon
                    name="edit-style"
                    props={{
                      onClick: (event) => {
                        //setIsStyleDialogOpen(true);
                      },
                    }}
                  >
                    <Tooltip
                      arrow
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Edit Tab Inline Styles"
                    >
                      <EditIcon />
                    </Tooltip>
                  </ButtonIcon>
                </Grid2>
                <Grid2 size={11}>
                  <TextFieldMainUi
                    autoFocus
                    margin="dense"
                    label="Styles"
                    name="image-styles"
                    type="text"
                    fullWidth
                    value={boxStyle}
                    onChange={(textValue: string) => setBoxStyle(textValue)}
                    onClick={() => {
                      //setIsStyleDialogOpen(true);
                    }}
                    infoText="Inline styles Ex. opacity:0.5;"
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                  />
                </Grid2>
              </Grid2> */}
            </Stack>
          </Paper>
        </ModalDialog>
      )}
    </>
  );
};
