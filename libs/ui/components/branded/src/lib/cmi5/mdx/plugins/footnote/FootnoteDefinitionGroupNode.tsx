import { DOMConversionMap, EditorConfig, ElementNode } from 'lexical';
import { SerializedFootnoteDefGroupNode } from './types';
import { $createFootnoteDefinitionGroupNode } from './methods';

/**
 * Lexical Node that represents a group of Footnote Definitions
 * @group FootnoteReference
 */
export class FootnoteDefinitionGroupNode extends ElementNode {
  static override getType(): string {
    return 'fnDefGroup';
  }

  static override clone(
    node: FootnoteDefinitionGroupNode,
  ): FootnoteDefinitionGroupNode {
    return new FootnoteDefinitionGroupNode(node.__key);
  }

  /**
   * Lexical view for a Footnote Group
   * @param _config
   * @returns
   */
  override createDOM(_config: EditorConfig): HTMLElement {
    const divEl = document.createElement('div');
    divEl.setAttribute('class', 'footnotes');
    divEl.setAttribute('role', 'doc-endnotes');

    const hrEl = document.createElement('hr');
    divEl.append(hrEl);

    return divEl;
  }

  /**
   * We don't need to update the dom when the node is changed
   * Nothing in the DOM changes for this container
   * @returns
   */
  override updateDOM(): false {
    return false;
  }

  /**
   * We don't support embedding footnote html in the markdown
   * @returns
   */
  static override importDOM(): DOMConversionMap | null {
    return {};
  }

  /**
   * Converts serialized json to Lexical node
   * @param serializedNode
   * @returns
   */
  static override importJSON(
    serializedNode: SerializedFootnoteDefGroupNode,
  ): FootnoteDefinitionGroupNode {
    return $createFootnoteDefinitionGroupNode();
  }

  /**
   * Exports serialized json from Lexical node
   * @returns
   */
  override exportJSON(): SerializedFootnoteDefGroupNode {
    return {
      ...super.exportJSON(),
      type: 'fnDefGroup',
      version: 1,
    };
  }
}
