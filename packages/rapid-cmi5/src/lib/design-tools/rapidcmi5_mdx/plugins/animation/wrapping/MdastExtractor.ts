/**
 * Phase 5.1: MDAST Extractor
 *
 * Converts Lexical nodes to MDAST (Markdown Abstract Syntax Tree) format.
 * This is the critical component that preserves structure when wrapping content.
 *
 * WHY THIS IS NEEDED:
 * - MDXEditor's export visitors work on the ENTIRE document
 * - We need to convert SELECTED nodes only (mid-edit, on-demand)
 * - We need MDAST fragments (not full document export)
 * - We need to do this WITHOUT triggering save/export
 */

import type * as Mdast from 'mdast';
import type { LexicalNode } from 'lexical';
import { debugMdast } from '../utils/debug';
import { $isDirectiveNode } from '@mdxeditor/editor';
import {
  $isParagraphNode,
  $isTextNode,
  type ParagraphNode,
  type TextNode,
} from 'lexical';
import { $isHeadingNode, type HeadingNode } from '@lexical/rich-text';

// Import custom node types and type guards
// We'll adapt the conversion logic from existing export visitors
import type { SupportedMdastContent } from './types/Wrapping.types';

/**
 * Main MDAST Extractor class
 * Converts Lexical nodes → MDAST while preserving all structure
 */
export class MdastExtractor {
  /**
   * Extract MDAST from an array of Lexical nodes
   * This is the main entry point
   */
  static extractMdast(nodes: LexicalNode[]): Mdast.Content[] {
    const mdastNodes: Mdast.Content[] = [];

    debugMdast.log(
      '➡️ extractMdast input nodes:',
      nodes.map((n) => ({ key: n.getKey(), type: n.getType() })),
    );

    for (const node of nodes) {
      try {
        const mdast = this.convertNode(node);
        if (mdast) {
          mdastNodes.push(mdast);
          debugMdast.log(
            '✅ Converted node',
            node.getKey(),
            node.getType(),
            mdast,
          );
        }
      } catch (error) {
        console.warn(`Failed to convert node type: ${node.getType()}`, error);
        // Continue with other nodes
      }
    }

    return mdastNodes;
  }

  /**
   * Convert a single Lexical node to MDAST
   * Routes to appropriate converter based on node type
   */
  private static convertNode(node: LexicalNode): Mdast.Content | null {
    const type = node.getType();

    // Use Lexical's type guards to safely convert
    if ($isParagraphNode(node)) {
      return this.convertParagraph(node);
    }

    if ($isHeadingNode(node)) {
      return this.convertHeading(node);
    }

    if ($isTextNode(node)) {
      return this.convertText(node);
    }

    // Directives (block or inline) - preserve existing mdast
    if ($isDirectiveNode(node as any)) {
      try {
        const mdastNode = (node as any).getMdastNode?.();
        if (mdastNode) {
          return mdastNode as Mdast.Content;
        }
      } catch (e) {
        console.warn('Failed to convert directive node', e);
      }
    }

    // For custom nodes, check type string
    switch (type) {
      case 'toc-heading':
        // TOCHeadingNode is a custom heading node with an ID
        // Treat it like a regular heading
        return this.convertHeading(node as any);

      case 'image':
        return this.convertImage(node);

      case 'video':
        return this.convertVideo(node);

      case 'audio':
        return this.convertAudio(node);

      default:
        console.warn(`Unsupported node type for MDAST extraction: ${type}`);
        return null;
    }
  }

  /**
   * Convert paragraph node to MDAST
   * Adapted from existing paragraph export logic
   */
  private static convertParagraph(node: ParagraphNode): Mdast.Paragraph {
    const children = node.getChildren();
    const mdastChildren = this.convertChildren(children);

    return {
      type: 'paragraph',
      children: mdastChildren as Mdast.PhrasingContent[],
    };
  }

