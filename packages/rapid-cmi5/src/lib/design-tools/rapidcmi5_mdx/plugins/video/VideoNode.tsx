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
import { VideoEditor } from './VideoEditor';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

function convertVideoElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLVideoElement) {
    const { src, title, width, height } = domNode;
    const node = $createVideoNode({ src, title, width, height });
    return { node };
  }
  return null;
}

/**
 * A serialized representation of a {@link VideoNode}.
 * @group Video
 */
export type SerializedVideoNode = Spread<
  {
    title?: string;
    width?: number;
    height?: number;
    src: string;
    rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
    videoId?: string; // Unique persistent ID for animation targeting
    type: 'video';
    version: 1;
  },
  SerializedLexicalNode
>;

/**
 * A lexical node that represents a video. Use {@link "$createVideoNode"} to construct one.
 * @group Video
 */
export class VideoNode extends DecoratorNode<JSX.Element> {
  /** @internal */
  __src: string;
  /** @internal */
  __title: string | undefined;
  /** @internal */
  __width: 'inherit' | number;
  /** @internal */
  __height: 'inherit' | number;
  /** @internal */
  __videoId: string; // Unique persistent ID for animation targeting

  /** @internal */
  __rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];

  /** @internal */
  static override getType(): string {
    return 'video';
  }

  /** @internal */
  static override clone(node: VideoNode): VideoNode {
    const cloned = new VideoNode(
      node.__src,
      node.__title,
      node.__width,
      node.__height,
      node.__rest,
      node.__key,
    );
    cloned.__videoId = node.__videoId; // Preserve videoId on clone
    return cloned;
  }

  /** @internal */
  static override importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { title, src, width, rest, height, videoId } = serializedNode;
    const node = $createVideoNode({
      title,
      src,
      height,
      width,
      rest,
      videoId, // Restore videoId from saved state
    });
    return node;
  }

  /** @internal */
  override exportDOM(): DOMExportOutput {
    const element = document.createElement('video');
    element.setAttribute('src', this.__src);
    element.setAttribute('controls', 'true');
    if (this.__title) {
      element.setAttribute('title', this.__title);
    }
    if (this.__width) {
      element.setAttribute('width', this.__width.toString());
    }
    if (this.__height) {
      element.setAttribute('height', this.__height.toString());
    }
    return { element };
  }

  /** @internal */
  static override importDOM(): DOMConversionMap | null {
    return {
      video: () => ({
        conversion: convertVideoElement,
        priority: 0,
      }),
    };
  }

  /**
   * Constructs a new {@link VideoNode} with the specified video parameters.
   * Use {@link $createVideoNode} to construct one.
   */
  constructor(
    src: string,
    title: string | undefined,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[],
    key?: NodeKey,
    videoId?: string,
  ) {
    super(key);
    this.__src = src;
    this.__title = title;
    this.__width = width ? width : 'inherit';
    this.__height = height ? height : 'inherit';
    this.__rest = rest ?? [];
    // Generate or restore unique videoId for animation targeting
    this.__videoId = videoId || this.generateVideoId();
  }

  /** @internal */
  private generateVideoId(): string {
    // Use crypto.randomUUID() if available, otherwise fallback to timestamp + random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /** @internal */
  override exportJSON(): SerializedVideoNode {
    return {
      title: this.getTitle(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      width: this.__width === 'inherit' ? 0 : this.__width,
      src: this.getSrc(),
      rest: this.__rest,
      videoId: this.__videoId, // Save videoId for persistence
      type: 'video',
      version: 1,
    };
  }

  /**
   * Sets the video dimensions
   */
  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  /** @internal */
  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.video;
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

  getHeight(): 'inherit' | number {
    return this.__height;
  }

  getWidth(): 'inherit' | number {
    return this.__width;
  }

  getRest(): (MdxJsxAttribute | MdxJsxExpressionAttribute)[] {
    return this.__rest;
  }

  getVideoId(): string {
    return this.__videoId;
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
    // ALWAYS serialize as HTML element to preserve videoId for animations!
    // Previously only returned true for videos with custom dimensions or attributes,
    // but we need the data-video-id attribute on ALL videos for animation persistence.
    return true;
  }

  /** @internal */
  override decorate(_parentEditor: LexicalEditor): JSX.Element {
    return (
      <VideoEditor
        src={this.getSrc()}
        title={this.getTitle()}
        nodeKey={this.getKey()}
        width={this.__width}
        height={this.__height}
        rest={this.__rest}
        videoId={this.__videoId}
      />
    );
  }
}

/**
 * The parameters used to create a {@link VideoNode} through {@link $createVideoNode}.
 * @group Video
 */
export interface CreateVideoNodeParameters {
  width?: number;
  height?: number;
  title?: string;
  key?: NodeKey;
  rest?: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  src: string;
  videoId?: string;
}

/**
 * Creates a {@link VideoNode}.
 * @param params - The video attributes.
 * @group Video
 */
export function $createVideoNode(params: CreateVideoNodeParameters): VideoNode {
  const { title, src, key, width, height, rest, videoId } = params;
  return new VideoNode(src, title, width, height, rest, key, videoId);
}

/**
 * Returns true if the node is a {@link VideoNode}.
 * @group Video
 */
export function $isVideoNode(
  node: LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}
