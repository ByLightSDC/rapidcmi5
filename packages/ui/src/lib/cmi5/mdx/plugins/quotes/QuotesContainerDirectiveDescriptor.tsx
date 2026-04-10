import { DirectiveDescriptor } from '@mdxeditor/editor';
import { QuotesContainerDirectiveNode } from './types';
import { QuotesContainerEditor } from './QuotesContainerEditor';

/**
 * Quotes Container Directive Descriptor
 * Represents a container that holds one (or FUTURE more) quote blocks
 */
export const QuotesContainerDirectiveDescriptor: DirectiveDescriptor<QuotesContainerDirectiveNode> =
  {
    name: 'quotes',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'quotes';
    },
    attributes: ['style', 'backgroundColor', 'preset'],
    hasChildren: true,
    Editor: QuotesContainerEditor,
  };
