import {
  realmPlugin,
  addActivePlugin$,
  addExportVisitor$,
  addLexicalNode$,
  GenericHTMLNode,
  addImportVisitor$,
} from '@mdxeditor/editor';

import { LexicalIFrameVisitor } from './LexicalIFrameVisitor';
import { MdastIFrameVisitor } from './MdastIFrameVisitor';

export const htmlPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'html',
      [addLexicalNode$]: [GenericHTMLNode],
      [addImportVisitor$]: [MdastIFrameVisitor],
      [addExportVisitor$]: [LexicalIFrameVisitor],
    });
  },
});
