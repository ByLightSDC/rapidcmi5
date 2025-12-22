import { visit } from 'unist-util-visit';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { toString } from 'mdast-util-to-string';

/**
 * Auto creates a Table of Contents from Headers in markdown
 * @returns
 */
export const customRemarkToc: Plugin = () => {
  return (tree: Node) => {
    const tocEntries: any[] = [];

    visit(tree, 'heading', (node: any) => {
      const headingText = toString(node, { includeHtml: false }).trim();

      const slug = headingText.toLowerCase().replace(/\s+/g, '-');
      const anchor = `#${slug}`;
      const depth = node.depth || 1; // Heading level (h1, h2, h3...)

      if (!node.data) node.data = {};
      if (!node.data.hProperties) node.data.hProperties = {};

      if (typeof window !== 'undefined') {
        const basePath = window.location.pathname + window.location.search;
        node.data.hProperties.href = `${anchor}`;
        node.data.hProperties.id = slug;
        node.data.hProperties.className = 'heading-link';

        // Store TOC entry
        tocEntries.push({
          text: headingText,
          href: `${basePath}${anchor}`,
          depth,
        });
      }
    });

    // Insert TOC as a normal Markdown AST node (div with children)
    if (tocEntries.length > 0) {
      //@ts-ignore
      tree.children.unshift({
        type: 'paragraph',
        children: [
          {
            type: 'html',
            value: `<div class="toc-container">
                      <ul class="toc-list">
                        ${tocEntries
                          .map(
                            (entry) =>
                              `<li class="toc-item depth-${entry.depth}">
                                <a href="${entry.href}" data-testid="toc-item" className="toc-link">${entry.text}</a>
                              </li>`,
                          )
                          .join('')}
                      </ul>
                    </div>`,
          },
        ],
      });
    }
  };
};
