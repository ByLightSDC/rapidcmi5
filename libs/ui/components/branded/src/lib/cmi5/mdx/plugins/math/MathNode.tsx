import { useCellValue, voidEmitter, VoidEmitter } from '@mdxeditor/editor';

import {
  DecoratorNode,
  DOMConversionOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import React from 'react';
import MathEditorContextProvider from './MathEditorContext';
import { mathEditorDescriptors$ } from '.';

/**
 * @interface CreateMathNodeOptions
 * @prop {boolean} isInline
 * @prop {string} code
 * @prop {string} language
 * @prop {string} meta
 * @group Math
 */
export interface CreateMathNodeOptions {
  isInline: boolean;
  code: string;
  language: string;
  meta: string;
}

/**
 * A serialized representation of an {@link MathNode}.
 * @group Code Block
 */
export type SerializedMathNode = Spread<
  CreateMathNodeOptions & { version: 1 },
  SerializedLexicalNode
>;

/**
 * Properties passed to MathEditorDescriptor.Editor
 * @interface MathEditorProps
 * @prop {boolean} isInline
 * @prop {string} code
 * @prop {string} language
 * @prop {string} meta
 * @prop {string} nodeKey Lexical node key
 * @prop {VoidEmitter} focusEmitter An emitter that will execute its subscription when the editor should be focused
 * @group Math
 */
export interface MathEditorProps {
  isInline: boolean;
  code: string;
  language: string;
  meta: string;
  nodeKey: string;
  focusEmitter: VoidEmitter;
}

/**
 * A lexical node that represents KaText rendered Math. Use $createMathBlockNode to construct
 * @group Math
 */
export class MathNode extends DecoratorNode<JSX.Element> {
  __isInline: boolean;
  __code: string;
  __meta: string;
  __language: string;
  __focusEmitter = voidEmitter();

  //lexical node type, unique among Lexical nodes
  static override getType(): string {
    return 'math';
  }

  static override clone(node: MathNode): MathNode {
    return new MathNode(
      node.__isInline,
      node.__code,
      node.__language,
      node.__meta,
      node.__key,
    );
  }

  static override importJSON(serializedNode: SerializedMathNode): MathNode {
    const { isInline, code, meta, language } = serializedNode;
    return $createMathNode({
      isInline,
      code,
      language,
      meta,
    });
  }

  // REF not sure what this is for
  //   static importDOM(): DOMConversionMap {
  //     return {
  //       pre: () => {
  //         return {
  //           conversion: $convertPreElement,
  //           priority: 3
  //         }
  //       }
  //     }
  //   }

  constructor(
    isInline: boolean,
    code: string,
    language: string,
    meta: string,
    key?: NodeKey,
  ) {
    super(key);
    this.__isInline = isInline;
    this.__code = code;
    this.__meta = meta;
    this.__language = language;
  }

  override exportJSON(): SerializedMathNode {
    return {
      isInline: this.getIsInline(),
      code: this.getCode(),
      language: this.getLanguage(),
      meta: this.getMeta(),
      type: 'math',
      version: 1,
    };
  }

  // View
  override createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement(this.getIsInline() ? 'span' : 'div');
  }

  override updateDOM(): false {
    return false;
  }

  getIsInline(): boolean {
    return this.__isInline;
  }

  getCode(): string {
    return this.__code;
  }

  getMeta(): string {
    return this.__meta;
  }

  getLanguage(): string {
    return this.__language;
  }

  setIsInline = (isInline: boolean) => {
    if (isInline !== this.__isInline) {
      this.getWritable().__isInline = isInline;
    }
  };

  setCode = (code: string) => {
    if (code !== this.__code) {
      this.getWritable().__code = code;
    }
  };

  setMeta = (meta: string) => {
    if (meta !== this.__meta) {
      this.getWritable().__meta = meta;
    }
  };

  setLanguage = (language: string) => {
    if (language !== this.__language) {
      this.getWritable().__language = language;
    }
  };

  select = () => {
    this.__focusEmitter.publish();
  };

  override decorate(editor: LexicalEditor): JSX.Element {
    return (
      <MathEditorContainer
        parentEditor={editor}
        code={this.getCode()}
        isInline={this.getIsInline()}
        meta={this.getMeta()}
        language={this.getLanguage()}
        mathNode={this}
        nodeKey={this.getKey()}
        focusEmitter={this.__focusEmitter}
      />
    );
  }
}

/**
 * Editor related functions
 * @prop {LexicalEditor} parentEditor
 * @prop {MathNode} mathNode
 * @group Math
 */
const MathEditorContainer: React.FC<
  {
    parentEditor: LexicalEditor;
    mathNode: MathNode;
  } & MathEditorProps
> = (props) => {
  const mathEditorDescriptors = useCellValue(mathEditorDescriptors$);

  const descriptor = mathEditorDescriptors[0]; //there is only 1 math descriptor

  const Editor = descriptor.Editor;

  const { mathNode: _, parentEditor: __, ...restProps } = props;

  return (
    <MathEditorContextProvider
      parentEditor={props.parentEditor}
      lexicalNode={props.mathNode}
    >
      <Editor {...restProps} />
    </MathEditorContextProvider>
  );
};

/**
 * Creates a MathNode
 * @param {Partial<CreateMathNodeOptions>} options
 * @group Code Block
 */
export function $createMathNode(
  options: Partial<CreateMathNodeOptions>,
): MathNode {
  const { code = '', isInline = true, language = '', meta = '' } = options;
  return new MathNode(isInline, code, language, meta);
}

/**
 * Returns true if the given node is a MathNode
 * @group Math
 */
export function $isMathNode(
  node: LexicalNode | null | undefined,
): node is MathNode {
  return node instanceof MathNode;
}

/**
 * REF not sure if this is needed
 * Converts a <pre> HTML element into a CodeBlockNode.
 * Extracts the code content, language, and meta information from the element's attributes.
 * The language is determined from the class attribute (e.g., class="language-javascript") or
 * the data-language attribute if available.
 *
 * @param element - The <pre> HTML element to convert.
 * @returns A DOMConversionOutput containing the created CodeBlockNode.
 * @group Code Block
 */
export function $convertPreElement(element: Element): DOMConversionOutput {
  const preElement = element as HTMLPreElement;
  const code = preElement.textContent ?? '';
  // Get language from class if available (e.g., class="language-javascript")
  const classAttribute = element.getAttribute('class') ?? '';
  const dataLanguageAttribute = element.getAttribute('data-language') ?? '';
  const languageMatch = classAttribute.match(/language-(\w+)/);
  const language = languageMatch ? languageMatch[1] : dataLanguageAttribute;
  const meta = preElement.getAttribute('data-meta') ?? '';
  return {
    node: $createMathNode({ code, language, meta }),
  };
}
