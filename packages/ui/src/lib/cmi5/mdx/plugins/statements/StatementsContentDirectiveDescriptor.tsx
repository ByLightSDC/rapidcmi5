import { DirectiveDescriptor } from '@mdxeditor/editor';
import { StatementContentDirectiveNode } from './types';
import { StatementContentEditor } from './StatementContentEditor';

/**
 * Statement Content Directive Descriptor
 * Represents a single statement block
 */
export const StatementsContentDirectiveDescriptor: DirectiveDescriptor<StatementContentDirectiveNode> =
  {
    name: 'statementContent',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'statementContent';
    },
    attributes: ['size', 'preset', 'author', 'avatar'],
    hasChildren: true,
    Editor: StatementContentEditor,
  };
