import * as Mdast from 'mdast';
import { $createParagraphNode, RootNode } from 'lexical';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createFootnoteDefinitionNode } from './methods';

/**
 * Converts Mdast Footnote Definition into Lexical Footnote Definition
 * Example
 * [^mercury]:
    **Mercury** is the first planet from the Sun and the smallest
    in the Solar System.
 */
export const MdastFootnoteDefinitionVisitor: MdastImportVisitor<Mdast.FootnoteDefinition> =
  {
    testNode: (node) => {
      return node.type === 'footnoteDefinition';
    },
    visitNode({ mdastNode, lexicalParent }) {
      const theNode = $createFootnoteDefinitionNode({
        mdastNode,
        label: mdastNode?.label || '',
      });

      if (lexicalParent.getType() === 'root') {
        //console.log('visit mdast def');

        const paragraph = $createParagraphNode();
        paragraph.append(theNode);
        (lexicalParent as RootNode).append(paragraph);
      } else {
        (lexicalParent as RootNode).append(theNode);
      }
    },
  };
