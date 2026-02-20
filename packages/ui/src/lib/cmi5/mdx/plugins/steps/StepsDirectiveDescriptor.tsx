import { DirectiveDescriptor } from '@mdxeditor/editor';
import { StepDirectiveNode } from './types';
import { StepsEditor } from './StepsEditor';

/**
 * Steps plugin 
 * Example markdown
 *  
::::steps

:::stepContent{title="Tab 1"}
Hello World
:::

:::stepContent{title="Tab 2"}
1. Sed sagittis eleifend rutrum
2. Donec vitae suscipit est
3. Nulla tempor lobortis orci
:::
::::
 * Uses the Directives plugin to import/export mdast
 * containerDirective because tabs can contain multiple children
 * NestedLexicalEditor ContainerDirective because tabs can contain multiple blocks 
 */
export const StepsDirectiveDescriptor: DirectiveDescriptor<StepDirectiveNode> = {
  name: 'steps',
  type: 'containerDirective',
  testNode(node) {
    return node.name === 'steps';
  },
  attributes: ['style'],
  hasChildren: true,
  Editor: StepsEditor
};
