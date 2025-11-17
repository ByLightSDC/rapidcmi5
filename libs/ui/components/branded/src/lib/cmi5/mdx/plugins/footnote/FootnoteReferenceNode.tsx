import * as Mdast from 'mdast';
import { useCellValue, voidEmitter } from '@mdxeditor/editor';

import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey } from 'lexical';
import React from 'react';

import FootnoteReferenceEditorContextProvider from './FootnoteReferenceEditorContext';
import { footnoteReferenceEditorDescriptors$ } from './vars';
import { FootnoteRefEditorProps, SerializedFootnoteRefNode } from './types';
import { $createFootnoteReferenceNode } from './methods';

/**
 * Lexical node that represents a Footnote Reference.
 * @group Footnote
 */
export class FootnoteReferenceNode extends DecoratorNode<JSX.Element> {
  __node: string;
  __label: string;
  __isDefInit: boolean;
  __mdastNode: Mdast.FootnoteReference;
  __focusEmitter = voidEmitter();

  //lexical node type, unique among Lexical nodes
  static override getType(): string {
    return 'fnref';
  }

  static override clone(node: FootnoteReferenceNode): FootnoteReferenceNode {
    return new FootnoteReferenceNode(
      structuredClone(node.__mdastNode),
      node.__label,
      node.__key,
    );
  }

  constructor(
    mdastNode: Mdast.FootnoteReference,
    label: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__label = label;
    this.__mdastNode = mdastNode;
  }

  override createDOM(_config: EditorConfig): HTMLElement {
    const footnoteRefEl = document.createElement('sup');
    footnoteRefEl.setAttribute('id', `fnref:${this.getLabel()}`);
    return footnoteRefEl;
  }

  override updateDOM(): false {
    return false;
  }

  static override importJSON(
    serializedNode: SerializedFootnoteRefNode,
  ): FootnoteReferenceNode {
    const { label, mdastNode } = serializedNode;
    return $createFootnoteReferenceNode({
      label,
      mdastNode,
    });
  }

  override exportJSON(): SerializedFootnoteRefNode {
    return {
      type: 'fnref',
      label: this.getLabel(),
      mdastNode: this.getMdastNode(),
      version: 1,
    };
  }

  getLabel(): string {
    return this.__label;
  }

  getIsDefInit(): boolean {
    return this.__isDefInit;
  }

  getMdastNode(): Mdast.FootnoteReference {
    return this.__mdastNode;
  }

  setIsDefInit = (isDefInit: boolean) => {
    this.getWritable().__isDefInit = isDefInit;
  };

  setLabel = (label: string) => {
    this.getWritable().__label = label;
  };

  setMdastNode(mdastNode: Mdast.FootnoteReference): void {
    this.getWritable().__mdastNode = mdastNode;
  }

  select = () => {
    this.__focusEmitter.publish();
  };

  override decorate(
    parentEditor: LexicalEditor,
    config: EditorConfig,
  ): JSX.Element {
    return (
      <FootnoteRefEditorContainer
        config={config}
        parentEditor={parentEditor}
        lexicalNode={this}
        label={this.getLabel()}
        nodeKey={this.getKey()}
        focusEmitter={this.__focusEmitter}
        mdastNode={this.getMdastNode()}
      />
    );
  }
}

/**
 * Editor container for Footnote Reference
 * @prop {LexicalEditor} parentEditor
 * @prop {FootnoteReferenceNode} definitionNode
 * @group Footnote
 */
const FootnoteRefEditorContainer: React.FC<FootnoteRefEditorProps> = (
  props,
) => {
  const editorDescriptors = useCellValue(footnoteReferenceEditorDescriptors$);
  const descriptor = editorDescriptors[0]; //there is only 1 footnote descriptor

  const Editor = descriptor.Editor;

  const { lexicalNode: _, parentEditor: __, ...restProps } = props;

  return (
    <FootnoteReferenceEditorContextProvider
      parentEditor={props.parentEditor}
      lexicalNode={props.lexicalNode}
    >
      <Editor {...props} />
    </FootnoteReferenceEditorContextProvider>
  );
};
