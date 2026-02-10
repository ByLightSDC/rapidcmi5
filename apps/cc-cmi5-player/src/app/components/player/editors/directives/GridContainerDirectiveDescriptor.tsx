import { DirectiveDescriptor } from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';
import { GridContainerPlayback } from './GridContainerPlayback';

export const GridContainerDirectiveDescriptor: DirectiveDescriptor<ContainerDirective> =
  {
    name: 'gridContainer',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'gridContainer';
    },
    attributes: ['style'],
    hasChildren: true,
    Editor: GridContainerPlayback,
  };
