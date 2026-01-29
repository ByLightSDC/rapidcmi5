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

      // ❌ DO NOT set video.src directly - it resolves blob URLs!
      // video.src = lexicalNode.getSrc();

      // Use setAttribute to preserve the original path
      const src = lexicalNode.getSrc();
      video.setAttribute('src', src);
      video.setAttribute('controls', 'true');

      // ✅ Add videoId for persistence (BEFORE other attributes)
      const videoId = lexicalNode.getVideoId();
      video.setAttribute('data-video-id', videoId);

      if (lexicalNode.getHeight() !== 'inherit') {
        video.setAttribute('height', String(lexicalNode.getHeight()));
      }
      if (lexicalNode.getWidth() !== 'inherit') {
        video.setAttribute('width', String(lexicalNode.getWidth()));
      }

      if (lexicalNode.getTitle()) {
        video.setAttribute('title', lexicalNode.getTitle()!);
      }

      for (const attr of lexicalNode.getRest()) {
        if (attr.type === 'mdxJsxAttribute') {
          if (typeof attr.value === 'string') {
            video.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Now outerHTML will include all attributes properly (including data-video-id and original src)
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: video.outerHTML,
      });
    },
  };
