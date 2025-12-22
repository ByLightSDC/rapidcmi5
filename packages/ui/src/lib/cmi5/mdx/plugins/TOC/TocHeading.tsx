import { HeadingNode, HeadingTagType } from '@lexical/rich-text';
import {
  $applyNodeReplacement,
  $createParagraphNode,
  EditorConfig,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
  type NodeKey,
} from 'lexical';
import { addClassNamesToElement } from '@lexical/utils';

export class TOCHeadingNode extends HeadingNode {
  __id: string;

  constructor(tag: HeadingTagType, id: string, key?: NodeKey) {
    super(tag, key);
    this.__id = id;
  }

  // Add serialization support
  static override importJSON(serializedNode: any) {
    const node = new TOCHeadingNode(serializedNode.tag, serializedNode.id);
    return node;
  }

  override insertNewAfter(
    selection?: RangeSelection,
    restoreSelection?: boolean,
  ): ParagraphNode | TOCHeadingNode {
    const anchorOffet = selection ? selection.anchor.offset : 0;
    const lastDesc = this.getLastDescendant();
    const isAtEnd =
      !lastDesc ||
      (selection &&
        selection.anchor.key === lastDesc.getKey() &&
        anchorOffet === lastDesc.getTextContentSize());
    const newElement =
      isAtEnd || !selection
        ? $createParagraphNode()
        : $createTocHeadingNode(this.getTag(), this.getId());
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    if (anchorOffet === 0 && !this.isEmpty() && selection) {
      const paragraph = $createParagraphNode();
      paragraph.select();
      this.replace(paragraph, true);
    }
    return newElement;
  }

  override exportJSON() {
    return {
      ...super.exportJSON(),
      id: this.__id,
      type: 'toc-heading',
    };
  }

  getId(): string {
    return this.__id;
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const tag = this.__tag;
    const element = document.createElement(tag);
    const theme = config.theme;
    const classNames = theme.heading;
    if (classNames !== undefined) {
      const className = classNames[tag];
      addClassNamesToElement(element, className);
    }
    element.id = this.__id;
    return element;
  }
  // Required methods
  static override getType(): string {
    return 'toc-heading';
  }

  static override clone(node: TOCHeadingNode): TOCHeadingNode {
    return new TOCHeadingNode(node.getTag(), node.__id, node.__key);
  }
}

export function $createTocHeadingNode(
  headingTag: HeadingTagType = 'h1',
  id: string,
): TOCHeadingNode {
  return $applyNodeReplacement(new TOCHeadingNode(headingTag, id));
}

export function $isTOCHeadingNode(
  node: LexicalNode | null | undefined,
): node is TOCHeadingNode {
  return node instanceof TOCHeadingNode;
}
