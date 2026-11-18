import * as Mdast from 'mdast';
import { useCellValue, voidEmitter } from '@mdxeditor/editor';

import {
  DecoratorNode,
  DOMConversionMap,
  EditorConfig,
  LexicalEditor,
  NodeKey,
} from 'lexical';
import React from 'react';
import { z } from 'zod/v4';

import FootnoteDefinitionEditorContextProvider from './FootnoteDefinitionEditorContext';
import { footnoteDefinitionEditorDescriptors$ } from './vars';
import { FootnoteDefEditorProps, SerializedFootnoteDefNode } from './types';
import { $createFootnoteDefinitionNode } from './methods';

// Validate the tree structure while preserving Markdown/MDX extension fields.
// This checks the serialization envelope, not every MDAST node's grammar.
function isMdastContent(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const node = value as Record<string, unknown>;
  return (
    typeof node['type'] === 'string' &&
    (node['value'] === undefined || typeof node['value'] === 'string') &&
    (node['children'] === undefined ||
      (Array.isArray(node['children']) && node['children'].every(isMdastContent)))
  );
}

const footnoteDefinitionSchema = z.object({
  type: z.literal('fndef'),
  version: z.literal(1),
  label: z.string(),
  mdastNode: z
    .object({
      type: z.literal('footnoteDefinition'),
      identifier: z.string(),
      label: z.string().nullable().optional(),
      children: z.array(
        z.custom<Mdast.BlockContent | Mdast.DefinitionContent>(isMdastContent),
      ),
    })
    .passthrough(),
});

/**
 * Lexical node that represents a Footnote Definition.
 * __mdastNode is used for updating nested children
 * @group Footnote
 */
export class FootnoteDefinitionNode extends DecoratorNode<JSX.Element> {
  __label: string;
  __mdastNode: Mdast.FootnoteDefinition;
  __focusEmitter = voidEmitter();

  static override getType(): string {
    return 'fndef';
  }

  static override clone(node: FootnoteDefinitionNode): FootnoteDefinitionNode {
    return new FootnoteDefinitionNode(
      structuredClone(node.__mdastNode),
      node.__label,
      node.__key,
    );
  }

  constructor(
    mdastNode: Mdast.FootnoteDefinition,
    label: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__label = label;
    this.__mdastNode = mdastNode;
  }

  /**
   * DOM content for a Footnote Definition
   * @param _config
   * @returns
   */
  override createDOM(_config: EditorConfig): HTMLElement {
    const fnDefEl = document.createElement('li');
    fnDefEl.setAttribute('id', `fn:${this.getLabel()}`);
    return fnDefEl;
  }

  /**
   * DOM does not change when the content of a definition changes
   * @returns
   */
  override updateDOM(): false {
    return false;
  }

  /**
   * We don't support reading footnote html
   * @returns
   */
  static override importDOM(): DOMConversionMap {
    return {};
  }

  /**
   * Converts serialized json to Lexical node
   * @param serializedNode
   * @returns
   */
  static override importJSON(
    serializedNode: Parameters<typeof DecoratorNode.importJSON>[0],
  ): FootnoteDefinitionNode {
    const result = footnoteDefinitionSchema.safeParse(serializedNode);
    if (!result.success) {
      throw new Error(
        `Invalid serialized footnote definition: ${result.error.message}`,
      );
    }
    const { label, mdastNode } = result.data;
    return $createFootnoteDefinitionNode({
      label,
      mdastNode,
    });
  }

  /**
   * Exports serialized json from Lexical node
   * @returns
   */
  override exportJSON(): SerializedFootnoteDefNode {
    return {
      ...super.exportJSON(),
      type: 'fndef',
      label: this.getLabel(),
      mdastNode: structuredClone(this.__mdastNode),
      version: 1,
    };
  }

  getLabel(): string {
    return this.__label;
  }

  getMdastNode(): Mdast.FootnoteDefinition {
    return this.__mdastNode;
  }

  setLabel = (label: string) => {
    this.getWritable().__label = label;
  };

  setMdastNode(mdastNode: Mdast.FootnoteDefinition): void {
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
      <FootnoteDefEditorContainer
        config={config}
        parentEditor={parentEditor}
        lexicalNode={this}
        label={this.getLabel()}
        nodeKey={this.getKey()}
        focusEmitter={this.__focusEmitter}
        mdastNode={this.__mdastNode}
      />
    );
  }
}

/**
 * Editor container
 * @prop {LexicalEditor} parentEditor
 * @prop {FootnoteDefinitionNode} definitionNode
 * @group Footnote
 */
const FootnoteDefEditorContainer: React.FC<FootnoteDefEditorProps> = (
  props,
) => {
  const editorDescriptors = useCellValue(footnoteDefinitionEditorDescriptors$);
  const descriptor = editorDescriptors[0]; //there is only 1 footnote descriptor

  const Editor = descriptor.Editor;

  const { lexicalNode: _, parentEditor: __, ...restProps } = props;

  return (
    <FootnoteDefinitionEditorContextProvider
      parentEditor={props.parentEditor}
      lexicalNode={props.lexicalNode}
    >
      <Editor {...props} />
    </FootnoteDefinitionEditorContextProvider>
  );
};
