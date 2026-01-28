import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import * as Mdast from 'mdast';
import React from 'react';
import { TableEditor } from './TableEditor';
//import { TableCell, TableRow } from 'mdast-util-gfm-table/lib'
import type { TableRow, TableCell } from 'mdast';
import { noop } from '@mdxeditor/editor';

/**
 * A serialized representation of a {@link TableNode}.
 * @group Table
 */
export type SerializedTableNode = Spread<
  {
    mdastNode: Mdast.Table;
  },
  SerializedLexicalNode
>;

const EMPTY_CELL: Mdast.TableCell = {
  type: 'tableCell',
  children: [] as Mdast.PhrasingContent[],
};

type CoordinatesSubscription = (
  coords: [colIndex: number, rowIndex: number],
) => void;

function coordinatesEmitter() {
  let subscription: CoordinatesSubscription = noop;
  return {
    publish: (coords: [colIndex: number, rowIndex: number]) => {
      subscription(coords);
    },
    subscribe: (cb: CoordinatesSubscription) => {
      subscription = cb;
    },
  };
}

/**
 * A Lexical node that represents a markdown table.
 * Use {@link "$createTableNode"} to construct one.
 * @group Table
 */
export class TableNode extends DecoratorNode<JSX.Element> {
  /** @internal */
  __mdastNode: Mdast.Table;

  /** @internal */
  focusEmitter = coordinatesEmitter();

  /** @internal */
  static override getType(): string {
    return 'table';
  }

  /** @internal */
  static override clone(node: TableNode): TableNode {
    console.log('TableNode clone');
    return new TableNode(structuredClone(node.__mdastNode), node.__key);
  }

  /** @internal */
  static override importJSON(serializedNode: SerializedTableNode): TableNode {
    console.log('serializedNode.mdastNode', serializedNode.mdastNode);
    return $createTableNode(serializedNode.mdastNode);
  }

  /** @internal */
  static override importDOM(): DOMConversionMap | null {
    return {
      table: () => {
        return {
          conversion: $convertTableElement,
          priority: 3,
        };
      },
    };
  }

  /** @internal */
  override exportJSON(): SerializedTableNode {
    console.log('TableNode exportJSON');
    return {
      mdastNode: structuredClone(this.__mdastNode),
      type: 'table',
      version: 1,
    };
  }

  /**
   * Returns the mdast node that this node is constructed from.
   */
  getMdastNode(): Mdast.Table {
    return this.__mdastNode;
  }

  /**
   * Returns the number of rows in the table.
   */
  getRowCount(): number {
    return this.__mdastNode.children.length;
  }

  /**
   * Returns the number of columns in the table.
   */
  getColCount(): number {
    return this.__mdastNode.children[0]?.children.length || 0;
  }

  /**
   * Constructs a new {@link TableNode} with the specified MDAST table node as the object to edit.
   * See {@link https://github.com/micromark/micromark-extension-gfm-table | micromark/micromark-extension-gfm-table} for more information on the MDAST table node.
   */
  constructor(mdastNode?: Mdast.Table, key?: NodeKey) {
    super(key);
    console.log('TableNode constructor', mdastNode);
    this.__mdastNode = mdastNode ?? { type: 'table', children: [] };
  }

  /** @internal */
  override createDOM(): HTMLElement {
    console.log('TableNode createDOM div');
    return document.createElement('div');
  }

  /** @internal */
  override updateDOM(): false {
    return false;
  }

  updateCellBg(
    colIndex: number,
    rowIndex: number,
    cellBgColor: string | null,
  ): void {
    const self = this.getWritable();
    const table = self.__mdastNode;
    const row = table.children[rowIndex];
    const cells = row.children;
    const cell = cells[colIndex];
    const cellsClone = Array.from(cells);

    console.log('updateCellBg cell', cell); //cell edited
    console.log('cellsClone', cellsClone); //all cells in the row
    console.log('cellBgColor', cellBgColor);

    // clone the cell and update its data.hProperties.style
    const newStyle = cellBgColor
      ? `background-color: ${cellBgColor}`
      : undefined;
    const cellClone = {
      ...cell,
      data: {
        ...cell.data,
        hProperties: {
          ...cell.data?.hProperties,
          style: newStyle,
        },
      },
    };

    // clean up if style is undefined
    if (!newStyle && cellClone.data?.hProperties) {
      delete (cellClone.data.hProperties as any).style;
    }

    const rowClone = { ...row, children: cellsClone };
    cellsClone[colIndex] = cellClone;
    table.children[rowIndex] = rowClone;
    console.log('the table', table);
  }

  /**
   * Sets the full style string for the table.
   * Used by the TableStyleDialog to apply complex border styles.
   */
  setTableStyle(styleString: string): void {
    const self = this.getWritable();
    const table = self.__mdastNode;

    const data = table.data || {};
    const hProperties = data.hProperties || {};

    self.__mdastNode = {
      ...table,
      data: {
        ...data,
        hProperties: {
          ...hProperties,
          style: styleString
        }
      }
    };
  }

