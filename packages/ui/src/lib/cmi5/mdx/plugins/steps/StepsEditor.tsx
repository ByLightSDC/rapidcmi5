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
import { toMarkdown } from 'mdast-util-to-markdown';
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
  Typography,
  TypographyOwnProps,
  useTheme,
} from '@mui/material';

/** Icons */
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
//REF import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIconButton from '../../components/DeleteIconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
//REF import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import PaletteIcon from '@mui/icons-material/Palette';
import InsertLineReturnButton from '../../components/InsertLineReturnButton';

import { TextFieldMainUi } from '../../../../inputs/textfields/textfields';
import { StepsContext } from './StepsContext';
import { StepContentDirectiveNode, StepDirectiveNode } from './types';

import { $isElementNode } from 'lexical';
import { DEFAULT_STEP } from './constants';
import ModalDialog from '../../../../modals/ModalDialog';
import {
  ButtonIcon,
  ButtonMinorUi,
  ButtonOptions,
} from '../../../../utility/buttons';
import { parseStyleString } from '../../../markdown/MarkDownParser';
import { editorInPlayback$ } from '../../state/vars';
import {
  convertMarkdownToMdast,
  convertMdastToMarkdown,
} from '../../util/conversion';
import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { ColorSelectionPopover } from '../../../../colors/ColorSelectionPopover';
import { SHAPE_PRESET_COLORS } from '../../constants/colors';

/**
 * Steps Editor for steps directive
 * @param param0
 * @returns
 */
