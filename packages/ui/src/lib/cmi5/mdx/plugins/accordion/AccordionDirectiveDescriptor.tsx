import { DirectiveDescriptor } from '@mdxeditor/editor';
import { AccordionDirectiveNode } from './types';
import { AccordionEditor } from './AccordionEditor';

/**
 * Accordion plugin 
 * Example markdown
 *  
::::accordion

:::accordionContent{title="Accordion 1"}
Hello World
:::

:::accordionContent{title="Accordion 2"}
1. Sed sagittis eleifend rutrum
2. Donec vitae suscipit est
3. Nulla tempor lobortis orci
:::
::::
 * Uses the Directives plugin to import/export mdast
 * containerDirective because tabs can contain multiple children
 * NestedLexicalEditor ContainerDirective because tabs can contain multiple blocks 
 */
export const AccordionDirectiveDescriptor: DirectiveDescriptor<AccordionDirectiveNode> = {
  name: 'accordion',
  type: 'containerDirective',
  testNode(node) {
    return node.name === 'accordion';
  },
  attributes: ['color'],
  hasChildren: true,
  Editor: AccordionEditor
};
