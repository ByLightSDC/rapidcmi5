import { DirectiveDescriptor } from '@mdxeditor/editor';
import { QuoteCellDirectiveNode } from './types';
import { QuoteCellEditor } from './QuoteCellEditor';

/**
 * Quote Content Directive Descriptor for the Grid Layout plugin.
 * Represents a single cell within a grid container.
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
    Editor: QuoteCellEditor,
  };
