import React from 'react';
import * as Mdast from 'mdast';

export function renderMdastInline(nodes: Mdast.PhrasingContent[]): React.ReactNode[] {
  return nodes.map((node, i) => {
    if (node.type === 'text') return node.value;
    if (node.type === 'strong') return <strong key={i}>{renderMdastInline((node as Mdast.Strong).children)}</strong>;
    if (node.type === 'emphasis') return <em key={i}>{renderMdastInline((node as Mdast.Emphasis).children)}</em>;
    return null;
  });
}

export function renderMdastBlock(node: Mdast.RootContent, i: number): React.ReactNode {
  if (node.type === 'paragraph') {
    return <p key={i}>{renderMdastInline((node as Mdast.Paragraph).children)}</p>;
  }
  return null;
}
