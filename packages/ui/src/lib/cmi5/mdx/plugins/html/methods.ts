import {
  GenericHTMLNode,
  isMdastHTMLNode,
  type MdastHTMLNode,
} from '@mdxeditor/editor';
import { type LexicalNode } from 'lexical';
import type * as Mdast from 'mdast';

/**
 * Returns true if the given node is a iframe HTML Node
 * @group Math
 */
export function $isIFrameNode(
  node: LexicalNode | null | undefined,
): node is GenericHTMLNode {
  return node instanceof GenericHTMLNode && node.getTag() === 'iframe';
}

/**
 * Determines if the given node is a iframe HTML MDAST node.
 * @group HTML
 */
export function $isMdastIFrameNode(node: Mdast.Nodes): node is MdastHTMLNode {
  return isMdastHTMLNode(node) && node.name === 'iframe';
}
