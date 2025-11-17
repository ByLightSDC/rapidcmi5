import { MdastImportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';

import { githubSlugger$ } from '.';
import { $createTocHeadingNode } from './TocHeading';
import { visit } from 'unist-util-visit';

export const MdastHeadingVisitor: MdastImportVisitor<Mdast.Heading> = {
  testNode: 'heading',
  visitNode: function ({ mdastNode, actions }): void {
    const slugger = githubSlugger$;

    if (!mdastNode.children || mdastNode.children.length < 1) {
      return;
    }
    const cleanedHeading: string[] = [];
    visit(mdastNode, (node) => {
      if (node.type === 'text') {
        cleanedHeading.push(node.value);
      }
    });

    const slug = slugger.slug(cleanedHeading.join(' '));
    const headingNode = $createTocHeadingNode(`h${mdastNode.depth}`, slug);
    actions.addAndStepInto(headingNode);
  },
};
