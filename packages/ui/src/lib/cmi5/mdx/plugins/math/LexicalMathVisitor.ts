import { LexicalExportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { $isMathNode, MathNode } from './MathNode';
import {
  InlineMath,
  Math,
  mathFromMarkdown,
  mathToMarkdown,
} from 'mdast-util-math';

/**
 * Vists lexical node
 * Converts to either an inline Mdast node or a math Mdast node
 */
export const LexicalMathVisitor: LexicalExportVisitor<
  MathNode,
  InlineMath | Math
> = {
  testLexicalNode: $isMathNode,
  visitLexicalNode: ({ lexicalNode, actions }) => {
    const isInline = lexicalNode.getIsInline();

    //string here is a look up in Mast RootContentMap, see index.ts where these are declared
    actions.addAndStepInto(isInline ? 'inlineMath' : 'math', {
      value: lexicalNode.getCode(),
      code: lexicalNode.getCode(),
      lang: lexicalNode.getLanguage(),
      meta: lexicalNode.getMeta(),
      isInline: isInline,
    });
  },
};
