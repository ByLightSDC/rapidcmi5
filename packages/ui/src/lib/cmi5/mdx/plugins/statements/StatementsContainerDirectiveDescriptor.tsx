import { DirectiveDescriptor } from '@mdxeditor/editor';
import { StatementsContainerDirectiveNode } from './types';
import { StatementsContainerEditor } from './StatementsContainerEditor';

/**
 * Statements Container Directive Descriptor
 * Represents a container that holds one (or more) statement blocks
 */
export const StatementsContainerDirectiveDescriptor: DirectiveDescriptor<StatementsContainerDirectiveNode> =
  {
    name: 'statements',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'statements';
    },
    attributes: ['style', 'backgroundColor', 'preset'],
    hasChildren: true,
    Editor: StatementsContainerEditor,
  };
