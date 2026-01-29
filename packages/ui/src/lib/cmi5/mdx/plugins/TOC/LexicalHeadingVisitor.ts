import { LexicalExportVisitor } from '@mdxeditor/editor';
import * as Mdast from 'mdast';
import { $isTOCHeadingNode, TOCHeadingNode } from './TocHeading';

export const LexicalHeadingVisitor: LexicalExportVisitor<
  TOCHeadingNode,
  Mdast.Heading
> = {
  testLexicalNode: $isTOCHeadingNode,

  visitLexicalNode: ({ lexicalNode, actions }) => {
    const depth = parseInt(
      lexicalNode.getTag()[1],
      10,
    ) as Mdast.Heading['depth'];
    actions.addAndStepInto('heading', {
      depth,
    });
  },
};
