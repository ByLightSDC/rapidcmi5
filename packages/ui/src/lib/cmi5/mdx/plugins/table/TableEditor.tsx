import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import * as RadixPopover from '@radix-ui/react-popover';
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
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
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
  ButtonWithTooltip,
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
  center: styles.centeredCell,
  left: styles.leftAlignedCell,
  right: styles.rightAlignedCell,
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
      if (tableCell === null) {
        return;
      }
      const tableRow = tableCell.parentElement!;
      const tableContainer = tableRow.parentElement!;
      const colIndex =
        tableContainer.tagName === 'TFOOT'
          ? -1
          : Array.from(tableRow.children).indexOf(tableCell);
      const rowIndex =
        tableCell.tagName === 'TH'
          ? -1
          : Array.from(tableRow.parentElement!.children).indexOf(tableRow);
      setHighlightedCoordinates([colIndex, rowIndex]);
    },
    [],
  );

  const t = useTranslation();

  useEffect(() => {
    console.log('TableEditor');
    console.log('mdastNode', mdastNode);
    console.log('lexicalTable', lexicalTable);
  }, []);

  // get styles to apply to the table
  const tableStyle = mdastNode.data?.hProperties?.style as string | undefined;

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
        className={styles.tableEditor}
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
                  <th className={styles.tableToolsColumn}></th>
                  {Array.from(
                    { length: mdastNode.children[0].children.length },
                    (_, colIndex) => {
                      return (
                        <th key={colIndex} data-tool-cell={true}>
                          <ColumnEditor
                            {...{
                              setActiveCellWithBoundaries,
                              parentEditor,
                              colIndex,
                              highlightedCoordinates,
                              lexicalTable,
                              align: (mdastNode.align ?? [])[colIndex],
                            }}
                          />
                        </th>
                      );
                    },
                  )}

                  <th className={styles.tableToolsColumn} data-tool-cell={true}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'center',
                      }}
                    >
                      <TableSettingsButton
                        parentEditor={parentEditor}
                        lexicalTable={lexicalTable}
                      />
                      <button
                        className={styles.iconButton}
                        type="button"
                        title={t('table.deleteTable', 'Delete table')}
                        onClick={(e) => {
                          e.preventDefault();
                          parentEditor.update(() => {
                            lexicalTable.selectNext();
                            lexicalTable.remove();
                          });
                        }}
                      >
                        {iconComponentFor('delete_small')}
                      </button>
                    </div>
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
                        className={styles.toolCell}
                        data-tool-cell={true}
                      >
                        <RowEditor
                          {...{
                            setActiveCellWithBoundaries,
                            parentEditor,
                            rowIndex,
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

                      return (
                        <Cell
                          align={mdastNode.align?.[colIndex]}
                          cellBackgroundColor={dynamicColor}
                          perimeterStyle={perimeterStyle} // Pass style
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
                    {readOnly ||
                      (rowIndex === 0 && (
                        <th
                          rowSpan={lexicalTable.getRowCount()}
                          data-tool-cell={true}
                        >
                          <button
                            type="button"
                            className={styles.addColumnButton}
                            onClick={addColumnToRight}
                          >
                            {iconComponentFor('add_column')}
                          </button>
                        </th>
                      ))}
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
                      className={styles.addRowButton}
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
      console.log('CellElement', CellElement);
      console.log('pick bg color', color);
      console.log('props', props);
      if (color) {
        setColor(color);
      }
    },
    [setColor, CellElement, props],
  );

  return (
    <CellElement
      className={className}
      data-active={isActive}
      style={{ backgroundColor: currentColor, ...props.perimeterStyle }}
      onClick={() => {
        setActiveCell([props.colIndex, props.rowIndex]);
      }}
    >
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

  return (
    <LexicalNestedComposer initialEditor={editor}>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
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
        className={styles.tableColumnEditorTrigger}
        data-active={highlightedCoordinates[0] === colIndex + 1}
        title={t('table.columnMenu', 'Column menu')}
      >
        {iconComponentFor('more_horiz')}
      </RadixPopover.PopoverTrigger>
      <RadixPopover.Portal container={editorRootElementRef?.current}>
        <RadixPopover.PopoverContent
          className={classNames(styles.tableColumnEditorPopoverContent)}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          sideOffset={5}
          side="top"
        >
          <RadixToolbar.Root className={styles.tableColumnEditorToolbar}>
            <RadixToolbar.ToggleGroup
              className={styles.toggleGroupRoot}
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
            >
              {iconComponentFor('delete_small')}
            </RadixToolbar.Button>
          </RadixToolbar.Root>
          <RadixPopover.Arrow className={styles.popoverArrow} />
        </RadixPopover.PopoverContent>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
interface RowEditorProps {
  parentEditor: LexicalEditor;
  lexicalTable: TableNode;
  rowIndex: number;
  highlightedCoordinates: [number, number];
  setActiveCellWithBoundaries: (cell: [number, number] | null) => void;
}

const RowEditor: React.FC<RowEditorProps> = ({
  parentEditor,
  highlightedCoordinates,
  lexicalTable,
  rowIndex,
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
        className={styles.tableColumnEditorTrigger}
        data-active={highlightedCoordinates[1] === rowIndex}
        title={t('table.rowMenu', 'Row menu')}
      >
        {iconComponentFor('more_horiz')}
      </RadixPopover.PopoverTrigger>
      <RadixPopover.Portal container={editorRootElementRef?.current}>
        <RadixPopover.PopoverContent
          className={classNames(styles.tableColumnEditorPopoverContent)}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          sideOffset={5}
          side="bottom"
        >
          <RadixToolbar.Root className={styles.tableColumnEditorToolbar}>
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
            >
              {iconComponentFor('delete_small')}
            </RadixToolbar.Button>
          </RadixToolbar.Root>
          <RadixPopover.Arrow className={styles.popoverArrow} />
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
  const [iconComponentFor] = useCellValues(iconComponentFor$);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('');

  const openDialog = React.useCallback(() => {
    parentEditor.getEditorState().read(() => {
      const styleStr = lexicalTable.getMdastNode().data?.hProperties?.style as
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
      <button
        type="button"
        className={styles.iconButton}
        title="Table Settings"
        onClick={openDialog}
      >
        {iconComponentFor('settings')}
      </button>

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
