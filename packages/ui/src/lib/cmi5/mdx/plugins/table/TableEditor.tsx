import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import * as RadixPopover from '@radix-ui/react-popover';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { useGutterRight } from '../shared/useGutterRight';
import { useFocusWithin } from '../shared/useFocusWithin';
import { useScopedAlignmentStyles, TextAlign } from '../shared/useScopedAlignmentStyles';
import { AlignmentToolbarControls } from '../../components/AlignmentToolbarControls';
import DeleteIconButton from '../../components/DeleteIconButton';
import InsertLineReturnButton from '../../components/InsertLineReturnButton';
import {
  $createParagraphNode,
  $getRoot,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  FOCUS_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  createEditor,
} from 'lexical';
import * as Mdast from 'mdast';
import React, {
  ElementType,
  useContext,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import { LessonThemeContext } from '../../contexts/LessonThemeContext';
import { resolveLessonThemeCSS } from '../../../../styles/lessonThemeStyles';
import { TableNode } from './TableNode';

import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { mergeRegister } from '@lexical/utils';
import * as RadixToolbar from '@radix-ui/react-toolbar';
import classNames from 'classnames';
//import styles from '../../styles/ui.module.css';
//replace above with
import styles from './styles/table.module.css';
import { v4 as uuidv4 } from 'uuid';

import {
  NESTED_EDITOR_UPDATED_COMMAND,
  codeBlockEditorDescriptors$,
  directiveDescriptors$,
  editorRootElementRef$,
  exportLexicalTreeToMdast,
  exportVisitors$,
  iconComponentFor$,
  importMdastTreeToLexical,
  importVisitors$,
  isPartOftheEditorUI,
  jsxComponentDescriptors$,
  jsxIsAvailable$,
  lexicalTheme,
  readOnly$,
  rootEditor$,
  useTranslation,
  usedLexicalNodes$,
} from '@mdxeditor/editor';
import { useCellValues } from '@mdxeditor/gurx';

import ColorPickerButton from './ColorPickerButton';
import { TableStyleDialog } from './TableStyleDialog';

// helper to extract background color
const getBackgroundColor = (cell: any): string => {
  const style = cell.data?.hProperties?.style;
  if (typeof style === 'string') {
    // simple parse for "background-color: #xyz;"
    const match = style.match(/background-color:\s*([^;]+)/i);
    if (match) return match[1].trim();
  }
  return 'transparent';
};

/**
 * Parses a CSS string to find table styles (border and radius).
 * Returns a React.CSSProperties object.
 */
const getTableStyles = (
  styleString: string | undefined,
): React.CSSProperties | undefined => {
  if (!styleString) return undefined;

  const styles: React.CSSProperties = {};

  // 1. Extract Border
  let borderShorthand = undefined;

  const widthMatch = styleString.match(/border-width:\s*([^;]+)/i);
  const styleMatch = styleString.match(/border-style:\s*([^;]+)/i);
  const colorMatch = styleString.match(/border-color:\s*([^;]+)/i);

  if (widthMatch || styleMatch || colorMatch) {
    const w = widthMatch ? widthMatch[1].trim() : '0px';
    const s = styleMatch ? styleMatch[1].trim() : 'solid';
    const c = colorMatch ? colorMatch[1].trim() : 'transparent';

    // Only apply if width is non-zero
    if (parseFloat(w) !== 0) {
      borderShorthand = `${w} ${s} ${c}`;
    }
  } else {
    // Fallback to shorthand
    const shorthandMatch = styleString.match(/border:\s*([^;]+)/i);
    if (shorthandMatch) {
      borderShorthand = shorthandMatch[1].trim();
    }
  }

  if (borderShorthand) {
    styles.border = borderShorthand;
  }

  // 2. Extract Radius
  const radiusMatch = styleString.match(/border-radius:\s*([^;]+)/i);
  if (radiusMatch) {
    styles.borderRadius = radiusMatch[1].trim();
    styles.borderCollapse = 'separate';
    styles.borderSpacing = '0';
    styles.overflow = 'hidden';
  }

  // 3. Extract Shadow
  const shadowMatch = styleString.match(/box-shadow:\s*([^;]+)/i);
  if (shadowMatch) {
    styles.boxShadow = shadowMatch[1].trim();
  }

  return Object.keys(styles).length > 0 ? styles : undefined;
};

/**
 * Returns the element type for the cell based on the rowIndex
 *
 * If the rowIndex is 0, it returns 'th' for the header cell
 * Otherwise, it returns 'td' for the data cell
 */
const getCellType = (rowIndex: number): ElementType => {
  if (rowIndex === 0) {
    return 'th';
  }
  return 'td';
};

const AlignToTailwindClassMap = {
  center: styles['centeredCell'],
  left: styles['leftAlignedCell'],
  right: styles['rightAlignedCell'],
};

export interface TableEditorProps {
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
  mdastNode: Mdast.Table;
}

export const TableEditor: React.FC<TableEditorProps> = ({
  mdastNode,
  parentEditor,
  lexicalTable,
}) => {
  const [activeCell, setActiveCell] = React.useState<[number, number] | null>(
    null,
  );

  const [iconComponentFor, readOnly] = useCellValues(
    iconComponentFor$,
    readOnly$,
  );

  const muiTheme = useTheme();
  const { lessonTheme } = useContext(LessonThemeContext);
  const resolvedThemeCSS = resolveLessonThemeCSS(lessonTheme);
  const blockPadding = resolvedThemeCSS
    ? (resolvedThemeCSS.blockPadding ?? '0px')
    : '32px';
  const { gutterRef, gutterRight } = useGutterRight(resolvedThemeCSS);

  const getCellKey = React.useMemo(() => {
    return (cell: Mdast.TableCell & { __cacheKey?: string }) => {
      if (!cell.__cacheKey) {
        cell.__cacheKey = uuidv4();
      }
      return cell.__cacheKey;
    };
  }, []);

  const setActiveCellWithBoundaries = React.useCallback(
    (cell: [number, number] | null) => {
      const colCount = lexicalTable.getColCount();

      if (cell === null) {
        setActiveCell(null);
        return;
      }
      let [colIndex, rowIndex] = cell;

      // overflow columns
      if (colIndex > colCount - 1) {
        colIndex = 0;
        rowIndex++;
      }

      // underflow columns
      if (colIndex < 0) {
        colIndex = colCount - 1;
        rowIndex -= 1;
      }

      if (rowIndex > lexicalTable.getRowCount() - 1) {
        setActiveCell(null);
        parentEditor.update(() => {
          const nextSibling = lexicalTable.getLatest().getNextSibling();
          if (nextSibling) {
            lexicalTable.getLatest().selectNext();
          } else {
            const newParagraph = $createParagraphNode();
            lexicalTable.insertAfter(newParagraph);
            newParagraph.select();
          }
        });
        return;
      }

      if (rowIndex < 0) {
        setActiveCell(null);
        parentEditor.update(() => {
          lexicalTable.getLatest().selectPrevious();
        });
        return;
      }

      setActiveCell([colIndex, rowIndex]);
    },
    [lexicalTable, parentEditor],
  );

  React.useEffect(() => {
    lexicalTable.focusEmitter.subscribe(setActiveCellWithBoundaries);
  }, [lexicalTable, setActiveCellWithBoundaries]);

  const addRowToBottom = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      parentEditor.update(() => {
        lexicalTable.addRowToBottom();
        setActiveCell([0, lexicalTable.getRowCount()]);
      });
    },
    [parentEditor, lexicalTable],
  );

  // adds column to the right and focuses the top cell of it
  const addColumnToRight = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      parentEditor.update(() => {
        lexicalTable.addColumnToRight();
        setActiveCell([lexicalTable.getColCount(), 0]);
      });
    },
    [parentEditor, lexicalTable],
  );

  const [highlightedCoordinates, setHighlightedCoordinates] = React.useState<
    [number, number]
  >([-1, -1]);

  const onTableMouseOver = React.useCallback(
    (e: React.MouseEvent<HTMLTableElement>) => {
      let tableCell = e.target as HTMLElement | null;

      while (tableCell && !['TH', 'TD'].includes(tableCell.tagName)) {
        if (tableCell === e.currentTarget) {
          return;
        }

        tableCell = tableCell.parentElement;
      }
      if (tableCell === null) return;

      // Row gutter cell — show row indicator, clear col
      const rowTrigger = tableCell.getAttribute('data-row-trigger');
      if (rowTrigger !== null) {
        setHighlightedCoordinates([-1, parseInt(rowTrigger, 10)]);
        return;
      }

      // Column trigger cell (thead) — show col indicator, clear row
      const colTrigger = tableCell.getAttribute('data-col-trigger');
      if (colTrigger !== null) {
        setHighlightedCoordinates([parseInt(colTrigger, 10), -1]);
        return;
      }

      // Other tool cells (add-col, settings, tfoot) — clear everything
      if (tableCell.hasAttribute('data-tool-cell')) {
        setHighlightedCoordinates([-1, -1]);
        return;
      }

      // Regular data cell
      const tableRow = tableCell.parentElement!;
      const tableContainer = tableRow.parentElement!;
      const domColIndex = Array.from(tableRow.children).indexOf(tableCell);
      // Subtract 1 for the row gutter column
      const colIndex = tableContainer.tagName === 'TFOOT' ? -1 : domColIndex - 1;
      const rowIndex = Array.from(tableContainer.children).indexOf(tableRow);
      setHighlightedCoordinates([colIndex, rowIndex]);
    },
    [],
  );


  // get styles to apply to the table
  const tableStyle = mdastNode.data?.hProperties?.['style'] as string | undefined;

  // Calculate computed styles (including border and radius)
  const computedTableStyle = getTableStyles(tableStyle);

  // Extract parts for cell perimeter logic
  const fullBorderStyle = computedTableStyle?.border as string | undefined;
  const borderRadius = computedTableStyle?.borderRadius as string | undefined;
  const fullShadowStyle = computedTableStyle?.boxShadow as string | undefined;

  // Determine styles for the <table> element
  // In Edit mode, we strip border/shadow properties so they don't wrap the tool headers.
  const tableElementStyle = React.useMemo(() => {
    if (!computedTableStyle) return undefined;
    if (readOnly) return computedTableStyle;

    const editModeStyle = { ...computedTableStyle };
    delete editModeStyle.border;
    delete editModeStyle.borderWidth;
    delete editModeStyle.borderStyle;
    delete editModeStyle.borderColor;
    delete editModeStyle.boxShadow;
    return editModeStyle;
  }, [readOnly, computedTableStyle]);

  // --- Shadow Underlay Logic ---
  const tableRef = useRef<HTMLTableElement>(null);
  const [dataArea, setDataArea] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (readOnly || !tableRef.current) return;

    const measure = () => {
      if (!tableRef.current) return;
      const table = tableRef.current;

      const thead = table.querySelector('thead');
      const tfoot = table.querySelector('tfoot');

      // 1. Top/Bottom offsets (Header/Footer UI)
      const topOffset = thead ? thead.offsetHeight : 0;
      const bottomOffset = tfoot ? tfoot.offsetHeight : 0;

      // 2. Left/Right offsets (Tool Columns)
      // We inspect the first row of the body to find the tool cells
      const firstRow = table.querySelector('tbody tr:first-child');
      let leftOffset = 0;
      let rightOffset = 0;

      if (firstRow) {
        const firstCell = firstRow.firstElementChild as HTMLElement;
        const lastCell = firstRow.lastElementChild as HTMLElement;

        // Left Tool Cell: usually has 'data-tool-cell' attribute
        if (firstCell && firstCell.hasAttribute('data-tool-cell')) {
          leftOffset = firstCell.offsetWidth;
        }

        // Right Tool Cell (Add Column Button): also has 'data-tool-cell'
        // We ensure it's not the same as the first cell (in case of 1 column + no tools, unlikely but safe)
        if (
          lastCell &&
          lastCell !== firstCell &&
          lastCell.hasAttribute('data-tool-cell')
        ) {
          rightOffset = lastCell.offsetWidth;
        }
      }

      setDataArea({
        top: topOffset,
        left: leftOffset,
        width: table.offsetWidth - leftOffset - rightOffset,
        height: table.offsetHeight - topOffset - bottomOffset,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tableRef.current);

    return () => observer.disconnect();
  }, [readOnly, mdastNode]);

  // remove tool cols in readOnly mode
  return (
    <div style={{ paddingTop: blockPadding, paddingBottom: blockPadding, position: 'relative' }}>
      {!readOnly && (
        <Box
          ref={gutterRef as any}
          sx={{
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            display: 'flex',
            position: 'absolute',
            top: 0,
            right: gutterRight,
            zIndex: 1,
          }}
        >
          <TableSettingsButton parentEditor={parentEditor} lexicalTable={lexicalTable} />
          <InsertLineReturnButton parentEditor={parentEditor} lexicalNode={lexicalTable} />
          <DeleteIconButton
            onDelete={() => {
              parentEditor.update(() => {
                lexicalTable.selectNext();
                lexicalTable.remove();
              });
            }}
          />
        </Box>
      )}
    <div style={readOnly ? undefined : { border: '1px dashed var(--baseBgActive, #ccc)', borderRadius: '4px', padding: '2px' }}>
    <div style={{ position: 'relative' }}>
      {/* Shadow Underlay - Only in Edit Mode */}
      {!readOnly && fullShadowStyle && dataArea && (
        <div
          style={{
            position: 'absolute',
            top: dataArea.top,
            left: dataArea.left,
            width: dataArea.width,
            height: dataArea.height,
            boxShadow: fullShadowStyle,
            borderRadius: borderRadius,
            pointerEvents: 'none',
            zIndex: 0, // Behind the table cells
          }}
        />
      )}

      <table
        ref={tableRef}
        className={styles['tableEditor']}
        style={{ ...tableElementStyle, position: 'relative', zIndex: 1 }}
        onMouseOver={onTableMouseOver}
        onMouseLeave={() => {
          setHighlightedCoordinates([-1, -1]);
        }}
      >
        {mdastNode && (
          <>
            <colgroup>
              {readOnly ? null : <col />}

              {Array.from(
                { length: mdastNode.children[0].children.length },
                (_, colIndex) => {
                  const align = mdastNode.align ?? [];
                  const currentColumnAlign = align[colIndex] ?? 'left';
                  const className = AlignToTailwindClassMap[currentColumnAlign];
                  return <col key={colIndex} className={className} />;
                },
              )}

              {readOnly ? null : <col />}
            </colgroup>

            {readOnly || (
              <thead>
                <tr>
                  <th className={styles['tableToolsColumn']}></th>
                  {Array.from(
                    { length: mdastNode.children[0].children.length },
                    (_, colIndex) => {
                      return (
                        <th key={colIndex} data-col-trigger={colIndex}>
                          <ColumnEditor
                            {...{
                              setActiveCellWithBoundaries,
                              parentEditor,
                              colIndex,
                              colCount: mdastNode.children[0].children.length,
                              highlightedCoordinates,
                              lexicalTable,
                              align: (mdastNode.align ?? [])[colIndex],
                            }}
                          />
                        </th>
                      );
                    },
                  )}

                  <th className={styles['tableToolsColumn']} data-tool-cell={true}>
                    <button
                      type="button"
                      className={styles['addColumnButton']}
                      onClick={addColumnToRight}
                    >
                      {iconComponentFor('add_column')}
                    </button>
                  </th>
                </tr>
              </thead>
            )}

            <tbody>
              {mdastNode.children.map((row, rowIndex) => {
                const CellElement = getCellType(rowIndex);
                // Identify row edges for border application
                const isFirstRow = rowIndex === 0;
                const isLastRow = rowIndex === mdastNode.children.length - 1;

                return (
                  <tr key={rowIndex}>
                    {readOnly || (
                      <CellElement
                        className={styles['toolCell']}
                        data-row-trigger={rowIndex}
                      >
                        <RowEditor
                          {...{
                            setActiveCellWithBoundaries,
                            parentEditor,
                            rowIndex,
                            rowCount: mdastNode.children.length,
                            highlightedCoordinates,
                            lexicalTable,
                          }}
                        />
                      </CellElement>
                    )}
                    {row.children.map((mdastCell, colIndex) => {
                      // Use helper to extract color
                      const dynamicColor = getBackgroundColor(mdastCell);

                      // Determine if this cell needs perimeter borders (Edit mode only)
                      const isFirstCol = colIndex === 0;
                      const isLastCol = colIndex === row.children.length - 1;

                      const perimeterStyle: React.CSSProperties = {};

                      // While editing, we simulate the table border by applying borders to the outer cells.
                      if (!readOnly) {
                        // --- 1. Borders ---
                        if (fullBorderStyle) {
                          if (isFirstRow)
                            perimeterStyle.borderTop = fullBorderStyle;
                          if (isLastRow)
                            perimeterStyle.borderBottom = fullBorderStyle;
                          if (isFirstCol)
                            perimeterStyle.borderLeft = fullBorderStyle;
                          if (isLastCol)
                            perimeterStyle.borderRight = fullBorderStyle;
                        }

                        // --- 2. Radius ---
                        if (borderRadius) {
                          if (isFirstRow && isFirstCol)
                            perimeterStyle.borderTopLeftRadius = borderRadius;
                          if (isFirstRow && isLastCol)
                            perimeterStyle.borderTopRightRadius = borderRadius;
                          if (isLastRow && isFirstCol)
                            perimeterStyle.borderBottomLeftRadius =
                              borderRadius;
                          if (isLastRow && isLastCol)
                            perimeterStyle.borderBottomRightRadius =
                              borderRadius;

                          // Clip background at corners
                          if (
                            (isFirstRow || isLastRow) &&
                            (isFirstCol || isLastCol)
                          ) {
                            perimeterStyle.overflow = 'hidden';
                          }
                        }
                        // --- 3. Shadow is handled by underlay ---
                      }

                      const rawTextAlign = (mdastCell.data?.hProperties as any)?.['data-text-align'];
                      const cellTextAlign: TextAlign =
                        rawTextAlign === 'center' || rawTextAlign === 'right'
                          ? rawTextAlign
                          : 'left';

                      return (
                        <Cell
                          align={mdastNode.align?.[colIndex]}
                          textAlign={cellTextAlign}
                          cellBackgroundColor={dynamicColor}
                          perimeterStyle={perimeterStyle}
                          key={getCellKey(mdastCell)}
                          contents={mdastCell.children}
                          setActiveCell={setActiveCellWithBoundaries}
                          {...{
                            rowIndex,
                            colIndex,
                            lexicalTable,
                            parentEditor,
                            activeCell: readOnly ? [-1, -1] : activeCell,
                          }}
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {readOnly || (
              <tfoot>
                <tr>
                  <th></th>
                  <th colSpan={lexicalTable.getColCount()}>
                    <button
                      type="button"
                      className={styles['addRowButton']}
                      onClick={addRowToBottom}
                    >
                      {iconComponentFor('add_row')}
                    </button>
                  </th>
                  <th></th>
                </tr>
              </tfoot>
            )}
          </>
        )}
      </table>
    </div>
    </div>
    </div>
  );
};

export interface CellProps {
  cellBackgroundColor: string;
  perimeterStyle?: React.CSSProperties;
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
  contents: Mdast.PhrasingContent[];
  colIndex: number;
  rowIndex: number;
  align?: Mdast.AlignType;
  textAlign: TextAlign;
  activeCell: [number, number] | null;
  setActiveCell: (cell: [number, number] | null) => void;
  focus: boolean;
}

const Cell: React.FC<Omit<CellProps, 'focus'>> = ({ align, ...props }) => {
  const { activeCell, setActiveCell } = props;
  const isActive = Boolean(
    activeCell &&
      activeCell[0] === props.colIndex &&
      activeCell[1] === props.rowIndex,
  );

  const [readOnly] = useCellValues(readOnly$);
  const muiTheme = useTheme();
  const { isFocused, ref: focusRef } = useFocusWithin<HTMLElement>();

  const className = AlignToTailwindClassMap[align ?? 'left'];
  const [currentColor, setColor] = useState<string>(
    props.cellBackgroundColor || 'transparent',
  );

  useEffect(() => {
    setColor(props.cellBackgroundColor || 'transparent');
  }, [props.cellBackgroundColor]);

  const CellElement = getCellType(props.rowIndex);

  const onPickBgColor = React.useCallback(
    (color: string | null) => {
      if (color) {
        setColor(color);
      }
    },
    [setColor],
  );

  const handleAlignmentChange = React.useCallback(
    (value: 'left' | 'center' | 'right') => {
      props.parentEditor.update(() => {
        props.lexicalTable.updateCellTextAlign(props.colIndex, props.rowIndex, value);
      }, { discrete: true });
    },
    [props.parentEditor, props.lexicalTable, props.colIndex, props.rowIndex],
  );

  return (
    <CellElement
      ref={focusRef as any}
      className={className}
      data-active={isActive}
      style={{ position: 'relative', backgroundColor: currentColor, ...props.perimeterStyle }}
      onClick={() => {
        setActiveCell([props.colIndex, props.rowIndex]);
      }}
    >
      {isFocused && !readOnly && (
        <Box
          sx={{
            position: 'absolute',
            top: -34,
            right: 0,
            zIndex: 10,
            display: 'flex',
            backgroundColor:
              muiTheme.palette.mode === 'dark' ? '#282b30e6' : '#EEEEEEe6',
            borderRadius: 1,
            p: 0.25,
          }}
        >
          <AlignmentToolbarControls
            currentAlignment={props.textAlign}
            onAlignmentChange={handleAlignmentChange}
          />
        </Box>
      )}
      <CellEditor
        {...props}
        focus={isActive}
        cellBackgroundColor={currentColor}
      />
      <ColorPickerButton onColorPicked={onPickBgColor} />
    </CellElement>
  );
};

const CellEditor: React.FC<CellProps> = ({
  cellBackgroundColor = 'transparent',
  focus,
  setActiveCell,
  parentEditor,
  lexicalTable,
  contents,
  colIndex,
  rowIndex,
  textAlign,
}) => {
  const [
    importVisitors,
    exportVisitors,
    usedLexicalNodes,
    jsxComponentDescriptors,
    directiveDescriptors,
    codeBlockEditorDescriptors,
    jsxIsAvailable,
    rootEditor,
  ] = useCellValues(
    importVisitors$,
    exportVisitors$,
    usedLexicalNodes$,
    jsxComponentDescriptors$,
    directiveDescriptors$,
    codeBlockEditorDescriptors$,
    jsxIsAvailable$,
    rootEditor$,
  );

  const [editor] = React.useState(() => {
    const editor = createEditor({
      nodes: usedLexicalNodes,
      theme: lexicalTheme,
    });

    editor.update(() => {
      importMdastTreeToLexical({
        root: $getRoot(),
        mdastRoot: {
          type: 'root',
          children: [{ type: 'paragraph', children: contents }],
        },
        visitors: importVisitors,
        jsxComponentDescriptors,
        directiveDescriptors,
        codeBlockEditorDescriptors,
      });
    });

    return editor;
  });

  const changeColor = React.useCallback(
    (cellBgColor: string | null) => {
      editor.getEditorState().read(() => {
        // we do not need full export for just color, but we need to trigger update
        parentEditor.update(
          () => {
            lexicalTable.updateCellBg(colIndex, rowIndex, cellBgColor);
          },
          { discrete: true },
        );
        parentEditor.dispatchCommand(NESTED_EDITOR_UPDATED_COMMAND, undefined);
      });

      //setActiveCell(nextCell);
    },
    [colIndex, editor, lexicalTable, parentEditor, rowIndex, setActiveCell],
  );

  const saveAndFocus = React.useCallback(
    (nextCell: [number, number] | null) => {
      editor.getEditorState().read(() => {
        const mdast = exportLexicalTreeToMdast({
          root: $getRoot(),
          jsxComponentDescriptors,
          visitors: exportVisitors,
          jsxIsAvailable,
        });
        parentEditor.update(
          () => {
            lexicalTable.updateCellContents(
              colIndex,
              rowIndex,
              (mdast.children[0] as Mdast.Paragraph).children,
            );
          },
          { discrete: true },
        );
        parentEditor.dispatchCommand(NESTED_EDITOR_UPDATED_COMMAND, undefined);
      });

      setActiveCell(nextCell);
    },
    [
      colIndex,
      editor,
      exportVisitors,
      jsxComponentDescriptors,
      jsxIsAvailable,
      lexicalTable,
      parentEditor,
      rowIndex,
      setActiveCell,
    ],
  );

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (payload) => {
          payload.preventDefault();
          const nextCell: [number, number] = payload.shiftKey
            ? [colIndex - 1, rowIndex]
            : [colIndex + 1, rowIndex];
          saveAndFocus(nextCell);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          setActiveCell([colIndex, rowIndex]);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (payload) => {
          payload?.preventDefault();
          const nextCell: [number, number] = payload?.shiftKey
            ? [colIndex, rowIndex - 1]
            : [colIndex, rowIndex + 1];
          saveAndFocus(nextCell);
          return true;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),

      editor.registerCommand(
        BLUR_COMMAND,
        (payload) => {
          const relatedTarget = payload.relatedTarget as HTMLElement | null;

          if (
            isPartOftheEditorUI(relatedTarget, rootEditor!.getRootElement()!)
          ) {
            return false;
          }
          saveAndFocus(null);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand(
        NESTED_EDITOR_UPDATED_COMMAND,
        () => {
          saveAndFocus(null);
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [colIndex, editor, rootEditor, rowIndex, saveAndFocus, setActiveCell]);

  React.useEffect(() => {
    focus && editor.focus();
  }, [focus, editor]);

  React.useEffect(() => {
    //cellBackgroundColor
    changeColor(cellBackgroundColor);
  }, [cellBackgroundColor]);

  const { scopedClass, alignmentStyles } = useScopedAlignmentStyles(
    textAlign,
    `table-cell-${rowIndex}-${colIndex}`,
  );

  return (
    <LexicalNestedComposer initialEditor={editor}>
      {alignmentStyles}
      <RichTextPlugin
        contentEditable={<ContentEditable className={scopedClass} />}
        placeholder={<div></div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalNestedComposer>
  );
};

interface ColumnEditorProps {
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
  colIndex: number;
  colCount: number;
  highlightedCoordinates: [number, number];
  setActiveCellWithBoundaries: (cell: [number, number] | null) => void;
  align: Mdast.AlignType;
}

const ColumnEditor: React.FC<ColumnEditorProps> = ({
  parentEditor,
  highlightedCoordinates,
  align,
  lexicalTable,
  colIndex,
  colCount,
  setActiveCellWithBoundaries,
}) => {
  const [editorRootElementRef, iconComponentFor] = useCellValues(
    editorRootElementRef$,
    iconComponentFor$,
  );

  const insertColumnAt = React.useCallback(
    (colIndex: number) => {
      parentEditor.update(() => {
        lexicalTable.insertColumnAt(colIndex);
      });
      setActiveCellWithBoundaries([colIndex, 0]);
    },
    [parentEditor, lexicalTable, setActiveCellWithBoundaries],
  );

  const deleteColumnAt = React.useCallback(
    (colIndex: number) => {
      parentEditor.update(() => {
        lexicalTable.deleteColumnAt(colIndex);
      });
    },
    [parentEditor, lexicalTable],
  );

  const setColumnAlign = React.useCallback(
    (colIndex: number, align: Mdast.AlignType) => {
      parentEditor.update(() => {
        lexicalTable.setColumnAlign(colIndex, align);
      });
    },
    [parentEditor, lexicalTable],
  );

  const t = useTranslation();
  return (
    <RadixPopover.Root>
      <RadixPopover.PopoverTrigger
        className={styles['tableColumnEditorTrigger']}
        data-visible={highlightedCoordinates[0] === colIndex || undefined}
        title={t('table.columnMenu', 'Column menu')}
      >
        <DragIndicatorIcon sx={{ fontSize: 16, transform: 'rotate(90deg)' }} />
      </RadixPopover.PopoverTrigger>
      <RadixPopover.Portal container={editorRootElementRef?.current}>
        <RadixPopover.PopoverContent
          className={classNames(styles['tableColumnEditorPopoverContent'])}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          sideOffset={5}
          side="top"
        >
          <RadixToolbar.Root className={styles['tableColumnEditorToolbar']}>
            <RadixToolbar.ToggleGroup
              className={styles['toggleGroupRoot']}
              onValueChange={(value) => {
                setColumnAlign(colIndex, value as Mdast.AlignType);
              }}
              value={align ?? 'left'}
              type="single"
              aria-label={t('table.textAlignment', 'Text alignment')}
            >
              <RadixToolbar.ToggleItem
                value="left"
                title={t('table.alignLeft', 'Align left')}
              >
                {iconComponentFor('format_align_left')}
              </RadixToolbar.ToggleItem>
              <RadixToolbar.ToggleItem
                value="center"
                title={t('table.alignCenter', 'Align center')}
              >
                {iconComponentFor('format_align_center')}
              </RadixToolbar.ToggleItem>
              <RadixToolbar.ToggleItem
                value="right"
                title={t('table.alignRight', 'Align right')}
              >
                {iconComponentFor('format_align_right')}
              </RadixToolbar.ToggleItem>
            </RadixToolbar.ToggleGroup>
            <RadixToolbar.Separator />
            <RadixToolbar.Button
              onClick={insertColumnAt.bind(null, colIndex)}
              title={t(
                'table.insertColumnLeft',
                'Insert a column to the left of this one',
              )}
            >
              {iconComponentFor('insert_col_left')}
            </RadixToolbar.Button>
            <RadixToolbar.Button
              onClick={insertColumnAt.bind(null, colIndex + 1)}
              title={t(
                'table.insertColumnRight',
                'Insert a column to the right of this one',
              )}
            >
              {iconComponentFor('insert_col_right')}
            </RadixToolbar.Button>
            <RadixToolbar.Button
              onClick={deleteColumnAt.bind(null, colIndex)}
              title={t('table.deleteColumn', 'Delete this column')}
              disabled={colCount <= 1}
            >
              {iconComponentFor('delete_small')}
            </RadixToolbar.Button>
          </RadixToolbar.Root>
          <RadixPopover.Arrow className={styles['popoverArrow']} />
        </RadixPopover.PopoverContent>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
interface RowEditorProps {
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
  rowIndex: number;
  rowCount: number;
  highlightedCoordinates: [number, number];
  setActiveCellWithBoundaries: (cell: [number, number] | null) => void;
}

const RowEditor: React.FC<RowEditorProps> = ({
  parentEditor,
  highlightedCoordinates,
  lexicalTable,
  rowIndex,
  rowCount,
  setActiveCellWithBoundaries,
}) => {
  const [editorRootElementRef, iconComponentFor] = useCellValues(
    editorRootElementRef$,
    iconComponentFor$,
  );

  const insertRowAt = React.useCallback(
    (rowIndex: number) => {
      parentEditor.update(() => {
        lexicalTable.insertRowAt(rowIndex);
      });
      setActiveCellWithBoundaries([0, rowIndex]);
    },
    [parentEditor, lexicalTable, setActiveCellWithBoundaries],
  );

  const deleteRowAt = React.useCallback(
    (rowIndex: number) => {
      parentEditor.update(() => {
        lexicalTable.deleteRowAt(rowIndex);
      });
    },
    [parentEditor, lexicalTable],
  );

  const t = useTranslation();
  return (
    <RadixPopover.Root>
      <RadixPopover.PopoverTrigger
        className={styles['tableColumnEditorTrigger']}
        data-visible={highlightedCoordinates[1] === rowIndex || undefined}
        title={t('table.rowMenu', 'Row menu')}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </RadixPopover.PopoverTrigger>
      <RadixPopover.Portal container={editorRootElementRef?.current}>
        <RadixPopover.PopoverContent
          className={classNames(styles['tableColumnEditorPopoverContent'])}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          sideOffset={5}
          side="bottom"
        >
          <RadixToolbar.Root className={styles['tableColumnEditorToolbar']}>
            <RadixToolbar.Button
              onClick={insertRowAt.bind(null, rowIndex)}
              title={t('table.insertRowAbove', 'Insert a row above this one')}
            >
              {iconComponentFor('insert_row_above')}
            </RadixToolbar.Button>
            <RadixToolbar.Button
              onClick={insertRowAt.bind(null, rowIndex + 1)}
              title={t('table.insertRowBelow', 'Insert a row below this one')}
            >
              {iconComponentFor('insert_row_below')}
            </RadixToolbar.Button>
            <RadixToolbar.Button
              onClick={deleteRowAt.bind(null, rowIndex)}
              title={t('table.deleteRow', 'Delete this row')}
              disabled={rowCount <= 1}
            >
              {iconComponentFor('delete_small')}
            </RadixToolbar.Button>
          </RadixToolbar.Root>
          <RadixPopover.Arrow className={styles['popoverArrow']} />
        </RadixPopover.PopoverContent>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};

// TableSettingsButton
const TableSettingsButton: React.FC<{
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
}> = ({ parentEditor, lexicalTable }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('');

  const openDialog = React.useCallback(() => {
    parentEditor.getEditorState().read(() => {
      const styleStr = lexicalTable.getMdastNode().data?.hProperties?.['style'] as
        | string
        | undefined;
      setCurrentStyle(styleStr || '');
      setIsDialogOpen(true);
    });
  }, [lexicalTable, parentEditor]);

  const handleSetTableStyle = (newStyle: string) => {
    parentEditor.update(() => {
      // Use the new setTableStyle method we added to TableNode
      lexicalTable.setTableStyle(newStyle);
    });
  };

  return (
    <>
      <Tooltip title="Table Settings">
        <IconButton size="small" onClick={openDialog}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      {isDialogOpen && (
        <TableStyleDialog
          isOpen={isDialogOpen}
          style={currentStyle}
          setTableStyle={handleSetTableStyle}
          setIsStyleDialogOpen={setIsDialogOpen}
        />
      )}
    </>
  );
};