  /**
   * Convert heading node to MDAST
   * Adapted from existing heading export logic
   */
  private static convertHeading(node: HeadingNode): Mdast.Heading {
    const tag = node.getTag(); // 'h1', 'h2', etc.
    const depth = parseInt(tag.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6;
    const children = node.getChildren();
    const mdastChildren = this.convertChildren(children);

    return {
      type: 'heading',
      depth,
      children: mdastChildren as Mdast.PhrasingContent[],
    };
  }

  /**
   * Convert text node to MDAST (handles formatting)
   * Adapted from existing text export logic
   */
  private static convertText(node: TextNode): Mdast.PhrasingContent {
    const text = node.getTextContent();

    // Check formatting flags
    const isBold = node.hasFormat('bold');
    const isItalic = node.hasFormat('italic');
    const isCode = node.hasFormat('code');
    const isUnderline = node.hasFormat('underline');
    const isStrikethrough = node.hasFormat('strikethrough');

    // Base text node
    const textNode: Mdast.Text = {
      type: 'text',
      value: text,
    };

    // Handle code formatting
    if (isCode) {
      return {
        type: 'inlineCode',
        value: text,
      };
    }

    // Handle bold + italic (nested)
    if (isBold && isItalic) {
      return {
        type: 'strong',
        children: [
          {
            type: 'emphasis',
            children: [textNode],
          },
        ],
      };
    }

    // Handle just bold
    if (isBold) {
      return {
        type: 'strong',
        children: [textNode],
      };
    }

    // Handle just italic
    if (isItalic) {
      return {
        type: 'emphasis',
        children: [textNode],
      };
    }

    // Note: underline and strikethrough need HTML in markdown
    // For MVP, we'll just return plain text (can enhance in Phase 5.3)
    if (isUnderline || isStrikethrough) {
      // Could wrap in HTML tags if needed
      // For now, just preserve as text
    }

    return textNode;
  }

  /**
   * Convert image node to MDAST
   * CRITICAL: This preserves image syntax (Phase 2 lost this!)
   *
   * Adapted from LexicalImageVisitor.ts
   */
  private static convertImage(node: any): Mdast.Image | Mdast.HTML {
    const src = node.getSrc?.();
    const alt = node.getAltText?.();
    const title = node.getTitle?.();
    const href = node.getHref?.();
    const width = node.getWidth?.();
    const height = node.getHeight?.();
    const id = node.getId?.(); // Persistent ID

    // Simple case: Just an image (no complex attributes)
    if (!node.shouldBeSerializedAsElement?.()) {
      const imageMdast: Mdast.Image = {
        type: 'image',
        url: src || '',
        alt: alt || '',
      };

      if (title) {
        imageMdast.title = title;
      }

      // If it's a linked image, wrap in link
      if (href) {
        return {
          type: 'link',
          url: href,
          children: [imageMdast],
        } as any; // Link containing image
      }

      return imageMdast;
    }

    // Complex case: Image with width/height/custom attributes
    // Build HTML safely to avoid malformed `"/ src="...` sequences
    const attrs: string[] = [];
    if (src) attrs.push(`src="${src}"`);
    attrs.push(`alt="${alt || ''}"`);
    if (title) attrs.push(`title="${title}"`);
    if (typeof width === 'number') attrs.push(`width="${width}"`);
    if (typeof height === 'number') attrs.push(`height="${height}"`);
    if (id) attrs.push(`data-image-id="${id}"`);

    const imgHtml = `<img ${attrs.join(' ')} />`;
    const finalHtml = href
      ? `<a href="${href}" target="_blank">${imgHtml}</a>`
      : imgHtml;

    return {
      type: 'html',
      value: finalHtml,
    };
  }

  /**
   * Convert video node to MDAST (as HTML)
   * Videos are stored as HTML in MDAST
   */
  private static convertVideo(node: any): Mdast.HTML {
    const src = node.getSrc?.();
    const poster = node.getPoster?.();
    const width = node.getWidth?.();
    const height = node.getHeight?.();

    let html = '<video';

    if (src) {
      html += ` src="${src}"`;
    }
    if (poster) {
      html += ` poster="${poster}"`;
    }
    if (width) {
      html += ` width="${width}"`;
    }
    if (height) {
      html += ` height="${height}"`;
    }

    html += ' controls></video>';

    return {
      type: 'html',
      value: html,
    };
  }

  /**
   * Convert audio node to MDAST (as HTML)
   * Audio is stored as HTML in MDAST
   */
  private static convertAudio(node: any): Mdast.HTML {
    const src = node.getSrc?.();

    const html = src
      ? `<audio src="${src}" controls></audio>`
      : '<audio controls></audio>';

    return {
      type: 'html',
      value: html,
    };
  }

  /**
   * Convert array of child nodes to MDAST
   * Recursively processes children
   */
  private static convertChildren(children: LexicalNode[]): Mdast.Content[] {
    const mdastChildren: Mdast.Content[] = [];

    for (const child of children) {
      const mdast = this.convertNode(child);
      if (mdast) {
        mdastChildren.push(mdast);
      }
    }

    return mdastChildren;
  }
}
