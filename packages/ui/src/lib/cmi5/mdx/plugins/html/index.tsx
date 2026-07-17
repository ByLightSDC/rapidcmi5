import {
  realmPlugin,
  addActivePlugin$,
  addExportVisitor$,
  addLexicalNode$,
  GenericHTMLNode,
  addImportVisitor$,
  addToMarkdownExtension$,
} from '@mdxeditor/editor';
import { mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';

import { LexicalIFrameVisitor } from './LexicalIFrameVisitor';
import { MdastIFrameVisitor } from './MdastIFrameVisitor';
import { LexicalGenericHtmlVisitor } from './LexicalGenericHtmlVisitor';
import { MdastGenericHtmlVisitor } from './MdastGenericHtmlVisitor';

export const htmlPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'html',
      [addLexicalNode$]: [GenericHTMLNode],
      // iframe visitors keep their higher priority so they win for <iframe>;
      // the generic visitors (priority -100) handle every other raw HTML
      // element — notably `<span lang="…">` for the Language of Parts feature —
      // so it round-trips instead of throwing on export.
      [addImportVisitor$]: [MdastIFrameVisitor, MdastGenericHtmlVisitor],
      [addExportVisitor$]: [LexicalIFrameVisitor, LexicalGenericHtmlVisitor],
      // Serialize mdxJsxTextElement/FlowElement nodes (our generic spans) WITH
      // their attributes. RC5 does not register MDXEditor's jsxPlugin, so this
      // to-markdown extension is otherwise absent and the export drops all JSX
      // element attributes (e.g. `lang`), emitting only the inner text.
      [addToMarkdownExtension$]: mdxJsxToMarkdown(),
    });
  },
});
