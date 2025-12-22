import * as Mdast from 'mdast';
import { LexicalExportVisitor } from '@mdxeditor/editor';
import { VideoNode, $isVideoNode } from './VideoNode';

/**
 * Exports videos as HTML <video /> elements
 */
export const LexicalVideoVisitor: LexicalExportVisitor<VideoNode, Mdast.Html> =
  {
    testLexicalNode: $isVideoNode,
    visitLexicalNode({ mdastParent, lexicalNode, actions }) {
      const video = document.createElement('video');

      // Set src first - this is the most important attribute
      video.src = lexicalNode.getSrc();
      video.setAttribute('controls', 'true');

      if (lexicalNode.getHeight() !== 'inherit') {
        video.height = lexicalNode.getHeight() as number;
      }
      if (lexicalNode.getWidth() !== 'inherit') {
        video.width = lexicalNode.getWidth() as number;
      }

      if (lexicalNode.getTitle()) {
        video.title = lexicalNode.getTitle()!;
      }

      for (const attr of lexicalNode.getRest()) {
        if (attr.type === 'mdxJsxAttribute') {
          if (typeof attr.value === 'string') {
            video.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Now outerHTML will include all attributes properly
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: video.outerHTML,
      });
    },
  };
