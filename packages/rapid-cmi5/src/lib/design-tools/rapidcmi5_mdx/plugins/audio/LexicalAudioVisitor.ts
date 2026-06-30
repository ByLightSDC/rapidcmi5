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

      // Transcript: either a timed VTT file (data-caption-src) or a block of
      // plain text (data-caption-text). Emit exactly one. `setAttribute`
      // handles escaping of quotes/newlines in the text value.
      const captionKind = lexicalNode.getCaptionKind();
      const captionText = lexicalNode.getCaptionText();
      const captionSrc = lexicalNode.getCaptionSrc();
      if (captionKind === 'text' && captionText) {
        audio.setAttribute('data-caption-kind', 'text');
        audio.setAttribute('data-caption-text', captionText);
      } else if (captionSrc) {
        // Default / 'vtt': preserve the existing data-caption-src contract.
        audio.setAttribute('data-caption-src', captionSrc);
      }

      actions.appendToParent(mdastParent, {
        type: 'html',
        value: audio.outerHTML,
      });
    },
  };
