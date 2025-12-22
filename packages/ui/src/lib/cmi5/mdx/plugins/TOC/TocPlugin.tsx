
import type {JSX} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { HeadingTagType} from '@lexical/rich-text';

import {$getNextRightPreorderNode} from '@lexical/utils';

import {
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  ElementNode,
  LexicalEditor,
  NodeKey,
  NodeMutation,
  TextNode,
} from 'lexical';
import {useEffect, useState} from 'react';
import { $isTOCHeadingNode, TOCHeadingNode } from './TocHeading';

export type TableOfContentsEntry = [
  key: NodeKey,
  text: string,
  tag: HeadingTagType,
  id: string
];

function toEntry(heading: TOCHeadingNode): TableOfContentsEntry {
  return [heading.getKey(), heading.getTextContent(), heading.getTag(), heading.getId()];
}

function $insertHeadingIntoTableOfContents(
  prevHeading: TOCHeadingNode | null,
  newHeading: TOCHeadingNode | null,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  if (newHeading === null) {
    return currentTableOfContents;
  }
  const newEntry: TableOfContentsEntry = toEntry(newHeading);
  let newTableOfContents: Array<TableOfContentsEntry> = [];
  if (prevHeading === null) {
    // check if key already exists
    if (
      currentTableOfContents.length > 0 &&
      currentTableOfContents[0][0] === newHeading.__key
    ) {
      return currentTableOfContents;
    }
    newTableOfContents = [newEntry, ...currentTableOfContents];
  } else {
    for (let i = 0; i < currentTableOfContents.length; i++) {
      const key = currentTableOfContents[i][0];
      newTableOfContents.push(currentTableOfContents[i]);
      if (key === prevHeading.getKey() && key !== newHeading.getKey()) {
        // check if key already exists
        if (
          i + 1 < currentTableOfContents.length &&
          currentTableOfContents[i + 1][0] === newHeading.__key
        ) {
          return currentTableOfContents;
        }
        newTableOfContents.push(newEntry);
      }
    }
  }
  return newTableOfContents;
}

function $deleteHeadingFromTableOfContents(
  key: NodeKey,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents = [];
  for (const heading of currentTableOfContents) {
    if (heading[0] !== key) {
      newTableOfContents.push(heading);
    }
  }
  return newTableOfContents;
}

function $updateHeadingInTableOfContents(
  heading: TOCHeadingNode,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents: Array<TableOfContentsEntry> = [];
  for (const oldHeading of currentTableOfContents) {
    if (oldHeading[0] === heading.getKey()) {
      newTableOfContents.push(toEntry(heading));
    } else {
      newTableOfContents.push(oldHeading);
    }
  }
  return newTableOfContents;
}

/**
 * Returns the updated table of contents, placing the given `heading` before the given `prevHeading`. If `prevHeading`
 * is undefined, `heading` is placed at the start of table of contents
 */
function $updateHeadingPosition(
  prevHeading: TOCHeadingNode | null,
  heading: TOCHeadingNode,
  currentTableOfContents: Array<TableOfContentsEntry>,
): Array<TableOfContentsEntry> {
  const newTableOfContents: Array<TableOfContentsEntry> = [];
  const newEntry: TableOfContentsEntry = toEntry(heading);

  if (!prevHeading) {
    newTableOfContents.push(newEntry);
  }
  for (const oldHeading of currentTableOfContents) {
    if (oldHeading[0] === heading.getKey()) {
      continue;
    }
    newTableOfContents.push(oldHeading);
    if (prevHeading && oldHeading[0] === prevHeading.getKey()) {
      newTableOfContents.push(newEntry);
    }
  }

  return newTableOfContents;
}

function $getPreviousHeading(node: TOCHeadingNode): TOCHeadingNode | null {
  let prevHeading = $getNextRightPreorderNode(node);
  while (prevHeading !== null && !$isTOCHeadingNode(prevHeading)) {
    prevHeading = $getNextRightPreorderNode(prevHeading);
  }
  return prevHeading;
}

type Props = {
  children: (
    values: Array<TableOfContentsEntry>,
    editor: LexicalEditor,
  ) => JSX.Element;
};

