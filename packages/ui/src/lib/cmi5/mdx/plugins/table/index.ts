import {
  gfmTableFromMarkdown,
  gfmTableToMarkdown,
  type Options as GfmTableOptions,
} from 'mdast-util-gfm-table';
import { gfmTable } from 'micromark-extension-gfm-table';
import {
  realmPlugin,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addSyntaxExtension$,
  addToMarkdownExtension$,
  addActivePlugin$,
} from '@mdxeditor/editor';
import { LexicalTableVisitor } from './LexicalTableVisitor';
import { MdastTableVisitor } from './MdastTableVisitor';
import { TableNode } from './TableNode';
import { addMdastExtension$ } from '@mdxeditor/editor';
import { MdastJsxTableVisitor } from './MdastJsxTableVisitor';
export * from './TableNode';

/**
 * A plugin that adds support for tables to the editor.
 * @group Table
 */
export const rc5TablePlugin = realmPlugin<GfmTableOptions>({
  init(realm, params) {
    realm.pubIn({
      [addActivePlugin$]: 'table',
      // import
      [addMdastExtension$]: gfmTableFromMarkdown(),
      [addSyntaxExtension$]: gfmTable(),
      [addImportVisitor$]: [MdastTableVisitor, MdastJsxTableVisitor],
      // export
      [addLexicalNode$]: TableNode,
      [addExportVisitor$]: LexicalTableVisitor,
      [addToMarkdownExtension$]: gfmTableToMarkdown({
        tableCellPadding: params?.tableCellPadding ?? true,
        tablePipeAlign: params?.tablePipeAlign ?? true,
      }),
    });
  },
});

// editor.registerNode(MyTableNode);
// editor.registerNode(MyTableRowNode);
// editor.registerNode(MyTableCellNode);
