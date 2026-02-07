import { DirectiveDescriptor } from '@mdxeditor/editor';
import { TabContentDirectiveNode } from './types';
import { TabContentEditor } from './TabContentEditor';

/**
 * Tab Item Content Editor for the Tab plugin
 */
export const TabContentDirectiveDescriptor: DirectiveDescriptor<TabContentDirectiveNode> =
  {
    name: 'tabContent',
    type: 'containerDirective',
    testNode(node) {
      return node.name === 'tabContent';
    },
    attributes: ['title', 'textAlign'],
    hasChildren: true,
    Editor: TabContentEditor,
  };