/**
 * This plugin is based off of a Lexical plugin built around the lexical Heading Node.
 * This plugin instead uses the TOCHeadingNode which allows us to have anchor links in page.
 * The format is nearly the same despite changing the types.
 * This plugin does not change any nodes, it simply keeps live track of all headings and generates a list 
 * of headings in order with their key, text, header tag, and ID (for allowing us to use anchor tags)
 */
export function TableOfContentsPlugin({children}: Props): JSX.Element {
  const [tableOfContents, setTableOfContents] = useState<
    Array<TableOfContentsEntry>
  >([]);
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    // Set table of contents initial state
    let currentTableOfContents: Array<TableOfContentsEntry> = [];
    editor.getEditorState().read(() => {
      const updateCurrentTableOfContents = (node: ElementNode) => {
        for (const child of node.getChildren()) {
          if ($isTOCHeadingNode(child)) {
            currentTableOfContents.push([
              child.getKey(),
              child.getTextContent(),
              child.getTag(),
              child.getId()
            ]);
          } else if ($isElementNode(child)) {
            updateCurrentTableOfContents(child);
          }
        }
      };

      updateCurrentTableOfContents($getRoot());
      setTableOfContents(currentTableOfContents);
    });

    const removeRootUpdateListener = editor.registerUpdateListener(
      ({editorState, dirtyElements}) => {
        editorState.read(() => {
          const updateChildHeadings = (node: ElementNode) => {
            for (const child of node.getChildren()) {
              if ($isTOCHeadingNode(child)) {
                const prevHeading = $getPreviousHeading(child);
                currentTableOfContents = $updateHeadingPosition(
                  prevHeading,
                  child,
                  currentTableOfContents,
                );
                setTableOfContents(currentTableOfContents);
              } else if ($isElementNode(child)) {
                updateChildHeadings(child);
              }
            }
          };

          // If a node is changes, all child heading positions need to be updated
          $getRoot()
            .getChildren()
            .forEach((node) => {
              if ($isElementNode(node) && dirtyElements.get(node.__key)) {
                updateChildHeadings(node);
              }
            });
        });
      },
    );

    // Listen to updates to heading mutations and update state
    const removeHeaderMutationListener = editor.registerMutationListener(
      TOCHeadingNode,
      (mutatedNodes: Map<string, NodeMutation>) => {
        editor.getEditorState().read(() => {
          for (const [nodeKey, mutation] of mutatedNodes) {
            if (mutation === 'created') {
              const newHeading = $getNodeByKey<TOCHeadingNode>(nodeKey);
              if (newHeading !== null) {
                const prevHeading = $getPreviousHeading(newHeading);
                currentTableOfContents = $insertHeadingIntoTableOfContents(
                  prevHeading,
                  newHeading,
                  currentTableOfContents,
                );
              }
            } else if (mutation === 'destroyed') {
              currentTableOfContents = $deleteHeadingFromTableOfContents(
                nodeKey,
                currentTableOfContents,
              );
            } else if (mutation === 'updated') {
              const newHeading = $getNodeByKey<TOCHeadingNode>(nodeKey);
              if (newHeading !== null) {
                const prevHeading = $getPreviousHeading(newHeading);
                currentTableOfContents = $updateHeadingPosition(
                  prevHeading,
                  newHeading,
                  currentTableOfContents,
                );
              }
            }
          }
          setTableOfContents(currentTableOfContents);
        });
      },
      // Initialization is handled separately
      {skipInitialization: true},
    );

    // Listen to text node mutation updates
    const removeTextNodeMutationListener = editor.registerMutationListener(
      TextNode,
      (mutatedNodes: Map<string, NodeMutation>) => {
        editor.getEditorState().read(() => {
          for (const [nodeKey, mutation] of mutatedNodes) {
            if (mutation === 'updated') {
              const currNode = $getNodeByKey(nodeKey);
              if (currNode !== null) {
                const parentNode = currNode.getParentOrThrow();
                if ($isTOCHeadingNode(parentNode)) {
                  currentTableOfContents = $updateHeadingInTableOfContents(
                    parentNode,
                    currentTableOfContents,
                  );
                  setTableOfContents(currentTableOfContents);
                }
              }
            }
          }
        });
      },
      // Initialization is handled separately
      {skipInitialization: true},
    );

    return () => {
      removeHeaderMutationListener();
      removeTextNodeMutationListener();
      removeRootUpdateListener();
    };
  }, [editor]);

  return children(tableOfContents, editor);
}