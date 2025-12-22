import { DirectiveDescriptor } from '@mdxeditor/editor';
import type { ContainerDirective } from 'mdast-util-directive';
import { LayoutBoxEditor } from './LayoutBoxEditor';

/**
 * Define the directive descriptor for the LayoutBox
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
    Editor: LayoutBoxEditor, // the custom editor component
  };
