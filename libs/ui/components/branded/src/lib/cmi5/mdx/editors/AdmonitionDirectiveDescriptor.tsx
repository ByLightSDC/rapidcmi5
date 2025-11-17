import { DirectiveDescriptor } from '@mdxeditor/editor';

import { ContainerDirective } from 'mdast-util-directive';

import { AdmonitionTypes } from '@rangeos-nx/types/cmi5';
import { AdmonitionEditor } from './AdmonitionEditor';

/**
 * 
 * Mdx Editor uses mdast-util-directive to convert directives back and forth between markdown text and MDAST tree
 * 
 * Examples
 * 
:::tip[Title]
Hello
:::
  
:::tip[Title]{collapse=open}
Hello2
:::
  
:::tip{collapse=hidden}
Hello2
:::
 */

// export type AdmonitionKind = (typeof ADMONITION_TYPES)[number];

/**
 * MDX Admonition Node
 */
export interface AdmonitionDirectiveNode extends ContainerDirective {
  name: 'admonition';
  attributes: { collapsed: string; title: string };
}

/**
 * MDX Admonition Config
 */
export const AdmonitionDirectiveDescriptor: DirectiveDescriptor = {
  name: 'admonition',
  testNode(node) {
    return AdmonitionTypes.includes(node.name);
  },
  // set some attribute names to have the editor display a property editor popup.
  attributes: ['collapse'],
  // used by the generic editor to determine whether or not to render a nested editor.
  hasChildren: true,
  Editor: AdmonitionEditor,
};
