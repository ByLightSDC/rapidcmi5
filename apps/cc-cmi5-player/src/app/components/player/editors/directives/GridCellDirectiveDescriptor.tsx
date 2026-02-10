import { DirectiveDescriptor } from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';
import { GridCellPlayback } from './GridCellPlayback';

export const GridCellDirectiveDescriptor: DirectiveDescriptor<ContainerDirective> =
  {
    name: 'grid',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'grid';
    },
    attributes: ['size', 'textAlign'],
    hasChildren: true,
    Editor: GridCellPlayback,
  };
