import * as Mdast from 'mdast';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createAudioNode } from './AudioNode';
import { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx';
import { $createParagraphNode, RootNode } from 'lexical';

function getAttributeValue(
  node: MdxJsxTextElement | MdxJsxFlowElement,
  attributeName: string,
) {
  const attribute = node.attributes.find(
    (a) => a.type === 'mdxJsxAttribute' && a.name === attributeName,
  );
  if (!attribute) {
    return undefined;
  }
  return attribute.value as string | undefined;
}

export const MdastHtmlAudioVisitor: MdastImportVisitor<Mdast.Html> = {
  testNode: (node) => {
    return node.type === 'html' && node.value.trim().startsWith('<audio');
  },
  visitNode({ mdastNode, lexicalParent }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = mdastNode.value;
    const audio = wrapper.querySelector('audio');

    if (!audio) {
      throw new Error('Invalid HTML audio');
    }

    const src = audio.getAttribute('src') || audio.src;
    const title = audio.getAttribute('title') || audio.title;

    const audioNode = $createAudioNode({
      src: src || '',
      title,
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(audioNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(audioNode);
    }
  },
};

export const MdastJsxAudioVisitor: MdastImportVisitor<
  MdxJsxTextElement | MdxJsxFlowElement
> = {
  testNode: (node) => {
    return (
      (node.type === 'mdxJsxTextElement' ||
        node.type === 'mdxJsxFlowElement') &&
      node.name === 'audio'
    );
  },
  visitNode({ mdastNode, lexicalParent }) {
    const src = getAttributeValue(mdastNode, 'src');
    if (!src) {
      return;
    }

    const title = getAttributeValue(mdastNode, 'title');

    const rest = mdastNode.attributes.filter((a) => {
      return (
        a.type === 'mdxJsxAttribute' &&
        !['src', 'title', 'controls'].includes(a.name)
      );
    });

    const audioNode = $createAudioNode({
      src,
      title,
      rest,
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(audioNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(audioNode);
    }
  },
};
