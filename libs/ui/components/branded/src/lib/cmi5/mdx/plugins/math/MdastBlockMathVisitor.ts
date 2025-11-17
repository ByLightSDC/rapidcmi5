
import { Math } from 'mdast-util-math';
import { $createParagraphNode, RootNode } from 'lexical';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createMathNode } from './MathNode';

/**
 * Visits math display nodes based on mdast-util-math Math parsing rules
 * Math display will center text and make font size slightly larger
 * 
 * Examples 
 * $$
 * L = \frac{1}{2} \rho v^2 S C\_L
 * $$
 * 
 */
export const MdastBlockMathVisitor: MdastImportVisitor<Math> = {
  testNode: (node) => {
    return node.type === 'math';
  },
  visitNode({ mdastNode, lexicalParent }) {
    const theNode = $createMathNode({
      isInline: false,
      code: mdastNode.value,
      language: 'math',
      meta: '',
    });
     console.log('display math');
    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(theNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(theNode);
    }
  },
};
