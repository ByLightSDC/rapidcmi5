import * as Mdast from 'mdast';
import { $createParagraphNode, RootNode } from 'lexical';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createFootnoteReferenceNode } from './methods';

/**
 * Converts Mdast Footnote Reference into Lexical Reference Definition
 * Example
 * In the Solar System, Mercury[^mercury] and Venus[^venus] have very small tilts.
 */
export const MdastFootnoteReferenceVisitor: MdastImportVisitor<Mdast.FootnoteReference> =
  {
    testNode: (node) => {
      return node.type === 'footnoteReference';
    },
    visitNode(props: any) {
      const { mdastNode, lexicalParent } = props;

      const theNode = $createFootnoteReferenceNode({
        label: mdastNode?.label,
      });

      if (lexicalParent.getType() === 'root') {
        const paragraph = $createParagraphNode();
        paragraph.append(theNode);
        (lexicalParent as RootNode).append(paragraph);
      } else {
        (lexicalParent as RootNode).append(theNode);
      }
    },
  };
