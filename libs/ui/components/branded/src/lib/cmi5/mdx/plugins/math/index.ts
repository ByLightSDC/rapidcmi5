import {
  InlineMath,
  Math,
  mathFromMarkdown,
  mathToMarkdown,
} from 'mdast-util-math';

import { math, mathHtml } from 'micromark-extension-math';

import {
  realmPlugin,
  addActivePlugin$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  addToMarkdownExtension$,
  addMdastExtension$,
  addSyntaxExtension$,
  Cell,
} from '@mdxeditor/editor';

import { MdastInlineMathVisitor } from './MdastInlineMathVisitor';
import { MdastBlockMathVisitor } from './MdastBlockMathVisitor';
import { MathNode } from './MathNode';
import { LexicalMathVisitor } from './LexicalMathVisitor';
import { MathEditorDescriptor } from './MathEditorContext';

/**
 * Custom nodes must be added to MdxEditor content map
 */
declare module 'mdast' {
  interface RootContentMap {
    // Allow using math nodes defined by `mdast-util-math`.
    math: Math;
    inlineMath: InlineMath;
  }
}

/**
 * Contains the currently registered math descriptors.
 * @group Math
 */
export const mathEditorDescriptors$ = Cell<MathEditorDescriptor[]>([]);

/**
 * A plugin that adds support for rendering math 
 * supports both inline and display
 * see Mdast visitors for md examples
 * @group Math
 */
export const mathPlugin = realmPlugin<{
  mathEditorDescriptors?: MathEditorDescriptor[];
}>({
  init(realm, params) {
    realm.pubIn({
      [addActivePlugin$]: 'math', //Plugin name
      [mathEditorDescriptors$]: params?.mathEditorDescriptors ?? [],
      [addImportVisitor$]: [MdastBlockMathVisitor, MdastInlineMathVisitor], //importing markdown
      [addLexicalNode$]: MathNode, //lexical node fenced code block
      [addExportVisitor$]: LexicalMathVisitor, //lexical to  markdown
      [addSyntaxExtension$]: [math(), mathHtml()],
      [addMdastExtension$]: mathFromMarkdown(),
      [addToMarkdownExtension$]: mathToMarkdown(),
    });
  },
});


/**
 * How to Create a Plugin
 * 1. Create index file
 * define custom mdast nodes in RootContentMap
 *  you can most often import the Mdast node from an existing utility ex. mdast-util-math
 * add Mdast visitors that implement mdast-util node types
 *
 * add micromark syntax for parsing
 *    you can most often import the syntax from an existing utility ex. micromark-extension-math
 * inject plugin to MDXEditor plugins list
 * verify a use case can be typed in raw mode, switch to lexical view and verify your custom visitor
 * 
 * export a variable to contain descriptors for the plugin
 * create a custom node with create method
 *     create new descriptor for rendering/editing your custom node
 *     the math is rendered by react-markdown with a katex plugin, see https://katex.org/docs/supported.html
 * add addExportVisitor which implements custom Mast nodes
 * verify lexical is  exported to correct markdown syntax (visual to raw view)
 */