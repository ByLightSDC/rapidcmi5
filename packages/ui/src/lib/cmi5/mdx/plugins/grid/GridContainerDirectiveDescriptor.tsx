import { DirectiveDescriptor } from '@mdxeditor/editor';
import { GridContainerDirectiveNode } from './types';
import { GridContainerEditor } from './GridContainerEditor';

/**
 * Grid Container Directive Descriptor for the Grid Layout plugin.
 * Represents a container that holds multiple grid cells.
 */
export const GridContainerDirectiveDescriptor: DirectiveDescriptor<GridContainerDirectiveNode> =
  {
    name: 'gridContainer',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'gridContainer';
    },
    attributes: ['style'],
    hasChildren: true,
    Editor: GridContainerEditor,
  };
