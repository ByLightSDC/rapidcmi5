import { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx';
import * as Mdast from 'mdast';

export function getAttributeValue(
  node: MdxJsxTextElement | MdxJsxFlowElement,
  attributeName: string,
) {
  const attribute = node.attributes.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === attributeName,
  );
  if (!attribute) {
    return undefined;
  }
  return attribute.value as string | undefined;
}

//
export function normalizeTableCellChildren(
  nodes: (Mdast.BlockContent | Mdast.DefinitionContent)[] = [],
): Mdast.PhrasingContent[] {
  console.log('normalizeTableCellChildren', nodes);

  const result: Mdast.PhrasingContent[] = [];

  for (const n of nodes) {
    // allow phrasing content directly
    if (isTableContent(n)) {
      result.push(n);
      continue;
    }

    // paragraph → flatten text
    if (n.type === 'paragraph') {
      for (const child of n.children) {
        if (isTableContent(child)) {
          result.push(child);
        }
      }
      continue;
    }

    // // JSX flow → flatten it to plain text
    // if (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') {
    //   result.push({
    //     type: 'text',
    //     value: n.toString(),
    //   });
    //   continue;
    // }

    // fallback: dump any block node as text
    // if ('children' in n) {
    //   result.push({
    //     type: 'text',
    //     value: n.toString(),
    //   });
    // }
  }
  console.log('result', result);
  return result;
}

function isTableContent(node: any): node is Mdast.TableContent {
  return (
    node &&
    typeof node.type === 'string' &&
    node.type !== 'paragraph' &&
    node.type !== 'heading' &&
    node.type !== 'blockquote' &&
    node.type !== 'list' &&
    node.type !== 'code' &&
    node.type !== 'definition' &&
    node.type !== 'footnoteDefinition' &&
    node.type !== 'mdxJsxFlowElement' &&
    node.type !== 'mdxJsxTextElement'
  );
}

export function isTag(node: any, tagName: string): node is MdxJsxFlowElement {
  return (
    node &&
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    node.name === tagName
  );
}


