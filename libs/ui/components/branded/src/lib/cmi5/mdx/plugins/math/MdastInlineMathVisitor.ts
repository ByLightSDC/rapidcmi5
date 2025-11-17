import { InlineMath } from 'mdast-util-math';

import { $createParagraphNode, RootNode } from 'lexical';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createMathNode } from './MathNode';

/**
 * Visits math inline nodes based on mdast-util-math InlineMath parsing rules
 *
 * Examples
 *
 * ```math
 * C_L
 * ```
 *
 * $L = \frac{1}{2} \rho v^2 S C_L$
 *
 */
export const MdastInlineMathVisitor: MdastImportVisitor<InlineMath> = {
  testNode: 'inlineMath',
  visitNode({ actions, mdastNode, mdastParent, lexicalParent }) {
    const theNode = $createMathNode({
      isInline: true,
      code: mdastNode.value,
      language: 'math',
      meta: '', //this appears in the export 'math-inline',
    });

    console.log('inline math');
    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(theNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(theNode);
    }
  },
};
