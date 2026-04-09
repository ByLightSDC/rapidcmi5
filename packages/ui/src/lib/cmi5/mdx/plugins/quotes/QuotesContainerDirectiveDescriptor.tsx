import { DirectiveDescriptor } from '@mdxeditor/editor';
import { QuotesContainerDirectiveNode } from './types';
import { QuotesContainerEditor } from './QuotesContainerEditor';

/**
 * Grid Container Directive Descriptor for the Grid Layout plugin.
 * Represents a container that holds multiple grid cells.
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
