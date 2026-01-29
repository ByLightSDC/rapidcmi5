import { DirectiveDescriptor } from '@mdxeditor/editor';
import { TabDirectiveNode } from './types';
import { TabsEditor } from './TabsEditor';

/**
 * Tabs plugin 
 * Example markdown
 *  
::::tabs

:::tabContent{title="Tab 1"}
Hello World
:::

:::tabContent{title="Tab 2"}
1. Sed sagittis eleifend rutrum
2. Donec vitae suscipit est
3. Nulla tempor lobortis orci
:::
::::
 * Uses the Directives plugin to import/export mdast
 * containerDirective because tabs can contain multiple children
 * NestedLexicalEditor ContainerDirective because tabs can contain multiple blocks 
 */
export const TabsDirectiveDescriptor: DirectiveDescriptor<TabDirectiveNode> = {
  name: 'tabs',
  type: 'containerDirective',
  testNode(node) {
    return node.name === 'tabs';
  },
  attributes: ['style'],
  hasChildren: true,
  Editor: TabsEditor
};