export const StepsEditor: React.FC<DirectiveEditorProps<StepDirectiveNode>> = ({
  lexicalNode,
  mdastNode,
  parentEditor,
}) => {
  const muiTheme = useTheme();
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [editor] = useLexicalComposerContext();

  const [formData, setFormData] = useState<Array<StepContentDirectiveNode>>(
    structuredClone(mdastNode.children),
  );
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [step, setStep] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [sxProps, setSxProps] = useState<SxProps>({});
  const [title, setTitle] = useState('');

  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const blockPadding = resolvedThemeCSS ? (resolvedThemeCSS.blockPadding ?? '0px') : '32px';
  const hasGutter = !!resolvedThemeCSS?.maxWidth && resolvedThemeCSS.maxWidth !== '100%';

  const gutterRef = useRef<HTMLDivElement>(null);
  const [gutterRight, setGutterRight] = useState('-100px');
  const [backgroundColor, setBackgroundColor] = useState<string>(
    mdastNode?.attributes?.backgroundColor ?? '',
  );
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLButtonElement | null>(null);
  const [pendingColor, setPendingColor] = useState<string>(
    mdastNode?.attributes?.backgroundColor ?? '',
  );
  const pendingColorRef = useRef(pendingColor);
  const skipNextCloseRebuildRef = useRef(false);

  useEffect(() => {
    if (gutterRef.current) {
      const w = gutterRef.current.offsetWidth;
      setGutterRight(`-${w + 15}px`);
    }
  }, []);

  const a11yStepProps = (index: number) => ({
    id: `step-${index}`,
    'aria-controls': `step-panel-${index}`,
  });

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
   * Inserts new step before step index
   * @param index - Step index.
   */
  const handleAddStepBefore = useCallback(
    (index: number) => {
      const newStepContentNode = structuredClone(DEFAULT_STEP);
      const children = [...formData];
      children.splice(index, 0, newStepContentNode);
      setFormData(children);
    },
    [formData],
  );

  /**
   * Inserts new step after step index
   * @param index - Step index.
   */
  const handleAddStepAfter = useCallback(
    (index: number) => {
      const newTabContentNode = structuredClone(DEFAULT_STEP);
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
   * Adds a step to the end
   */
  const handleAddStep = useCallback(() => {
    const children = [...formData];
    const newTabContentNode = structuredClone(DEFAULT_STEP);
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
   * Removes step at tab index
   * @param index - Step index.
   */
  const handleRemoveStep = useCallback(
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

    parentEditor.update(() => {
      const nextSibling = lexicalNode.getNextSibling();
      if (nextSibling) {
        nextSibling.selectStart();
      } else {
        lexicalNode.selectEnd();
      }
    });
    //selection is not immediate
    await delay(50);

    // Insert a brand new stepper directive node with updated tabs using markdown
    // using the insertMarkdown method ensures new node will have correct position information so nested content displays correctly
    // tried hard to find an alternate solution that would allow me to simply update existing mdastnode, but no solution found
    // since position data is generated from markdown and mdast utilities during parsing
    parentEditor.update(() => {
      const attributes: Record<string, string> = { color: 'transparent' };
      if (backgroundColor) attributes['backgroundColor'] = backgroundColor;
      const mdast: ContainerDirective = {
        type: 'containerDirective',
        name: 'steps',
        attributes,
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
  }, [insertMarkdown, formData, backgroundColor, lexicalNode, parentEditor]);

  const handleClearColor = useCallback(() => {
    setColorPickerAnchor(null);
    pendingColorRef.current = '';
    skipNextCloseRebuildRef.current = true;
    setPendingColor('');
    setBackgroundColor('');
    parentEditor.update(() => {
      const attrs = { ...mdastNode.attributes };
      delete attrs.backgroundColor;
      lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
    }, { discrete: true });
  }, [lexicalNode, mdastNode, parentEditor]);

  /**
   * Handle Next Step
   * @param event
   */
  const handleNext = useCallback(
    (event: React.SyntheticEvent) => {
      setStep(step + 1);
    },
    [step],
  );

  /**
   * Handle Previous Step
   * @param event
   */
  const handlePrevious = useCallback(
    (event: React.SyntheticEvent) => {
      setStep(step - 1);
    },
    [step],
  );

  /**
   * Reset step to beginning
   * @param event
   */
  const handleReset = (event: React.SyntheticEvent) => {
    setStep(0);
  };

  /**
   * Set step to a given value
   * @param event
   */
  const handleStepChange = (newValue: number) => {
    setStep(newValue);
  };

  /**
   * Updates step title text
   * @param index - Step index.
   */
  const handleUpdateStepText = useCallback(
    (index: number, text: string) => {
      const children = [...formData];
      children[index].attributes['title'] = text;
      setFormData(children);
    },
    [formData],
  );

  /**
   * list item props for Step Options
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
   * UE Sets title for current step
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

    if (
      Object.prototype.hasOwnProperty.call(
        mdastNode.children[step].attributes,
        'title',
      )
    ) {
      setTitle(mdastNode.children[step].attributes['title'] || '');
    } else {
      setTitle('');
    }

    // setTitle
  }, [step, mdastNode]);

  /**
   * UE calculates step count
   */
  useEffect(() => {
    let maxSteps = 0;
    for (let i = 0; i < mdastNode.children.length; i++) {
      if (mdastNode.children[i].name === 'stepContent') {
        maxSteps++;
      }
    }
    setStepCount(maxSteps);
  }, [mdastNode?.children?.length]);

  // Sync backgroundColor from mdastNode
  useEffect(() => {
    const bgColor = mdastNode?.attributes?.backgroundColor ?? '';
    setBackgroundColor(bgColor);
    pendingColorRef.current = bgColor;
    setPendingColor(bgColor);
  }, [mdastNode]);

  const outerSx: SxProps = backgroundColor
    ? {
        boxShadow: `0 0 0 100vmax ${backgroundColor}`,
        clipPath: `inset(0 -100vmax 0)`,
        backgroundColor,
        paddingTop: blockPadding,
        paddingBottom: blockPadding,
      }
    : {};

  /**
   * Render Steps and Nested Content
   */
  return (
    <>
      <Box
        {...(backgroundColor ? { 'data-bgcolor': 'true' } : {})}
        sx={{
          margin: 0,
          padding: 0,
          position: 'relative',
          ...outerSx,
          ...sxProps,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
          }}
        >
          <ButtonIcon
            id="previous-step"
            name="previous-step"
            tooltip="Previous Step"
            props={{
              disabled: step <= 0,
              onClick: handlePrevious,
            }}
            sxProps={{
              width: '48px',
              height: '48px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <ArrowBackIosIcon
                fontSize="large"
                sx={{
                  position: 'absolute',
                  left: '-12px',
                  top: '-18px',
                }}
              />
            </div>
          </ButtonIcon>

          <Stack direction="column" sx={{ flexGrow: 1 }}>
            <StepsContext.Provider value={{ step }}>
              <div>
                {!isPlayback && (
                  <Box
                    ref={gutterRef as any}
                    sx={{
                      backgroundColor:
                        muiTheme.palette.mode === 'dark'
                          ? '#282b30e6'
                          : '#EEEEEEe6',
                      position: 'absolute',
                      display: 'flex',
                      top: backgroundColor ? blockPadding : 0,
                      right: hasGutter ? gutterRight : 0,
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
                    <Tooltip title="Edit Steps Settings">
                      <IconButton onClick={handleConfigure}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <InsertLineReturnButton parentEditor={parentEditor} lexicalNode={lexicalNode} />
                    <DeleteIconButton
                      onDelete={() => {
                        parentEditor.update(() => {
                          if (lexicalNode.getPreviousSibling()) {
                            lexicalNode.selectPrevious();
                          } else {
                            lexicalNode.selectNext();
                          }
                          lexicalNode.remove();
                        });
                      }}
                    />
                  </Box>
                )}
              </div>
              {/* title  */}
              <Stack
                direction="column"
                sx={{
                  padding: 2,
                  boxShadow: 2,
                  borderColor: (theme: any) => `${theme.palette.divider}`,
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  backgroundColor: (theme: any) => theme.palette.background.paper,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ padding: 2 }} variant="h2">
                    {title}
                  </Typography>
                </Box>

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
                    'aria-label': title ? `${title} step content` : 'Step content',
                  }}
                />
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    paddingTop: 2,
                  }}
                >
                  {Array.from({ length: stepCount }).map((_, index) => (
                    <ButtonIcon
                      {...a11yStepProps(index)}
                      name="reset-step"
                      tooltip={`Step ${index + 1}`}
                      props={{
                        onClick: () => handleStepChange(index),
                      }}
                      sxProps={{ minWidth: '32px' }}
                    >
                      <Typography
                        sx={{
                          textDecoration: index === step ? 'underline' : undefined,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </ButtonIcon>
                  ))}
                  <ButtonIcon
                    id="reset-step"
                    name="reset-step"
                    tooltip="Start Again"
                    props={{
                      disabled: step === 0,
                      onClick: handleReset,
                    }}
                  >
                    <RefreshIcon fontSize="medium" />
                  </ButtonIcon>
                </Stack>
              </Stack>
            </StepsContext.Provider>
          </Stack>

          <ButtonIcon
            id="next-step"
            name="next-step"
            tooltip="Next Step"
            props={{
              disabled: step >= stepCount - 1,
              onClick: handleNext,
            }}
            sxProps={{
              width: '48px',
              height: '48px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <ArrowForwardIosIcon
                fontSize="large"
                sx={{
                  position: 'absolute',
                  left: '-12px',
                  top: '-18px',
                }}
              />
            </div>
          </ButtonIcon>
        </Stack>
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
            parentEditor.update(() => {
              const attrs = { ...mdastNode.attributes };
              if (latest) {
                attrs.backgroundColor = latest;
              } else {
                delete attrs.backgroundColor;
              }
              lexicalNode.setMdastNode({ ...mdastNode, attributes: attrs });
            }, { discrete: true });
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
          title="Edit Steps"
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
                    onClick={handleAddStep}
                  >
                    Add Step
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
                              handleUpdateStepText(index, textValue);
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
                                  handleAddStepBefore(index);
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
                                  primary="Insert Step Before"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleAddStepAfter(index);
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
                                  primary="Insert Step After"
                                  slotProps={{ primary: listItemProps }}
                                />
                              </ListItemButton>
                              <ListItemButton
                                sx={{
                                  height: 30,
                                }}
                                onClick={(event) => {
                                  handleRemoveStep(index);
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
