import { $createParagraphNode, ElementNode, RootNode } from 'lexical'
import { $createLexicalJsxNode } from './LexicalJsxNode'
import { MdastImportVisitor } from '../../util/importMarkdownToLexical'
import {
  MdxJsxFlowElement,
  MdxJsxTextElement
} from 'mdast-util-mdx-jsx'

export const MdastMdxJsxElementVisitor: MdastImportVisitor<MdxJsxTextElement | MdxJsxFlowElement> = {
  testNode: (node, { jsxComponentDescriptors }) => {
    if (node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') {
      const descriptor =
        jsxComponentDescriptors.find((descriptor) => descriptor.name === node.name) ??
        jsxComponentDescriptors.find((descriptor) => descriptor.name === '*')
      return descriptor !== undefined
    }
    return false
  },
  visitNode({ lexicalParent, mdastNode, descriptors: { jsxComponentDescriptors }, metaData }) {
    const descriptor =
      jsxComponentDescriptors.find((descriptor) => descriptor.name === mdastNode.name) ??
      jsxComponentDescriptors.find((descriptor) => descriptor.name === '*')

    // the parser does not know that the node should be treated as an inline element, but our descriptor does.
    if (descriptor?.kind === 'text' && mdastNode.type === 'mdxJsxFlowElement') {
      const patchedNode = { ...mdastNode, type: 'mdxJsxTextElement' } as MdxJsxTextElement
      const paragraph = $createParagraphNode()
      paragraph.append($createLexicalJsxNode(patchedNode, mdastNode.name ? metaData.importDeclarations[mdastNode.name] : undefined))
      ;(lexicalParent as RootNode).append(paragraph)
    } else {
      ;(lexicalParent as ElementNode).append(
        $createLexicalJsxNode(mdastNode, mdastNode.name ? metaData.importDeclarations[mdastNode.name] : undefined)
      )
    }
  },
  priority: -200
}
