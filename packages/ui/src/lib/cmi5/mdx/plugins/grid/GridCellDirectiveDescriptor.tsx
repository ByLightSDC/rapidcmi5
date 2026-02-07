import { DirectiveDescriptor } from '@mdxeditor/editor';
import { GridCellDirectiveNode } from './types';
import { GridCellEditor } from './GridCellEditor';

/**
 * Grid Cell Directive Descriptor for the Grid Layout plugin.
 * Represents a single cell within a grid container.
 */
export const GridCellDirectiveDescriptor: DirectiveDescriptor<GridCellDirectiveNode> =
  {
    name: 'grid',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'grid';
    },
    attributes: ['size', 'textAlign'],
    hasChildren: true,
    Editor: GridCellEditor,
  };
