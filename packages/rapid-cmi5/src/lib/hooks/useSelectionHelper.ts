import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  BaseSelection,
  RangeSelection,
} from 'lexical';

export function useSelectionHelper() {
  // TOCHeadingNode.insertAfter calls getParentOrThrow(), which throws when
  // Lexical's insertNodes tries to splice a block next to a heading node.
  // If the anchor's top-level block is not a plain paragraph, insert a
  // paragraph after it and move the selection there first, so the accordion
  // lands in the right place without triggering the heading's insertAfter.
  const getInsertSelection = (selection: RangeSelection) => {
    const anchorNode = selection.anchor.getNode();
    const topLevel = anchorNode.getTopLevelElement();
    if (topLevel && topLevel.getType() !== 'paragraph') {
      const paragraph = $createParagraphNode();
      topLevel.insertAfter(paragraph);
      paragraph.select();
      selection = $getSelection() as typeof selection;
    }
    return selection;
  };

  return { getInsertSelection };
}
