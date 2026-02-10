import { DirectiveDescriptor } from '@mdxeditor/editor';
import { AccordionContentDirectiveNode } from './types';
import { AccordionContentEditor } from './AccordionContentEditor';

/**
 * Accordion Item Content Editor for the Tab plugin
 */
export const AccordionContentDirectiveDescriptor: DirectiveDescriptor<AccordionContentDirectiveNode> =
  {
    name: 'accordionContent',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'accordionContent';
    },
    attributes: ['title', 'textAlign'],
    hasChildren: true,
    Editor: AccordionContentEditor,
  };
