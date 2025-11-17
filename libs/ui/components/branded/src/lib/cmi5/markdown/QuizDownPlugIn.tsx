// @ts-nocheck
import { Plugin } from 'unified';

function extractTextFromNode(node) {
  if (!node) return '';

  if (typeof node.value === 'string') {
    return node.value;
  }

  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('');
  }

  return '';
}

export const remarkQuizDown: Plugin = () => {
  return (tree, file) => {
    let quizNum = 0;
    const newChildren = [];
    let collecting = false;
    let buffer: string[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i];

      // Start collecting at the opening quizdown <div>
      if (
        node.type === 'html' &&
        node.value.trim().includes('<div class="quizdown">')
      ) {
        collecting = true;
        buffer = [node.value]; // start buffer fresh
        continue;
      }

      // Continue collecting all nodes inside the block
      if (collecting) {
        if (node.type === 'html' || node.type === 'text') {
          buffer.push(node.value);
        } else if (node.type === 'code') {
          buffer.push(node.value);
        } else if (node.type === 'paragraph' && node.children) {
          buffer.push(
            node.children
              .map((c) => ('value' in c ? c.value : '') || '')
              .join('') + '\n',
          );
        } else if (node.type === 'thematicBreak') {
          // inYaml = !inYaml;
          buffer.push('---');
        } else if (node.value) {
          buffer.push(node.value).join('');
        } else if (node.type === 'list' && node.children) {
          for (const listItem of node.children) {
            if (listItem.type != 'listItem') continue;
            const checked = listItem.checked;
            for (const item of listItem.children) {
              buffer.push(
                '- [' +
                  (checked === true ? 'x' : ' ') +
                  '] ' +
                  item.children
                    .map((c) => ('value' in c ? c.value : '') || '')
                    .join(''),
              );
            }
          }
        } else if (node.type === 'heading') {
          const depth = node.depth;

          const extracted = extractTextFromNode(node);
          let value;

          value = '\n' + '#'.repeat(depth) + ' ' + extracted + '\n';

          buffer.push(value);
        }

        // End collecting at the closing </div>
        if (node.type === 'html' && node.value.trim().startsWith('</div>')) {
          collecting = false;
          quizNum += 1;

          // Join buffer and replace with one html node
          newChildren.push({
            type: 'quizdown',

            children: [{ type: 'text', value: buffer.join('\n\n') }],

            data: {
              hProperties: {
                hName: 'div',
                className: 'quizdown',
                quizNumber: quizNum,
              },
            },
          } as any);

          buffer = [];
        }

        continue; // skip appending collected nodes
      }

      // Outside the block, just copy the node
      newChildren.push(node);
    }

    tree.children = newChildren;
  };
};
