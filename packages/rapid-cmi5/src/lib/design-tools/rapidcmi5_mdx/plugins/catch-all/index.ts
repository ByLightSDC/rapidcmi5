import * as Mdast from 'mdast';

import { MdastImportVisitor } from '@mdxeditor/editor';

import { realmPlugin, addImportVisitor$ } from '@mdxeditor/editor';


/**
 * A plugin that allows you to debug the syntax tree when you are creating a custom plugin
 * @group Debug
 * note that nothing will render because it is not creating lexical nodes
 * increase priority if you are debugging with other plugins
 */
export const CatchAllVisitor: MdastImportVisitor<
  Mdast.Root | Mdast.RootContent | Mdast.Nodes
> = {
  testNode: () => true,
  visitNode: ({ lexicalParent, mdastNode, actions }) => {
    console.log('catch all, likely error', { mdastNode });
    if ('children' in mdastNode && Array.isArray(mdastNode.children)) {
      return actions.visitChildren(mdastNode, lexicalParent);
    }
  },
  priority: -500,
};

/**
 * A plugin that allows you to debug the syntax tree when you are creating a custom plugin
 * @group Debug
 * note that nothing will render because it is not creating lexical nodes
 * you can add this if you like (line 20)
 */
export const RootVisitor: MdastImportVisitor<Mdast.Root> = {
  testNode: () => true,
  visitNode: ({ mdastNode, actions }) => {
    console.log('catch root', { mdastNode });
    // add based on type here
    // actions.addAndStepInto($createTextNode())
  },
  priority: -500,
};

export const catchAllPlugin = realmPlugin({
  init(realm) {
    realm.pub(addImportVisitor$, CatchAllVisitor);
  },
});
