// @ts-nocheck
import { Plugin } from 'unified';
import { visit, SKIP } from 'unist-util-visit';
import { Node, Parent } from 'unist';
import React from 'react';
import Alert from '@mui/material/Alert';

import { fromMarkdown } from 'mdast-util-from-markdown';

import { AlertTitle } from '@mui/material';

/**
 * Define the structure of an Admonition AST Node
 */
interface AdmonitionNode extends Parent {
  type: 'admonition' | 'collapsible';
  data: {
    hName: 'div';
    hProperties: { className: string };
  };
}
/**
 * Custom Remark plugin to transform MkDocs-style admonitions (`!!! warning`)
 * and collapsible sections (`??? info`), ensuring proper grouping.
 * The admition plugin will grab everything after a newline that is tabbed into a code block.
 */
export const remarkAdmonitions: Plugin = () => {
  return (tree, file) => {
    const regex = /^(!!!|\?\?\?\+?)\s*(\w+)\s*"?(.*?)"?$/;
    let currentBlock: AdmonitionNode | null = null;
    let inBlock = false;

    visit(
      tree,
      (node: Node, index: number | undefined, parent: Parent | undefined) => {
        if (!parent || typeof index !== 'number') return;
        // This is where we will check to see if a node should be transformed into
        // an admission based on the regex above.

        const admonitionNode = node.children?.[0];

        // Need to loop through the next tree node before clearing current block
        if (!inBlock && currentBlock) {
          currentBlock = null;
        }

        let match = false;

        if (admonitionNode?.type === 'text') {
          const cleanedValue = admonitionNode.value.replace(/\s+/g, ' ').trim();
          match = cleanedValue.match(regex);
        }

        if (match) {
          const [_, blockType, type, title] = match;

          const cleanType = (type as string).toLowerCase();
          // Determine block type: `!!!` (admonition) or `???` (collapsible)
          const isCollapsible = blockType === '???' || blockType === '???+';

          // If this is a collapsible, is it defaulted to open?
          const defaultOpen = blockType === '???+';

          // Create a new admonition block
          currentBlock = {
            type: isCollapsible ? 'collapsible' : 'admonition',
            data: {
              hName: 'div',
              hProperties: {
                className: `${isCollapsible ? 'collapsible' : 'admonition'}${defaultOpen ? ' defaultOpen' : ''} ${cleanType}`,
              },
            },
            children: [
              {
                type: 'paragraph',
                data: {
                  hName: 'p',
                  hProperties: {
                    className: `${isCollapsible ? 'collapsible-title' : 'admonition-title'}`,
                  },
                },
                children: [
                  { type: 'text', value: title === '' ? type : title },
                ],
              },
            ],
          };
          parent.children[index] = currentBlock;
          inBlock = true;
        } else if (inBlock) {
          if (node.type === 'code') {
            const childNode = fromMarkdown(node.value);
            childNode.type = 'paragraph';
            // add the code block content translated into an mdast object
            currentBlock.children.push(childNode);
            // remove the old node from the tree
            parent.children.splice(index, 1);
            inBlock = false;
            return [SKIP, index];
          }
        }
      },
    );
  };
};

export const parseAlert = (props: any) => {
  const { node, className, children } = props;
  let title: React.ReactNode = null;
  const contentChildren: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const element = child as ReactElement<{
        className?: string;
        children?: ReactNode;
      }>;
      if (element.props.className?.includes('admonition-title')) {
        title = element.props.children;
      } else {
        contentChildren.push(child);
      }
    } else {
      contentChildren.push(child);
    }
  });
  return (
    <Alert severity={'info'} style={{ margin: '1em 0' }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {contentChildren}
    </Alert>
  );
};
