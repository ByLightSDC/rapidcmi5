// import 'katex/dist/katex.min.css';
import { visit } from 'unist-util-visit';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const h = require('hastscript');

/**
 * A remark plugin to handle custom tags.
 * Tags such as :mytag will be converted into <mytag>.
 * In turn, those tags will be processed by the customMarkdownParser.
 * @returns
 */
export const customRemarkPlugin = () => {
  return (tree: any) => {
    visit(tree, (node, index, parent) => {
      //console.log('%c node', 'background-color: orange', node);
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const hast = h(node.name, node.attributes || {});

        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      } else if (node.type === 'attr') {
        node.type = 'image';
        const data = node.data || (node.data = {});

        data.hName = 'img';
        data.hProperties = {
          ...node.attributes,
          moreAttributes: node.moreAttributes,
        };
      }
    });
  };
};
