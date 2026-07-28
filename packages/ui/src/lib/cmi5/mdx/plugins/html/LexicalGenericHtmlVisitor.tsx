import { GenericHTMLNode, LexicalExportVisitor } from '@mdxeditor/editor';
import { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { $isGenericHTMLNode } from '@mdxeditor/editor';

/**
 * Exports a generic HTML element node (e.g. `<span lang="fr">`) back to an
 * mdast JSX element so it round-trips to raw HTML in the markdown source.
 *
 * MDXEditor ships an equivalent `LexicalGenericHTMLVisitor` internally, but it
 * is not exported from the package, and RC5's `htmlPlugin` only registers a
 * visitor for `<iframe>`. Without this, any other GenericHTMLNode (spans with
 * `lang`, `class`, arbitrary attributes) matches no export visitor and
 * `exportMarkdownFromLexical` throws — silently leaving the markdown source
 * stale. The iframe visitor keeps priority 1000 so it still wins for iframes;
 * this runs at a lower priority for everything else.
 */
export const LexicalGenericHtmlVisitor: LexicalExportVisitor<
  GenericHTMLNode,
  MdxJsxFlowElement | MdxJsxTextElement
> = {
  testLexicalNode: $isGenericHTMLNode,
  visitLexicalNode({ actions, lexicalNode }) {
    actions.addAndStepInto(lexicalNode.getNodeType(), {
      name: lexicalNode.getTag(),
      attributes: lexicalNode.getAttributes(),
    });
  },
  priority: -100,
};
