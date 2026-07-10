import * as Mdast from 'mdast';
import { LexicalExportVisitor } from '@mdxeditor/editor';
import { AudioNode, $isAudioNode } from './AudioNode';

/**
 * Exports audio as HTML <audio /> elements
 */
export const LexicalAudioVisitor: LexicalExportVisitor<AudioNode, Mdast.Html> =
  {
    testLexicalNode: $isAudioNode,
    visitLexicalNode({ mdastParent, lexicalNode, actions }) {
      const audio = document.createElement('audio');
      const id = lexicalNode.getId(); // ✅ Get id for persistence

      // ❌ DO NOT set audio.src directly - it resolves blob URLs!
      // audio.src = lexicalNode.getSrc();

      // Use setAttribute to preserve the original path
      const src = lexicalNode.getSrc();
      audio.setAttribute('src', src);
      audio.setAttribute('controls', 'true');
      audio.setAttribute('data-audio-id', id); // ✅ Add id for persistence

      if (lexicalNode.getTitle()) {
        audio.setAttribute('title', lexicalNode.getTitle()!);
      }

      if (lexicalNode.getAutoplay()) {
        audio.setAttribute('autoplay', 'true');
        audio.setAttribute('muted', 'true');
      }

      for (const attr of lexicalNode.getRest()) {
        if (attr.type === 'mdxJsxAttribute') {
          if (typeof attr.value === 'string') {
            audio.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Transcript is a caption file (`.vtt` or `.txt`) referenced by
      // data-caption-src; its content decides timed-vs-plain at render time.
      const captionSrc = lexicalNode.getCaptionSrc();
      if (captionSrc) {
        audio.setAttribute('data-caption-src', captionSrc);
      }

      // Back-compat: legacy content authored with inline text (no file) is
      // round-tripped so re-saving never drops an existing transcript. The
      // editor no longer produces this attribute for new content.
      const captionText = lexicalNode.getCaptionText();
      if (!captionSrc && captionText) {
        audio.setAttribute('data-caption-text', captionText);
      }

      actions.appendToParent(mdastParent, {
        type: 'html',
        value: audio.outerHTML,
      });
    },
  };
