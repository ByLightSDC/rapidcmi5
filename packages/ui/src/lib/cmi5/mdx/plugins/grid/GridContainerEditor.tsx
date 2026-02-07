import {
  DirectiveEditorProps,
  insertMarkdown$,
  NestedLexicalEditor,
  readOnly$,
  useCellValues,
  usePublisher,
} from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContainerDirective } from 'mdast-util-directive';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { $getRoot, $isElementNode } from 'lexical';

import { convertMdastToMarkdown } from '../../util/conversion';
import { editorInPlayback$ } from '../../state/vars';
import ModalDialog from '../../../../modals/ModalDialog';
import { parseStyleString } from '../../../markdown/MarkDownParser';

import {
  Box,
  IconButton,
  Paper,
  SxProps,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SettingsIcon from '@mui/icons-material/Settings';

import {
  GridCellDirectiveNode,
  GridContainerDirectiveNode,
  GridPreset,
} from './types';
import { createGridCell, findMatchingPreset, GRID_PRESETS } from './constants';
import { GridContextProvider } from './GridContext';

/**
 * Grid Container Editor for grid layout directive.
 * Renders a grid container with settings modal for layout preset selection.
 */
export const GridContainerEditor: React.FC<
  DirectiveEditorProps<GridContainerDirectiveNode>
> = ({ lexicalNode, mdastNode, parentEditor }) => {
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const muiTheme = useTheme();
  const [sxProps, setSxProps] = useState<SxProps>({});
  const [formData, setFormData] = useState<Array<GridCellDirectiveNode>>(
    structuredClone(mdastNode.children),
  );
  const insertMarkdown = usePublisher(insertMarkdown$);
  const [editor] = useLexicalComposerContext();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isPlayback, readOnly] = useCellValues(editorInPlayback$, readOnly$);

  /**
   * Determine the current preset based on cell count
   */
  const currentPreset = useMemo(() => {
    return findMatchingPreset(formData.length) || GRID_PRESETS[0];
  }, [formData.length]);

  const [selectedPreset, setSelectedPreset] =
    useState<GridPreset>(currentPreset);

  /**
   * Migrates content when changing column count.
   * When reducing: merges content from removed columns into the last kept column.
   * When expanding: adds new empty cells.
   */
  const migrateContent = useCallback(
    (
      currentCells: GridCellDirectiveNode[],
      newPreset: GridPreset,
    ): GridCellDirectiveNode[] => {
      const currentCount = currentCells.length;
      const newCount = newPreset.columns;

      if (newCount >= currentCount) {
        // Expanding or same: keep existing cells and add empty cells if needed
        const result: GridCellDirectiveNode[] = [...currentCells];
        for (let i = currentCount; i < newCount; i++) {
          result.push(createGridCell());
        }
        return result;
      }

      // Reducing columns: merge content from removed columns into the last kept column
      const keptCells = currentCells.slice(0, newCount);
      const removedCells = currentCells.slice(newCount);

      // Merge all removed cell children into the last kept cell
      const lastKeptIndex = newCount - 1;
      const lastKeptCell = keptCells[lastKeptIndex];

      const mergedChildren = [
        ...lastKeptCell.children,
        // Add a visual separator (thematic break) between merged content
        { type: 'thematicBreak' as const },
        // Flatten all removed cells' children
        ...removedCells.flatMap((cell) => cell.children),
      ];

      const result = keptCells.map((cell, index) => ({
        ...cell,
        children: index === lastKeptIndex ? mergedChildren : cell.children,
      }));

      return result as GridCellDirectiveNode[];
    },
    [],
  );

  /**
   * Reverts changes and closes modal
   */
  const handleCancel = () => {
    setSelectedPreset(currentPreset);
    setIsConfiguring(false);
  };

  /**
   * Saves changes by inserting new node and removing original.
   * This workaround is necessary because DirectiveNode doesn't support direct children updates.
   */
  const handleSubmit = useCallback(async () => {
    setIsConfiguring(false);
    if (!parentEditor) return;

    // Apply the preset to create new cell configuration
    const newCells = migrateContent(formData, selectedPreset);

    // First select AFTER the current grid container
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

    // Insert new grid container with updated cells
    parentEditor.update(() => {
      const mdast: ContainerDirective = {
        type: 'containerDirective',
        name: 'gridContainer',
        attributes: mdastNode.attributes || {},
        children: newCells,
      };

      const childMarkdown = convertMdastToMarkdown(mdast as Mdast.RootContent);
      insertMarkdown(childMarkdown);
    });
    await delay(50);

    // Remove original node
    parentEditor.update(() => {
      lexicalNode.remove();
    });
  }, [
    insertMarkdown,
    formData,
    selectedPreset,
    lexicalNode,
    parentEditor,
    mdastNode.attributes,
    migrateContent,
  ]);

  /**
   * Opens the settings modal
   */
  const handleConfigure = useCallback(() => {
    setIsConfiguring(!isConfiguring);
  }, [isConfiguring]);

  /**
   * Sync form data and styles when mdastNode changes
   */
  useEffect(() => {
    setFormData(mdastNode.children);

    if (mdastNode.attributes?.style) {
      try {
        const theSx = parseStyleString(mdastNode.attributes.style);
        setSxProps(theSx);
      } catch (e) {
        // no styles applied
      }
    }
  }, [mdastNode]);

  /**
   * Sync selected preset when form data changes
   */
  useEffect(() => {
    const matchingPreset = findMatchingPreset(formData.length);
    if (matchingPreset) {
      setSelectedPreset(matchingPreset);
    }
  }, [formData.length]);

  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 1,
          position: 'relative',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          ...sxProps,
        }}
        role="grid"
        aria-label="Grid layout container"
      >
        {/* Grid layout using CSS Grid - equal-width columns based on cell count */}
        <GridContextProvider columnCount={mdastNode.children.length}>
          <Box
            sx={{
              // Target the NestedLexicalEditor's wrapper div to apply grid layout
              '& > [data-lexical-editor="true"], & > [role="textbox"]': {
                display: 'grid',
                gridTemplateColumns: `repeat(${mdastNode.children.length}, 1fr)`,
                gap: 2,
              },
              // Also target by class pattern as fallback
              '& > div[class*="nestedEditor"]': {
                display: 'grid',
                gridTemplateColumns: `repeat(${mdastNode.children.length}, 1fr)`,
                gap: 2,
              },
            }}
          >
            <NestedLexicalEditor<ContainerDirective>
              block={true}
              getContent={(node) => node.children}
              getUpdatedMdastNode={(node, children: any) => ({
                ...node,
                children,
              })}
            />
          </Box>
        </GridContextProvider>
        {!isPlayback && (
          <Box
            sx={{
              backgroundColor:
                muiTheme.palette.mode === 'dark'
                  ? '#282b30e6'
                  : '#EEEEEEe6',
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              borderRadius: 1,
            }}
          >
            <Tooltip title="Edit Grid Layout">
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
      </Box>

      {isConfiguring && (
        <ModalDialog
          maxWidth="sm"
          title="Grid Layout Settings"
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
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Layout
            </Typography>
            <Grid container spacing={2}>
              {GRID_PRESETS.map((preset) => (
                <Grid size={6} key={preset.id}>
                  <Paper
                    variant={
                      selectedPreset.id === preset.id ? 'elevation' : 'outlined'
                    }
                    elevation={selectedPreset.id === preset.id ? 4 : 0}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      border:
                        selectedPreset.id === preset.id
                          ? '2px solid'
                          : '1px solid',
                      borderColor:
                        selectedPreset.id === preset.id
                          ? 'primary.main'
                          : 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => setSelectedPreset(preset)}
                  >
                    <Typography
                      variant="caption"
                      align="center"
                      display="block"
                      sx={{ mb: 1, fontWeight: 'medium' }}
                    >
                      {preset.name}
                    </Typography>
                    {/* Visual preview: render equal-width mini grid boxes */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {Array.from({ length: preset.columns }).map((_, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            flex: 1,
                            height: 32,
                            backgroundColor:
                              selectedPreset.id === preset.id
                                ? 'primary.light'
                                : 'action.selected',
                            border: '1px solid',
                            borderColor:
                              selectedPreset.id === preset.id
                                ? 'primary.main'
                                : 'divider',
                            borderRadius: 0.5,
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            {selectedPreset.columns < formData.length && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ mt: 2, display: 'block' }}
              >
                Content from columns {selectedPreset.columns + 1}-
                {formData.length} will be merged into column{' '}
                {selectedPreset.columns}.
              </Typography>
            )}
          </Paper>
        </ModalDialog>
      )}
    </>
  );
};
