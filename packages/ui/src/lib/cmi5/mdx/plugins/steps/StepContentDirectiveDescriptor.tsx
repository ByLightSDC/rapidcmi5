import { DirectiveDescriptor } from '@mdxeditor/editor';
import { StepContentDirectiveNode } from './types';
import { StepContentEditor } from './StepContentEditor';

/**
 * Stepper Item Content Editor for the Stepper plugin
 */
export const StepContentDirectiveDescriptor: DirectiveDescriptor<StepContentDirectiveNode> =
  {
    name: 'stepContent',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'stepContent';
    },
    attributes: ['title', 'textAlign'],
    hasChildren: true,
    Editor: StepContentEditor,
  };
