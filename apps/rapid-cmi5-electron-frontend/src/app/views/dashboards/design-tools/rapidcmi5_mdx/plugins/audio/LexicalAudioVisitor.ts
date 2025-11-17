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

      // Set src first - this is the most important attribute
      audio.src = lexicalNode.getSrc();
      audio.setAttribute('controls', 'true');

      if (lexicalNode.getTitle()) {
        audio.title = lexicalNode.getTitle()!;
      }

      for (const attr of lexicalNode.getRest()) {
        if (attr.type === 'mdxJsxAttribute') {
          if (typeof attr.value === 'string') {
            audio.setAttribute(attr.name, attr.value);
          }
        }
      }

      // Now outerHTML will include all attributes properly
      actions.appendToParent(mdastParent, {
        type: 'html',
        value: audio.outerHTML,
      });
    },
  };
