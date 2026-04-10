import { DirectiveDescriptor } from '@mdxeditor/editor';
import { QuoteContentDirectiveNode } from './types';
import { QuoteContentEditor } from './QuoteContentEditor';

/**
 * Quote Content Directive Descriptor
 * Represents a single quote block
 */
export const QuotesContentDirectiveDescriptor: DirectiveDescriptor<QuoteContentDirectiveNode> =
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
