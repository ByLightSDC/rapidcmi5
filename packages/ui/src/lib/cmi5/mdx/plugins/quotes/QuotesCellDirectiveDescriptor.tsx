import { DirectiveDescriptor } from '@mdxeditor/editor';
import { QuoteCellDirectiveNode } from './types';
import { QuoteContentEditor } from './QuoteContentEditor';

/**
 * Quote Content Directive Descriptor
 * Represents a single quote block
 */
export const QuotesCellDirectiveDescriptor: DirectiveDescriptor<QuoteCellDirectiveNode> =
  {
    name: 'quoteContent',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'quoteContent';
    },
    attributes: ['size', 'preset', 'author', 'avatar'],
    hasChildren: true,
    Editor: QuoteContentEditor,
  };
