import * as Mdast from 'mdast';
import { MdastImportVisitor } from '@mdxeditor/editor';
import { $createImageNode } from './ImageNode';
import { MdxJsxTextElement, MdxJsxFlowElement } from 'mdast-util-mdx';
import { $createParagraphNode, RootNode } from 'lexical';

//![alt text](url "title")
export const MdastImageVisitor: MdastImportVisitor<Mdast.Image> = {
  testNode: 'image',
  visitNode({ mdastNode, actions }) {
    actions.addAndStepInto(
      $createImageNode({
        src: mdastNode.url,
        altText: mdastNode.alt ?? '',
        title: mdastNode.title ?? '',
        // Note: Basic markdown images don't have data-image-id, they'll get a new GUID
      }),
    );
  },
};

// might be needed to ensure <img from this Mdast.Html check also gets  visited in MdastJsxImageVisitor below
// i am not sure why, but I would like to understand
export const MdastHtmlImageVisitor: MdastImportVisitor<Mdast.Html> = {
  testNode: (node: Mdast.Nodes): node is Mdast.Html => {
    if (node.type !== 'html') return false;
    //When will this happen?
    return node.value.trim().startsWith('<img');
  },
  visitNode({ mdastNode, lexicalParent }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = mdastNode.value;
    const img = wrapper.querySelector('img');

    if (!img) {
      throw new Error('Invalid HTML image');
    }

    const src = img.src;
    const altText = img.alt;
    const title = img.title;
    const width = img.width;
    const height = img.height;
    const id = img.id;

    const image = $createImageNode({
      src: src || '',
      altText,
      title,
      width,
      height,
      id,
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(image);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(image);
    }
  },
};

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

//<img <a href
export const MdastJsxImageVisitor: MdastImportVisitor<
  MdxJsxTextElement | MdxJsxFlowElement
> = {
  testNode: (node) => {
    return (
      (node.type === 'mdxJsxTextElement' ||
        node.type === 'mdxJsxFlowElement') &&
      (node.name === 'img' || node.name === 'a')
    );
  },
  visitNode({ mdastNode, lexicalParent }) {
    let imageNode: MdxJsxFlowElement | MdxJsxTextElement = mdastNode;
    let href = undefined;
    if (mdastNode.name === 'a') {
      if (
        mdastNode.children.length === 1 &&
        mdastNode.children[0].type === 'mdxJsxFlowElement'
      ) {
        if (mdastNode.children[0].name === 'img') {
          imageNode = mdastNode.children[0]; // as MdxJsxFlowElement;
          href = getAttributeValue(mdastNode, 'href');
        }
      }
    }

    const src = getAttributeValue(imageNode, 'src');
    if (!src) {
      return;
    }

    const altText = getAttributeValue(imageNode, 'alt') ?? '';
    const title = getAttributeValue(imageNode, 'title');
    const height = getAttributeValue(imageNode, 'height');
    const width = getAttributeValue(imageNode, 'width');
    const id = getAttributeValue(imageNode, 'id');
    if (!href) {
      //if not found in a parent <a then look here
      href = getAttributeValue(imageNode, 'href');
    }

    const rest = imageNode.attributes.filter((a) => {
      return (
        a.type === 'mdxJsxAttribute' &&
        ![
          'src',
          'alt',
          'title',
          'height',
          'width',
          'href',
          'id',
        ].includes(a.name)
      );
    });

    const image = $createImageNode({
      src,
      altText,
      title,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      rest,
      href,
      id, 
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(image);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(image);
    }
  },
};

// [![alt](src)](href)
// <a href="http://www.google.com"><img width="282" height="347" alt="puppy" src="./Assets/Images/scenario_designer.png"/></a>
//      but does not test true
export const MdastLinkImageVisitor: MdastImportVisitor<Mdast.Link> = {
  testNode: (node) => {
    return (
      node.type === 'link' &&
      node.children.length === 1 &&
      node.children[0].type === 'image'
    );
  },
  visitNode({ mdastNode, lexicalParent, actions }) {
    const image = mdastNode.children[0] as Mdast.Image;
    const imageNode = $createImageNode({
      src: image.url,
      altText: image.alt ?? '',
      title: image.title ?? '',
      href: mdastNode.url,
      // Note: Markdown linked images don't have data-image-id, they'll get a new GUID
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(imageNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(imageNode);
    }
  },
};

// Add this for complex linked images: <a href="..."><img ... /></a>
export const MdastHtmlLinkedImageVisitor: MdastImportVisitor<Mdast.Html> = {
  testNode: (node: Mdast.Nodes): node is Mdast.Html => {
    if (node.type !== 'html') return false;
    const value = node.value.trim();
    return value.startsWith('<a') && value.includes('<img');
  },
  visitNode({ mdastNode, lexicalParent }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = mdastNode.value;

    const a = wrapper.querySelector('a');
    if (!a) return;

    const img = a.querySelector('img');
    if (!img) return;

    const href = a.getAttribute('href') ?? '';
    const src = img.src;
    const altText = img.alt ?? '';
    const title = img.title ?? '';
    const width = img.width || undefined;
    const height = img.height || undefined;
    const id = img.getAttribute('id') || undefined; 

    // Collect other img attributes as 'rest' (excluding data-image-id)
    const rest = Array.from(img.attributes)
      .filter(
        (attr) =>
          !['src', 'alt', 'title', 'width', 'height', 'id'].includes(
            attr.name,
          ),
      )
      .map((attr) => ({
        type: 'mdxJsxAttribute' as const,
        name: attr.name,
        value: attr.value,
      }));

    const imageNode = $createImageNode({
      src: src || '',
      altText,
      title,
      width,
      height,
      rest,
      href,
      id, // ✅ Pass id to preserve GUID
    });

    if (lexicalParent.getType() === 'root') {
      const paragraph = $createParagraphNode();
      paragraph.append(imageNode);
      (lexicalParent as RootNode).append(paragraph);
    } else {
      (lexicalParent as RootNode).append(imageNode);
    }
  },
};
