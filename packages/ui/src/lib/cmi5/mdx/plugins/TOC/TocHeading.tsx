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
  ): ParagraphNode | HeadingNode {
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

  // bug/CCUI-2621-HeaderTOC
  // when pressing backspace at the start of a heading (or at "R"), Lexical calls collapseAtStart() on TOCHeadingNode.
  // Since TOCHeadingNode extends HeadingNode, it inherits the parent's collapseAtStart(), which tries to create a HeadingNode using $createHeadingNode.
  // However, only TOCHeadingNode is registered in the editor, not the base HeadingNode, causing the error.
  // This override ensures that the correct node type is used when collapsing at the start of a heading.
  override collapseAtStart(): true {
    const previousSibling = this.getPreviousSibling();
    if ($isTOCHeadingNode(previousSibling)) {
      // Merge with previous heading - append children to previous sibling
      previousSibling.append(...this.getChildren());
      this.remove();
      return true;
    }
    // If empty, convert to paragraph
    if (this.isEmpty()) {
      const paragraph = $createParagraphNode();
      this.replace(paragraph);
      return true;
    }
    // For non-empty headings at start with no previous heading sibling,
    // convert to paragraph to prevent parent from trying to create unregistered HeadingNode
    // This handles the case where backspace at start would trigger parent collapse logic
    const paragraph = $createParagraphNode();
    paragraph.append(...this.getChildren());
    this.replace(paragraph);
    return true;
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
