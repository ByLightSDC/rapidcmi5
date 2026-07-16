import {
  $createGenericHTMLNode,
  isMdastHTMLNode,
  MdastImportVisitor,
  MdastHTMLNode,
} from '@mdxeditor/editor';

/**
 * Imports a generic HTML element (e.g. `<span lang="fr">`) from the markdown
 * source into a GenericHTMLNode so it renders and round-trips in the editor.
 *
 * Mirrors MDXEditor's internal `MdastHTMLVisitor` (which is not exported):
 * a `<span>` whose ONLY attribute is `style` is collapsed onto a TextNode via
 * `addStyle` (this is how the existing text-color feature round-trips); any
 * other HTML element or attribute becomes a GenericHTMLNode that preserves all
 * attributes.
 *
 * RC5's `htmlPlugin` previously registered only the `<iframe>` import visitor,
 * so a raw `<span lang="…">` in the source had no importer. The iframe visitor
 * keeps its higher priority so it still wins for iframes; this handles the rest
 * at a lower priority.
 */
export const MdastGenericHtmlVisitor: MdastImportVisitor<MdastHTMLNode> = {
  testNode: isMdastHTMLNode,
  visitNode({ mdastNode, actions, lexicalParent }) {
    if (
      mdastNode.name === 'span' &&
      mdastNode.attributes.length === 1 &&
      mdastNode.attributes[0].type === 'mdxJsxAttribute' &&
      mdastNode.attributes[0].name === 'style'
    ) {
      actions.addStyle(mdastNode.attributes[0].value as string, mdastNode);
      actions.visitChildren(mdastNode, lexicalParent);
    } else {
      // GenericHTMLNode only carries plain name="value" attributes; drop any
      // JSX expression/spread attributes (not expressible in raw HTML anyway).
      const attributes = mdastNode.attributes.filter(
        (attr) => attr.type === 'mdxJsxAttribute',
      );
      actions.addAndStepInto(
        $createGenericHTMLNode(mdastNode.name, mdastNode.type, attributes),
      );
    }
  },
  priority: -100,
};
