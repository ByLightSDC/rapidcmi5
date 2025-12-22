import * as Mdast from 'mdast';
import { VoidEmitter } from '@mdxeditor/editor';

import {
  EditorConfig,
  LexicalEditor,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import React from 'react';
import { FootnoteDefinitionNode } from './FootnoteDefinitionNode';
import { FootnoteReferenceNode } from './FootnoteReferenceNode';

//#region Footnote Definition Group

/**
 * A serialized representation of an {@link FootnoteReferenceNode}.
 * @group Footnote
 */
export type SerializedFootnoteDefGroupNode = SerializedElementNode;

//#endregion

//#region Footnote Definition

/**
 * @interface FootnoteDefinitionAttributes
 * @prop {label} label
 * @prop {Mdast.FootnoteDefinition} mdastNode
 * @group Footnote
 */
export interface FootnoteDefinitionAttributes {
  label: string;
  isDefInit?: boolean;
  mdastNode: Mdast.FootnoteDefinition;
}

/**
 * A serialized representation of an {@link FootnoteDefinitionNode}.
 * @group Footnote
 */
export type SerializedFootnoteDefNode = Spread<
  FootnoteDefinitionAttributes,
  SerializedLexicalNode
>;

/**
 * Properties passed to React Editor for Footnote Definitions
 * @interface FootnoteDefEditorProps
 * @prop {string} label The original text used to create a Footnote Reference
 * @prop {string} nodeKey
 * @prop {VoidEmitter} focusEmitter An emitter that will execute its subscription when the editor should be focused
 * @group Footnote
 */
export interface FootnoteDefEditorProps {
  config: EditorConfig;
  label: string;
  nodeKey: string;
  focusEmitter: VoidEmitter;
  parentEditor: LexicalEditor;
  lexicalNode: FootnoteDefinitionNode;
  mdastNode: Mdast.FootnoteDefinition;
}

/**
 * @interface FootnoteDefEditorContextValue
 * @prop {(label: string) => void} setLabel Updates the label
 * @prop {FootnoteDefinitionNode} lexicalNode The Lexical node being edited
 * @prop {LexicalEditor} parentEditor The parent Lexical editor
 * @group Footnote
 */
export interface FootnoteDefEditorContextValue {
  setLabel: (label: string) => void;
  lexicalNode: FootnoteDefinitionNode;
  parentEditor: LexicalEditor;
}

/**
 *  * Pass the object in the footnotePlugin parameters
 * @interface iFootnoteDefinitionEditorDescriptor
 * @prop {number} priority The priority of the descriptor catch
 * @prop {(label: string) => boolean} match Method to determine matching editor to lexical node
 * @prop {React.ComponentType<MathEditorProps>} Editor React component used to edit math nodes
 * @group Footnote
 */
export interface iFootnoteDefinitionEditorDescriptor {
  priority: number;
  match: (label: string) => boolean;
  Editor: React.ComponentType<FootnoteDefEditorProps>;
}

//#endregion

//#region Footnote Reference

/**
 * @interface FootnoteReferenceAttributes
 * @prop {label} label
 * @group Footnote
 */
export interface FootnoteReferenceAttributes {
  label: string;
  mdastNode: Mdast.FootnoteReference;
}

/**
 * A serialized representation of an {@link FootnoteReferenceNode}.
 * @group Code Block
 */
export type SerializedFootnoteRefNode = Spread<
  FootnoteReferenceAttributes,
  SerializedLexicalNode
>;

/**
 * @interface iFootnoteReferenceEditorDescriptor
 * Pass the object in the footnotePlugin parameters
 * @prop {number} priority The priority of the descriptor catch
 * @prop {(label: string) => boolean} match Method to determine matching editor to lexical node
 * @prop {React.ComponentType<MathEditorProps>} Editor React component used to edit math nodes
 * @group Math
 */
export interface iFootnoteReferenceEditorDescriptor {
  priority: number;
  match: (label: string) => boolean;
  Editor: React.ComponentType<FootnoteRefEditorProps>;
}

/**
 * Properties passed to FootnoteReferenceDescriptor.Editor
 * @interface FootnoteRefEditorProps
 * @prop {string} label
 * @prop {string} nodeKey
 * @prop {VoidEmitter} focusEmitter An emitter that will execute its subscription when the editor should be focused
 * @group Footnote
 */
export interface FootnoteRefEditorProps {
  config: EditorConfig;
  label: string;
  nodeKey: string;
  focusEmitter: VoidEmitter;
  parentEditor: LexicalEditor;
  lexicalNode: FootnoteReferenceNode;
  mdastNode: Mdast.FootnoteReference;
}

//#endregion
