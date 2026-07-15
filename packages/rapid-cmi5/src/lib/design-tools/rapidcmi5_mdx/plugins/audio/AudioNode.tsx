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
    id?: string;
    autoplay?: boolean;
    /**
     * URL of the transcript/caption file (`.vtt` or `.txt`). The content decides
     * whether it renders as timed cues or plain text, not the extension.
     */
    captionSrc?: string;
    /**
     * Back-compat only: inline plain-text transcript from legacy content
     * (authored before the file-only model). Preserved on round-trip and
     * rendered read-only, but never produced by the editor anymore.
     */
    captionText?: string;
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
  __id: string;
  /** @internal */
  __autoplay: boolean;
  /** @internal */
  __captionSrc: string | undefined;
  /** @internal Back-compat: preserved legacy inline transcript text. */
  __captionText: string | undefined;

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
      node.__captionSrc,
      node.__captionText,
    );
    cloned.__id = node.__id;
    return cloned;
  }

  /** @internal */
  static override importJSON(serializedNode: SerializedAudioNode): AudioNode {
    const { title, src, rest, autoplay, captionSrc, captionText } =
      serializedNode;
    // `id` is deliberately dropped: importJSON is the clipboard path, so a
    // pasted copy must mint its own GUID rather than clone the source's,
    // which would collide in animation targeting. Document load goes through
    // the Mdast import visitors, which pass the saved id explicitly.
    const node = $createAudioNode({
      title,
      src,
      rest,
      autoplay,
      captionSrc,
      captionText,
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
    captionSrc?: string,
    captionText?: string,
  ) {
    super(key);
    this.__src = src;
    this.__title = title;
    this.__rest = rest ?? [];
    this.__id = id || this.generateId();
    this.__autoplay = autoplay ?? false;
    this.__captionSrc = captionSrc;
    this.__captionText = captionText;
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
      id: this.__id,
      autoplay: this.__autoplay,
      captionSrc: this.__captionSrc,
      captionText: this.__captionText,
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

  getCaptionSrc(): string | undefined {
    return this.__captionSrc;
  }

  setCaptionSrc(captionSrc: string | undefined): void {
    this.getWritable().__captionSrc = captionSrc;
  }

  /**
   * Back-compat: legacy inline transcript text. Read-only — the editor no
   * longer produces inline text (transcripts are files), but existing content
   * is preserved and still rendered.
   */
  getCaptionText(): string | undefined {
    return this.__captionText;
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
        captionSrc={this.__captionSrc}
        captionText={this.__captionText}
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
  captionSrc?: string;
  /** Back-compat only: preserved legacy inline transcript text. */
  captionText?: string;
}

/**
 * Creates a {@link AudioNode}.
 * @param params - The audio attributes.
 * @group Audio
 */
export function $createAudioNode(params: CreateAudioNodeParameters): AudioNode {
  const { title, src, key, rest, id, autoplay, captionSrc, captionText } =
    params;
  return new AudioNode(
    src,
    title,
    rest,
    key,
    id,
    autoplay,
    captionSrc,
    captionText,
  );
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
