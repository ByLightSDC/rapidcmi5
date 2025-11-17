import { GenericHTMLNode, LexicalExportVisitor } from '@mdxeditor/editor';
import { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { $isIFrameNode } from './methods';

/**
 * When converting lexical to mdast,
 * append MdxJsx to parent
 */
export const LexicalIFrameVisitor: LexicalExportVisitor<
  GenericHTMLNode,
  MdxJsxFlowElement | MdxJsxTextElement
> = {
  testLexicalNode: $isIFrameNode,
  visitLexicalNode({ actions, lexicalNode, mdastParent }) {
    const md = {
      name: lexicalNode.getTag(),
      type: lexicalNode.getNodeType(),
      attributes: lexicalNode.getAttributes(),
      children: [],
    };

    actions.appendToParent(mdastParent, md);
  },
  priority: 1000,
};
