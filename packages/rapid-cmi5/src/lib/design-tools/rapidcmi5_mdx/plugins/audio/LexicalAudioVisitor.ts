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

      // Now outerHTML will include all attributes properly (including data-audio-id and original src)
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: audio.outerHTML,
      });
    },
  };
