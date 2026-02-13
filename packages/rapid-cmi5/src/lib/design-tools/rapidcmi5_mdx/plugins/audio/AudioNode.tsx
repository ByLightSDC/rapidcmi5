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
    const { src, title, autoplay } = domNode;
    const node = $createAudioNode({ src, title, autoplay });
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
    id?: string; // Unique persistent ID for animation targeting
    autoplay?: boolean;
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
  __id: string; // Unique persistent ID for animation targeting
  /** @internal */
  __autoplay: boolean;

  /** @internal */
  __rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];

  /** @internal */
  static override getType(): string {
    return 'audio';
  }

  /** @internal */
  static override clone(node: AudioNode): AudioNode {
    const cloned = new AudioNode(
      node.__src,
      node.__title,
      node.__rest,
      node.__key,
      undefined,
      node.__autoplay,
    );
    cloned.__id = node.__id; // Preserve id on clone
    return cloned;
  }

  /** @internal */
  static override importJSON(serializedNode: SerializedAudioNode): AudioNode {
    const { title, src, rest, id, autoplay } = serializedNode;
    const node = $createAudioNode({
      title,
      src,
      rest,
      id, // Restore id from saved state
      autoplay,
    });
    return node;
  }

  /** @internal */
  override exportDOM(): DOMExportOutput {
    const element = document.createElement('audio');
    element.setAttribute('src', this.__src);
    element.setAttribute('controls', 'true');
    if (this.__title) {
      element.setAttribute('title', this.__title);
    }
    if (this.__autoplay) {
      element.setAttribute('autoplay', 'true');
    }
    return { element };
  }

  /** @internal */
  static override importDOM(): DOMConversionMap | null {
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
    id?: string,
    autoplay?: boolean,
  ) {
    super(key);
    this.__src = src;
    this.__title = title;
    this.__rest = rest ?? [];
    // Generate or restore unique id for animation targeting
    this.__id = id || this.generateId();
    this.__autoplay = autoplay ?? false;
  }

  /** @internal */
  private generateId(): string {
    // Use crypto.randomUUID() if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `aud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /** @internal */
  override exportJSON(): SerializedAudioNode {
    return {
      title: this.getTitle(),
      src: this.getSrc(),
      rest: this.__rest,
      id: this.__id, // Save id for persistence
      autoplay: this.__autoplay,
      type: 'audio',
      version: 1,
    };
  }

  /** @internal */
  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.audio;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  /** @internal */
  override updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getTitle(): string | undefined {
    return this.__title;
  }

  getId(): string {
    return this.__id;
  }

  getAutoplay(): boolean {
    return this.__autoplay;
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

  setAutoplay(autoplay: boolean): void {
    this.getWritable().__autoplay = autoplay;
  }

  /** @internal */
  shouldBeSerializedAsElement(): boolean {
    // ALWAYS serialize as HTML element to preserve id for animations!
    return true;
  }

  /** @internal */
  override decorate(_parentEditor: LexicalEditor): JSX.Element {
    return (
      <AudioEditor
        src={this.getSrc()}
        title={this.getTitle()}
        nodeKey={this.getKey()}
        rest={this.__rest}
        id={this.__id}
        autoplay={this.__autoplay}
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
  id?: string;
  autoplay?: boolean;
}

/**
 * Creates a {@link AudioNode}.
 * @param params - The audio attributes.
 * @group Audio
 */
export function $createAudioNode(params: CreateAudioNodeParameters): AudioNode {
  const { title, src, key, rest, id, autoplay } = params;
  return new AudioNode(src, title, rest, key, id, autoplay);
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
