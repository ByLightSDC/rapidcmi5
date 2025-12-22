import { Signal, insertDecoratorNode$, map } from '@mdxeditor/editor';
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  $setSelection,
  LexicalNode,
} from 'lexical';

import {
  FootnoteDefinitionAttributes,
  FootnoteReferenceAttributes,
} from './types';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';
import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';
import { FootnoteDefinitionGroupNode } from './FootnoteDefinitionGroupNode';

//#region Footnote Reference

/**
 * Creates a FootnoteRefinitionNode
 * @param {Partial<CreateMathNodeOptions>} options
 * @group Code Block
 */
export function $createFootnoteReferenceNode(
  options: Partial<FootnoteReferenceAttributes>,
): FootnoteReferenceNode {
  const {
    label = '',
    mdastNode = {
      type: 'footnoteReference',
      label: 'placeholder',
      identifier: 'placeholder',
    },
  } = options;
  return new FootnoteReferenceNode(mdastNode, label);
}

/**
 * Returns true if the given node is a FootnoteReferenceNode
 * @group Footnote
 */
export function $isFootnoteReferenceNode(
  node: LexicalNode | null | undefined,
): node is FootnoteReferenceNode {
  return node instanceof FootnoteReferenceNode;
}

//#endregion

//#region Footnote Definition

/**
 * A signal that inserts a new footnote reference and definition node with the published payload.
 * @group Footnote
 */
export const insertFootnoteDefinition$ = Signal<{
  label: string;
}>((r) => {
  r.link(
    r.pipe(
      insertFootnoteDefinition$,
      map((payload) => {
        return () => $createFootnoteDefinitionNode({ ...payload });
      }),
    ),
    insertDecoratorNode$,
  );
});

/**
 * Creates a FootnoteDefinitionNode
 * @param {Partial<FootnoteDefinitionAttributes>} options
 * @group Footnote
 */
export function $createFootnoteDefinitionNode(
  options: Partial<FootnoteDefinitionAttributes>,
): FootnoteDefinitionNode {
  const {
    label = '',
    mdastNode = {
      type: 'footnoteDefinition',
      label: 'placeholder',
      identifier: 'placeholder',
      children: [],
    },
  } = options;
  return new FootnoteDefinitionNode(mdastNode, label);
}

/**
 * Returns true if the given node is a FootnoteDefinitionNode
 * @group Footnote
 */
export function $isFootnoteDefinitionNode(
  node: LexicalNode | null | undefined,
): node is FootnoteDefinitionNode {
  return node instanceof FootnoteDefinitionNode;
}

//#endregion

//#region Footnote Definition Group

/**
 * Creates a FootnoteDefinitionGroupNode
 * @group Footnote
 */
export function $createFootnoteDefinitionGroupNode(): FootnoteDefinitionGroupNode {
  return new FootnoteDefinitionGroupNode();
}

/**
 * Returns true if the given node is a FootnoteDefinitionGroupNode
 * @group Footnote
 */
export function $isFootnoteDefinitionGroupNode(
  node: LexicalNode | null | undefined,
): node is FootnoteDefinitionGroupNode {
  return node instanceof FootnoteDefinitionGroupNode;
}

//#endregion
