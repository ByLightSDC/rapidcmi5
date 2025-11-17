import { DirectiveDescriptor } from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';
import { LayoutBoxPlayback } from './LayoutBoxPlayback';

/**
 * Define the directive descriptor for the alignment directive
 */
export const LayoutBoxDirectiveDescriptor: DirectiveDescriptor<ContainerDirective> =
  {
    name: 'layout',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'layout' && node.type === 'containerDirective';
    },
    attributes: ['justifyContent', 'alignItems'],
    hasChildren: true, // this is a container directive with nested content
    Editor: LayoutBoxPlayback,
  };
