import * as Mdast from 'mdast';
import { LexicalExportVisitor } from '@mdxeditor/editor';
import { ImageNode, $isImageNode } from './ImageNode';

/**
 * Replaces > with /> At the end of an html tag
 * because > is not suppported by MdxEditor
 * / starts and ends the regex pattern.
 * > matches the literal closing angle bracket
 *
 * @param outerHTML / starts and ends the regex pattern.
 * @param imgSource
 * @returns
 */
const getOuterImgHtml = (outerHTML: string, imgSource: string) => {
  if (outerHTML.indexOf('src=') >= 0) {
    return outerHTML.replace(/>$/, '/>');
  }
  return outerHTML.replace(/>$/, ` src="${imgSource}" />`);
};

export const LexicalImageVisitor: LexicalExportVisitor<
  ImageNode,
  Mdast.Image | Mdast.Html | Mdast.Link
> = {
  testLexicalNode: $isImageNode,
  visitLexicalNode({ mdastParent, lexicalNode, actions }) {
    const src = lexicalNode.getSrc();
    const alt = lexicalNode.getAltText();
    const title = lexicalNode.getTitle();
    const href = lexicalNode.getHref();
    const rest = lexicalNode.getRest();
    const width = lexicalNode.getWidth();
    const height = lexicalNode.getHeight();

    const imageMdast: Mdast.Image = {
      type: 'image',
      url: src,
      alt: alt,
      title: title ?? null,
    };

    if (href) {
      // Handle linked images
      if (!lexicalNode.shouldBeSerializedAsElement()) {
        // Simple case: Export as MDAST link with image child (renders as [![alt](src)](href))
        actions.appendToParent(mdastParent, {
          type: 'link',
          url: href,
          children: [imageMdast],
        });
      } else {
        // Complex case: Export as HTML <a><img ... /></a>
        const img = new Image();
        if (typeof width === 'number') {
          img.width = width;
        }
        if (typeof height === 'number') {
          img.height = height;
        }
        img.alt = alt;
        if (title) {
          img.title = title;
        }
        for (const attr of rest) {
          if (
            attr.type === 'mdxJsxAttribute' &&
            typeof attr.value === 'string'
          ) {
            img.setAttribute(attr.name, attr.value);
          }
        }
        img.src = src;

        const imgHtml = getOuterImgHtml(img.outerHTML, src);
        const linkedHtml = `<a href="${href}" target="_blank">${imgHtml}</a>`;
        actions.appendToParent(mdastParent, {
          type: 'html',
          value: linkedHtml,
        });
      }
    } else {
      // Handle unlinked images (existing logic, but using HTML for complex cases)
      if (!lexicalNode.shouldBeSerializedAsElement()) {
        actions.appendToParent(mdastParent, imageMdast);
      } else {
        // Complex unlinked: Export as HTML <img ... />
        const img = new Image();
        if (typeof width === 'number') {
          img.width = width;
        }
        if (typeof height === 'number') {
          img.height = height;
        }
        img.alt = alt;
        if (title) {
          img.title = title;
        }
        for (const attr of rest) {
          if (
            attr.type === 'mdxJsxAttribute' &&
            typeof attr.value === 'string'
          ) {
            img.setAttribute(attr.name, attr.value);
          }
        }

        img.src = src;
        const imgHtml = getOuterImgHtml(img.outerHTML, lexicalNode.getSrc());
        actions.appendToParent(mdastParent, {
          type: 'html',
          value: imgHtml,
        });
      }
    }
  },
};
