import * as Mdast from 'mdast';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createVideoNode } from './VideoNode';
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

export const MdastHtmlVideoVisitor: MdastImportVisitor<Mdast.Html> = {
  testNode: (node) => {
    return node.type === 'html' && node.value.trim().startsWith('<video');
  },
  visitNode({ mdastNode, lexicalParent }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = mdastNode.value;
    const video = wrapper.querySelector('video');

    if (!video) {
      throw new Error('Invalid HTML video');
    }

    const src = video.src;
    const title = video.title;
    const width = video.width;
    const height = video.height;
    const videoId = video.getAttribute('data-video-id') || undefined; // ✅ Extract videoId from HTML

    const videoNode = $createVideoNode({
      src: src || '',
      title,
      width,
      height,
      videoId, // ✅ Pass videoId to preserve GUID
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(videoNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(videoNode);
    }
  },
};

export const MdastJsxVideoVisitor: MdastImportVisitor<
  MdxJsxTextElement | MdxJsxFlowElement
> = {
  testNode: (node) => {
    return (
      (node.type === 'mdxJsxTextElement' ||
        node.type === 'mdxJsxFlowElement') &&
      node.name === 'video'
    );
  },
  visitNode({ mdastNode, lexicalParent }) {
    const src = getAttributeValue(mdastNode, 'src');
    if (!src) {
      return;
    }

    const title = getAttributeValue(mdastNode, 'title');
    const height = getAttributeValue(mdastNode, 'height');
    const width = getAttributeValue(mdastNode, 'width');
    const videoId = getAttributeValue(mdastNode, 'data-video-id'); // ✅ Extract videoId

    const rest = mdastNode.attributes.filter((a) => {
      return (
        a.type === 'mdxJsxAttribute' &&
        ![
          'src',
          'title',
          'height',
          'width',
          'controls',
          'data-video-id',
        ].includes(a.name)
      );
    });

    const videoNode = $createVideoNode({
      src,
      title,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      rest,
      videoId, // ✅ Pass videoId to preserve GUID
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(videoNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(videoNode);
    }
  },
};
