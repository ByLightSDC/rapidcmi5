import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Debug Nodes
 */
export const debugPlugin: Plugin = () => {
  function transformer(tree: any) {
    visit(tree, (node, index, parent) => {
      //console.log('node', node);
    });
  }
  return transformer;
};

/**
 * Plugin fixes an issue where remarkGfm adds link tags to text that
 * starts with www or https regardless of whether or not it is already inside an <a href tag
 */
export const linkPlugin: Plugin = () => {
  function transformer(tree: any) {
    let startIndex = -1;
    let endIndex = -1;

    visit(tree, 'html', (node, position = -1, parent) => {
      if (node.value && node.value.startsWith('<a href')) {
        startIndex = position;
        endIndex = -1;
      } else if (node.value && node.value === '</a>') {
        endIndex = position;
      }
    });

    visit(tree, 'link', (node, position = -1, parent) => {
      if (
        startIndex >= 0 &&
        endIndex >= 0 &&
        position >= startIndex &&
        position <= endIndex
      ) {
        //console.log('replace between tags', node);
        const definitions = [...node.children];
        const last = parent.children.slice(position + 1);
        parent.children = parent.children.slice(0, position);
        parent.children = parent.children.concat(definitions);
        parent.children = parent.children.concat(last);
      }
    });
  }
  return transformer;
};
