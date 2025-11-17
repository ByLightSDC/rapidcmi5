import {
  $createGenericHTMLNode,
  MdastHTMLNode,
  MdastImportVisitor,
} from '@mdxeditor/editor';

import { MdxJsxAttribute } from 'mdast-util-mdx';
import { $createParagraphNode, RootNode } from 'lexical';
import { $isMdastIFrameNode } from './methods';

/**
 * When converting mdast iframe to lexical
 * Insert generic html node into a paragraph node
 */
export const MdastIFrameVisitor: MdastImportVisitor<MdastHTMLNode> = {
  testNode: $isMdastIFrameNode,
  visitNode({ mdastNode, lexicalParent }) {
    const htmlNode = $createGenericHTMLNode(
      mdastNode.name,
      mdastNode.type,
      mdastNode.attributes as MdxJsxAttribute[],
    );

    const paragraph = $createParagraphNode();
    paragraph.append(htmlNode);
    (lexicalParent as RootNode).append(paragraph);
  },
  priority: 1,
};
