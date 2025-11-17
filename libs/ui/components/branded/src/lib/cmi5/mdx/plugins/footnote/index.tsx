import {
  gfmFootnoteFromMarkdown,
  gfmFootnoteToMarkdown,
} from 'mdast-util-gfm-footnote';

import { gfmFootnote } from 'micromark-extension-gfm-footnote';

import {
  realmPlugin,
  addActivePlugin$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addToMarkdownExtension$,
  addMdastExtension$,
  addSyntaxExtension$,
  addComposerChild$,
} from '@mdxeditor/editor';

import { MdastFootnoteReferenceVisitor } from './MdastFootnoteReferenceVisitor';
import { MdastFootnoteDefinitionVisitor } from './MdastFootnoteDefinitionVisitor';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';
import { LexicalFootnoteReferenceVisitor } from './LexicalFootnoteReferenceVisitor';

import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';

import { LexicalFootnoteDefinitionVisitor } from './LexicalFootnoteDefinitionVisitor';
import { FootnoteDefinitionGroupNode } from './FootnoteDefinitionGroupNode';
import { LexicalFootnoteDefinitionGroupVisitor } from './LexicalFootnoteDefinitionGroupVisitor';
import { LexicalFootnoteHTMLVisitor } from './LexicalFootnoteHtmlVisitor';
import {
  iFootnoteDefinitionEditorDescriptor,
  iFootnoteReferenceEditorDescriptor,
} from './types';
import {
  footnoteDefinitionEditorDescriptors$,
  footnoteReferenceEditorDescriptors$,
} from './vars';
import FootnoteRegistry from './FootnoteRegistry';

/**
 * Register Mdast Footnote Nodes with MdxEditor
 */
declare module 'mdast' {
  interface RootContentMap {
    // Allow using footnote nodes defined by `mdast-util-gfm-footnote`.
    footnoteReference: FootnoteReference;
    footnoteDefinition: FootnoteDefinition;
  }
}

/**
 * A plugin used to enable Editing Footnotes
 * supports both inline and display
 * see Mdast visitors for md examples
 * @group FootNote
 */
export const footnotePlugin = realmPlugin<{
  footnoteDefinitionEditorDescriptors?: iFootnoteDefinitionEditorDescriptor[];
  footnoteReferenceEditorDescriptors?: iFootnoteReferenceEditorDescriptor[];
}>({
  init(realm, params) {
    realm.pubIn({
      [addActivePlugin$]: 'footnotes',
      [addComposerChild$]: FootnoteRegistry,
      [footnoteDefinitionEditorDescriptors$]:
        params?.footnoteDefinitionEditorDescriptors ?? [],
      [footnoteReferenceEditorDescriptors$]:
        params?.footnoteReferenceEditorDescriptors ?? [],
      [addImportVisitor$]: [
        MdastFootnoteDefinitionVisitor,
        MdastFootnoteReferenceVisitor,
      ],
      [addLexicalNode$]: [
        FootnoteReferenceNode,
        FootnoteDefinitionNode,
        FootnoteDefinitionGroupNode,
      ],
      [addExportVisitor$]: [
        LexicalFootnoteReferenceVisitor,
        LexicalFootnoteDefinitionVisitor,
        LexicalFootnoteDefinitionGroupVisitor,
        LexicalFootnoteHTMLVisitor,
      ],
      [addSyntaxExtension$]: [gfmFootnote()],
      [addMdastExtension$]: gfmFootnoteFromMarkdown(),
      [addToMarkdownExtension$]: gfmFootnoteToMarkdown(),
    });
  },
});
