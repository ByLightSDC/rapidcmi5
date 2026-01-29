import React, { useState, useRef, useEffect, ChangeEvent } from 'react';

import {
  DirectiveEditorProps,
  NestedLexicalEditor,
  useCellValues,
  useLexicalNodeRemove,
  useMdastNodeUpdater,
  activeEditor$,
  jsxComponentDescriptors$,
  directiveDescriptors$,
  codeBlockEditorDescriptors$,
  syntaxExtensions$,
  importVisitors$,
  usePublisher,
  insertMarkdown$,
} from '@mdxeditor/editor';

import { ContainerDirective } from 'mdast-util-directive';
import { LayoutBoxToolbar } from './LayoutBoxToolbar';

/* MUI */
import {
  Box,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import { convertMdastToMarkdown, ModalDialog } from '@rapid-cmi5/ui';

/**
 * Custom editor component for the Layout Box directive
 */
export const LayoutBoxEditor: React.FC<
  DirectiveEditorProps<ContainerDirective>
> = ({ mdastNode, lexicalNode, parentEditor }) => {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const removeNode = useLexicalNodeRemove();
  const insertMarkdown = usePublisher(insertMarkdown$);
  const updateMdastNode = useMdastNodeUpdater();

  // attributes
  const justifyContentAttr =
    mdastNode.attributes?.justifyContent ?? 'flex-start';
  const alignItemsAttr = mdastNode.attributes?.alignItems ?? 'flex-start';

  // map justifyContent to text-align for full-row text blocks
  const textAlign =
    justifyContentAttr === 'center'
      ? 'center'
      : justifyContentAttr === 'flex-end'
        ? 'right'
        : 'left';

  // Read current attributes
  const attrs = mdastNode.attributes ?? {};

  const [isFocused, setIsFocused] = useState(false);
  const [styleDialogOpen, setStyleDialogOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // local form state
  const [form, setForm] = useState({
    justifyContent: attrs.justifyContent ?? 'flex-start',
    alignItems: attrs.alignItems ?? 'flex-start',
    color: attrs.color ?? '#ffffff',
    width: attrs.width ?? '',
    height: attrs.height ?? '',
  });

  const handleAlignmentChange = (alignment: string) => {
    updateMdastNode({
      ...mdastNode,
      attributes: {
        ...mdastNode.attributes,
        alignItems: alignment,
      },
    });
  };

  const handleClearLayout = async () => {
    // Convert all children to markdown
    // Use 'root' type for BlockContent[] (not 'paragraph' which expects PhrasingContent[])
    const childMarkdown = convertMdastToMarkdown({
      type: 'root',
      children: mdastNode.children,
    });

    parentEditor.update(() => {
      lexicalNode.selectPrevious();
    });

    await delay(500);
    insertMarkdown(childMarkdown);
    removeNode();
  };

  const handleJustificationChange = (justification: string) => {
    updateMdastNode({
      ...mdastNode,
      attributes: {
        ...mdastNode.attributes,
        justifyContent: justification,
      },
    });
  };

  /**
   * If the dimension is a pure number, assume pixels by appending 'px'.
   * Otherwise, leave as is and assume valid CSS like '100%' or '100em'.
   * @param value
   */
  const normalizeDimension = (value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return `${trimmed}px`;
    }

    return trimmed;
  };

  const handleSaveStyles = () => {
    const next: Record<string, string | undefined> = {
      ...mdastNode.attributes,
      justifyContent: form.justifyContent.trim() || undefined,
      alignItems: form.alignItems.trim() || undefined,
      color: form.color.trim() || undefined,
      width: normalizeDimension(form.width),
      height: normalizeDimension(form.height),
    };

    updateMdastNode({
      ...mdastNode,
      attributes: next,
    });

    setStyleDialogOpen(false);
  };

  // show/hide focus state when moving in/out of nested editor
  useEffect(() => {
    const div = contentRef.current;
    if (!div) return;

    const handleFocusIn = () => setIsFocused(true);
    const handleFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget;
      if (!(next instanceof Node) || !div.contains(next)) {
        setIsFocused(false);
      }
    };

    div.addEventListener('focusin', handleFocusIn);
    div.addEventListener('focusout', handleFocusOut);

    return () => {
      div.removeEventListener('focusin', handleFocusIn);
      div.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // container (outer wrapper)
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    listStylePosition: 'inside',
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
    outline: isFocused ? '1px dashed gray' : undefined,
    outlineOffset: 2,
  };

  if (attrs.width) containerStyles.width = attrs.width;
  if (attrs.height) containerStyles.height = attrs.height;

  // CE root inline styles — only size/padding
  const editorStyles: React.CSSProperties = {
    padding: 0,
    backgroundColor: 'inherit',
    ...(attrs.width ? { width: attrs.width } : {}),
    ...(attrs.height ? { height: attrs.height } : {}),
  };

  // per-instance unique class
  const ceClass = useRef(
    `layoutbox-ce-root-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  //test method for inserting markdown
  // const onTest = () => {
  //   insertMarkdown('Hello World');
  // };

  return (
    <div ref={contentRef} style={containerStyles}>
      {/* <ButtonMainUi onClick={onTest}>Test</ButtonMainUi> */}
      {/* Scoped CSS: nested LayoutBoxes tile, text blocks new-line and obey text-align */}
      <style>{`
        .${ceClass} {
          display: flex;
          flex-direction: row;
          justify-content: ${justifyContentAttr};
          align-items: ${alignItemsAttr};
          flex-wrap: wrap;
          gap: 0;
          background-color: inherit;
          box-sizing: border-box;
        }

        /* Full-row text blocks */
        .${ceClass} p,
        .${ceClass} [data-lexical-paragraph="true"],
        .${ceClass} ul,
        .${ceClass} ol,
        .${ceClass} blockquote,
        .${ceClass} h1,
        .${ceClass} h2,
        .${ceClass} h3,
        .${ceClass} h4,
        .${ceClass} h5,
        .${ceClass} h6 {
          flex: 0 0 100%;
          min-width: 100%;
          text-align: ${textAlign};
        }

        /* Nested LayoutBoxes (decorator nodes) tile side-by-side */
        .${ceClass} [data-lexical-decorator="true"] {
          flex: 0 0 auto;
          min-width: auto;
        }
      `}</style>

      {isFocused && (
        <LayoutBoxToolbar
          handleJustificationChange={handleJustificationChange}
          handleAlignmentChange={handleAlignmentChange}
          handleClearLayout={handleClearLayout}
          onOpenStyleDialog={() => {
            const a = mdastNode.attributes ?? {};
            const jc = a.justifyContent ?? 'flex-start';
            const ai = a.alignItems ?? 'flex-start';
            setForm((s) => ({ ...s, justifyContent: jc, alignItems: ai }));
            setStyleDialogOpen(true);
          }}
        />
      )}

      <NestedLexicalEditor<ContainerDirective>
        block={true}
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children: any) => ({ ...node, children })}
        contentEditableProps={{
          className: ceClass,
          style: editorStyles,
        }}
      />

      <ModalDialog
        title="Edit Layout Box"
        buttons={['Cancel', 'apply']}
        dialogProps={{
          open: styleDialogOpen,
        }}
        handleAction={(index: number) => {
          if (index === 0) {
            setStyleDialogOpen(false);
          } else {
            handleSaveStyles();
          }
        }}
      >
        <div
          className="scrollingDiv"
          style={{ margin: 0, height: '100%', width: '1024px' }}
        >
          <Box sx={{ width: '99%', overflowX: 'hidden' }}>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={0.1}>
                  {/* Justification */}
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <Grid size={3}>
                      <Typography gutterBottom>Horizontal Alignment</Typography>
                    </Grid>
                    <Grid size={9}>
                      <ToggleButtonGroup
                        value={form.justifyContent}
                        exclusive
                        onChange={(e, newValue: string | null) =>
                          setForm((s) => ({
                            ...s,
                            justifyContent: newValue ? newValue : '',
                          }))
                        }
                        aria-label="justification"
                      >
                        <ToggleButton value="flex-start" aria-label="left">
                          <VerticalAlignBottomIcon
                            sx={{ transform: 'rotate(90deg)' }}
                          />
                        </ToggleButton>
                        <ToggleButton value="center" aria-label="centered">
                          <VerticalAlignCenterIcon
                            sx={{ transform: 'rotate(90deg)' }}
                          />
                        </ToggleButton>
                        <ToggleButton value="flex-end" aria-label="right">
                          <VerticalAlignTopIcon
                            sx={{ transform: 'rotate(90deg)' }}
                          />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Grid>
                  </Grid>

                  {/* Vertical Alignment */}
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <Grid size={3}>
                      <Typography gutterBottom>Vertical Alignment</Typography>
                    </Grid>
                    <Grid size={9}>
                      <ToggleButtonGroup
                        value={form.alignItems}
                        exclusive
                        onChange={(e, newValue: string | null) =>
                          setForm((s) => ({
                            ...s,
                            alignItems: newValue ? newValue : '',
                          }))
                        }
                        aria-label="alignment"
                      >
                        <ToggleButton value="flex-start" aria-label="top">
                          <VerticalAlignTopIcon />
                        </ToggleButton>
                        <ToggleButton value="center" aria-label="centered">
                          <VerticalAlignCenterIcon />
                        </ToggleButton>
                        <ToggleButton value="flex-end" aria-label="bottom">
                          <VerticalAlignBottomIcon />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Grid>
                  </Grid>

                  {/* Width */}
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <Grid size={3}>
                      <Typography gutterBottom>Width</Typography>
                    </Grid>
                    <Grid size={9}>
                      <TextField
                        autoFocus
                        margin="dense"
                        type="text"
                        value={form.width}
                        fullWidth={false}
                        onChange={(
                          event: ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >,
                        ) =>
                          setForm((s) => ({ ...s, width: event.target.value }))
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* Height */}
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{ width: '100%' }}
                  >
                    <Grid size={3}>
                      <Typography gutterBottom>Height</Typography>
                    </Grid>
                    <Grid size={9}>
                      <TextField
                        autoFocus
                        margin="dense"
                        type="text"
                        value={form.height}
                        fullWidth={false}
                        onChange={(
                          event: ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >,
                        ) =>
                          setForm((s) => ({ ...s, height: event.target.value }))
                        }
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </div>
      </ModalDialog>
    </div>
  );
};
