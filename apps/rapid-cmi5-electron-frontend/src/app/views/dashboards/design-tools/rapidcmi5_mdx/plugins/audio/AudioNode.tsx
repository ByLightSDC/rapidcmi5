import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import { DecoratorNode } from 'lexical';
import { AudioEditor } from './AudioEditor';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

function convertAudioElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLAudioElement) {
    const { src, title } = domNode;
    const node = $createAudioNode({ src, title });
    return { node };
  }
  return null;
}

/**
 * A serialized representation of a {@link AudioNode}.
 * @group Audio
 */
export type SerializedAudioNode = Spread<
  {
    title?: string;
    src: string;
    rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
    type: 'audio';
    version: 1;
  },
  SerializedLexicalNode
>;

/**
 * A lexical node that represents an audio file. Use {@link "$createAudioNode"} to construct one.
 * @group Audio
 */
export class AudioNode extends DecoratorNode<JSX.Element> {
  /** @internal */
  __src: string;
  /** @internal */
  __title: string | undefined;

  /** @internal */
  __rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];

  /** @internal */
  static getType(): string {
    return 'audio';
  }

  /** @internal */
  static clone(node: AudioNode): AudioNode {
    return new AudioNode(node.__src, node.__title, node.__rest, node.__key);
  }

  /** @internal */
  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    const { title, src, rest } = serializedNode;
    const node = $createAudioNode({
      title,
      src,
      rest,
    });
    return node;
  }

  /** @internal */
  exportDOM(): DOMExportOutput {
    const element = document.createElement('audio');
    element.setAttribute('src', this.__src);
    element.setAttribute('controls', 'true');
    if (this.__title) {
      element.setAttribute('title', this.__title);
    }
    return { element };
  }

  /** @internal */
  static importDOM(): DOMConversionMap | null {
    return {
      audio: () => ({
        conversion: convertAudioElement,
        priority: 0,
      }),
    };
  }

  /**
   * Constructs a new {@link AudioNode} with the specified audio parameters.
   * Use {@link $createAudioNode} to construct one.
   */
  constructor(
    src: string,
    title: string | undefined,
    rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[],
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__title = title;
    this.__rest = rest ?? [];
  }

  /** @internal */
  exportJSON(): SerializedAudioNode {
    return {
      title: this.getTitle(),
      src: this.getSrc(),
      rest: this.__rest,
      type: 'audio',
      version: 1,
    };
  }

  /** @internal */
  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.audio;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  /** @internal */
  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getTitle(): string | undefined {
    return this.__title;
  }

  getRest(): (MdxJsxAttribute | MdxJsxExpressionAttribute)[] {
    return this.__rest;
  }

  setTitle(title: string | undefined): void {
    this.getWritable().__title = title;
  }

  setSrc(src: string): void {
    this.getWritable().__src = src;
  }

  setRest(
    rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[] | undefined,
  ): void {
    this.getWritable().__rest = rest ?? [];
  }

  /** @internal */
  shouldBeSerializedAsElement(): boolean {
    return this.__rest.length > 0;
  }

  /** @internal */
  decorate(_parentEditor: LexicalEditor): JSX.Element {
    return (
      <AudioEditor
        src={this.getSrc()}
        title={this.getTitle()}
        nodeKey={this.getKey()}
        rest={this.__rest}
      />
    );
  }
}

/**
 * The parameters used to create a {@link AudioNode} through {@link $createAudioNode}.
 * @group Audio
 */
export interface CreateAudioNodeParameters {
  title?: string;
  key?: NodeKey;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  src: string;
}

/**
 * Creates a {@link AudioNode}.
 * @param params - The audio attributes.
 * @group Audio
 */
export function $createAudioNode(params: CreateAudioNodeParameters): AudioNode {
  const { title, src, key, rest } = params;
  return new AudioNode(src, title, rest, key);
}

/**
 * Returns true if the node is a {@link AudioNode}.
 * @group Audio
 */
export function $isAudioNode(
  node: LexicalNode | null | undefined,
): node is AudioNode {
  return node instanceof AudioNode;
}
