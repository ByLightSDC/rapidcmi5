import { DirectiveDescriptor } from '@mdxeditor/editor';
import { StatementDirectiveNode } from './types';
import { StatementEditor } from './StatementEditor';

/**
 * Statement Content Directive Descriptor
 * Represents a single statement block
 */
export const StatementDirectiveDescriptor: DirectiveDescriptor<StatementDirectiveNode> =
  {
    name: 'statement',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'statement';
    },
    attributes: [],
    hasChildren: true,
    Editor: StatementEditor,
  };