  /** @internal */
  updateCellContents(
    colIndex: number,
    rowIndex: number,
    children: Mdast.PhrasingContent[],
  ): void {
    const self = this.getWritable();
    const table = self.__mdastNode;
    const row = table.children[rowIndex];
    const cells = row.children;
    const cell = cells[colIndex];
    const cellsClone = Array.from(cells);
    const cellClone = { ...cell, children };
    const rowClone = { ...row, children: cellsClone };
    cellsClone[colIndex] = cellClone;
    table.children[rowIndex] = rowClone;
  }

  insertColumnAt(colIndex: number): void {
    const self = this.getWritable();
    const table = self.__mdastNode;
    for (let rowIndex = 0; rowIndex < table.children.length; rowIndex++) {
      const row = table.children[rowIndex];
      const cells = row.children;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, children: cellsClone };
      cellsClone.splice(colIndex, 0, structuredClone(EMPTY_CELL));
      table.children[rowIndex] = rowClone;
    }

    if (table.align && table.align.length > 0) {
      table.align.splice(colIndex, 0, 'left');
    }
  }

  deleteColumnAt(colIndex: number): void {
    const self = this.getWritable();
    const table = self.__mdastNode;
    for (let rowIndex = 0; rowIndex < table.children.length; rowIndex++) {
      const row = table.children[rowIndex];
      const cells = row.children;
      const cellsClone = Array.from(cells);
      const rowClone = { ...row, children: cellsClone };
      cellsClone.splice(colIndex, 1);
      table.children[rowIndex] = rowClone;
    }
  }

  insertRowAt(y: number): void {
    const self = this.getWritable();
    const table = self.__mdastNode;
    const newRow: Mdast.TableRow = {
      type: 'tableRow',
      children: Array.from({ length: this.getColCount() }, () =>
        structuredClone(EMPTY_CELL),
      ),
    };
    table.children.splice(y, 0, newRow);
  }

  deleteRowAt(rowIndex: number): void {
    if (this.getRowCount() === 1) {
      this.selectNext();
      this.remove();
    } else {
      this.getWritable().__mdastNode.children.splice(rowIndex, 1);
    }
  }

  addRowToBottom(): void {
    this.insertRowAt(this.getRowCount());
  }

  addColumnToRight(): void {
    this.insertColumnAt(this.getColCount());
  }

  setColumnAlign(colIndex: number, align: Mdast.AlignType) {
    const self = this.getWritable();
    const table = self.__mdastNode;
    if (table.align == null) {
      table.align = [];
    }
    table.align[colIndex] = align;
  }

  /** @internal */
  override decorate(parentEditor: LexicalEditor): JSX.Element {
    return (
      <TableEditor
        lexicalTable={this}
        mdastNode={this.__mdastNode}
        parentEditor={parentEditor}
      />
    );
  }

  /**
   * Focuses the table cell at the specified coordinates.
   * Pass `undefined` to remove the focus.
   */
  select(coords?: [colIndex: number, rowIndex: number]): void {
    this.focusEmitter.publish(coords ?? [0, 0]);
  }

  /** @internal */
  override isInline(): false {
    return false;
  }
}

/**
 * Retruns true if the given node is a {@link TableNode}.
 * @group Table
 */
export function $isTableNode(
  node: LexicalNode | null | undefined,
): node is TableNode {
  return node instanceof TableNode;
}

/**
 * Creates a {@link TableNode}. Use this instead of the constructor to follow the Lexical conventions.
 * @param mdastNode - The mdast node to create the {@link TableNode} from.
 * @group Table
 */
export function $createTableNode(mdastNode: Mdast.Table): TableNode {
  console.log('Table Node2 createTableNode mdastNode', mdastNode);

  return new TableNode(mdastNode);
}

/**
 * Converts an HTML table element into a {@link TableNode}.
 * This function is used to transform a DOM table element into a format that can be used by Lexical.
 * It extracts the rows and cells from the table, converting them into MDAST-compatible nodes.
 *
 * @param element - The HTML table element to convert.
 * @returns A {@link DOMConversionOutput} containing the converted {@link TableNode}.
 * @group Table
 */
export function $convertTableElement(
  element: HTMLElement,
): DOMConversionOutput {
  console.log('TableNode convertTableElement', element);

  const rows = element.querySelectorAll('tr');
  const children = Array.from(rows).map((row) => {
    return {
      type: 'tableRow',
      children: Array.from(row.querySelectorAll('td, th')).map((cell) => {
        // map DOM styles to mdast data
        const el = cell as HTMLElement;
        const style = el.getAttribute('style');
        const data = style ? { hProperties: { style } } : undefined;

        return {
          type: 'tableCell' as const,
          children: [
            {
              type: 'text' as const,
              value: cell.textContent ?? '',
            },
          ],
          data: data,
        } satisfies TableCell;
      }),
    } satisfies TableRow;
  });
  console.log('children');
  return {
    node: new TableNode({
      type: 'table',
      children,
    }),
  };
}
