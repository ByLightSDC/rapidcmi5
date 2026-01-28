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
import { AccordionContentDirectiveNode, AccordionDirectiveNode } from './types';

import { $isElementNode } from 'lexical';
import { DEFAULT_ACCORDION } from './constants';
import ModalDialog from 'packages/ui/src/lib/modals/ModalDialog';
import { ButtonMinorUi, ButtonOptions } from 'packages/ui/src/lib/utility/buttons';
import { parseStyleString } from '../../../markdown/MarkDownParser';
import { editorInPlayback$ } from '../../state/vars';
import { convertMdastToMarkdown } from '../../util/conversion';

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
  const [sxProps, setSxProps] = useState<SxProps>({});
  const [formData, setFormData] = useState<
    Array<AccordionContentDirectiveNode>
  >(structuredClone(mdastNode.children));
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [editor] = useLexicalComposerContext();
  const [isConfiguring, setIsConfiguring] = useState(false);
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
   * Saves changes
   * inserts new node with updated content
   * removes the original
   * this flow is work around for not being able to create custom directive node without cloning the directives plugin
   * the accordionContent directives dont appear in the lexical tree, probably because the lexical DirectiveNode extends DecoratorNode which does not support children
   * the hasChildren property specifies that a directive can have children, but this does not add implementing append, getChildren, etc to the lexical node
   */
  const handleSubmit = useCallback(async () => {
    setIsConfiguring(false);
    if (!parentEditor) return;

    // first select AFTER the current accordion
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

    // Insert a brand new accordion directive node with updated accordions using markdown
    // using the insertMarkdown method ensures new node will have correct position information so nested content displays correctly
    // tried hard to find an alternate solution that would allow me to simply update existing mdastnode, but no solution found
    // since position data is generated from markdown and mdast utilities during parsing
    parentEditor.update(() => {
      const mdast: ContainerDirective = {
        type: 'containerDirective',
        name: 'accordion',
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
   * UE Synchs form data
   */
  useEffect(() => {
    //update content
    setFormData(mdastNode.children);

    if (mdastNode.attributes.style) {
      try {
        const theSx = parseStyleString(mdastNode.attributes.style);
        setSxProps(theSx);
      } catch (e) {
        // no styles applied
      }
    }
  }, [mdastNode]);

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
          ...sxProps,
        }}
      >
        <Stack direction="row" spacing={1}>
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
                <Tooltip title="Edit Sections">
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
      </Box>
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
