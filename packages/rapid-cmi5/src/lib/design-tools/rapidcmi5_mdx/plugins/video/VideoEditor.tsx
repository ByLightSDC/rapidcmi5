import React from 'react';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  videoFilePath$,
  videoPlaceholder$,
  disableVideoResize$,
  videoPreviewHandler$,
  editVideoToolbarComponent$,
  disableVideoSettingsButton$,
} from './index';
import { $isVideoNode } from './VideoNode';
import styles from './styles/video-plugin.module.css';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';
import VideoResizer from './VideoResizer';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

const imageCache = new Set();

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
      img.onerror = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}

interface LazyVideoProps {
  src: string;
  title?: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
  resizable: boolean;
  videoId: string;
}

function LazyVideo({
  src,
  title,
  nodeKey,
  width,
  height,
  resizable,
  videoId,
}: LazyVideoProps): JSX.Element {
  useSuspenseImage(src);
  return (
    <VideoComponent
      src={src}
      title={title}
      nodeKey={nodeKey}
      width={width}
      height={height}
      resizable={resizable}
      videoId={videoId}
    />
  );
}

interface VideoComponentProps {
  src: string;
  title?: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
  resizable: boolean;
  videoId: string;
}

function VideoComponent({
  src,
  title,
  nodeKey,
  width,
  height,
  resizable,
  videoId,
}: VideoComponentProps): JSX.Element {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = React.useState(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = React.useState<any>(null);
  const activeEditorRef = React.useRef<LexicalEditor | null>(null);

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isVideoNode(node)) {
          node.remove();
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onEnter = React.useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoNode(node)) {
          event.preventDefault();
          // Handle enter key if needed
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onEscape = React.useCallback(
    (event: KeyboardEvent) => {
      if (isSelected) {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoNode(node)) {
          clearSelection();
          setSelected(false);
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey, clearSelection, setSelected],
  );

  const onClick = React.useCallback(
    (payload: MouseEvent) => {
      const event = payload;
      if (isResizing) {
        return true;
      }
      if (event.target === videoRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }
      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection],
  );

  const onResizeStart = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const onResizeEnd = React.useCallback(
    (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
      setTimeout(() => {
        setIsResizing(false);
      }, 200);

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isVideoNode(node)) {
          node.setWidthAndHeight(nextWidth, nextHeight);
        }
      });
    },
    [editor, nodeKey],
  );

  React.useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === videoRef.current) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        onEscape,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const latestSelection = $getSelection();
          if (isMounted) {
            setSelection(latestSelection);
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return () => {
      isMounted = false;
      unregister();
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    onDelete,
    onEnter,
    onEscape,
    onClick,
    setSelected,
  ]);

  const isFocused = isSelected;

  return (
    <React.Suspense fallback={null}>
      <>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <video
            className={
              isFocused
                ? `${styles.focusedVideo} ${styles.videoNode}`
                : styles.videoNode
            }
            src={src}
            title={title}
            ref={videoRef}
            style={{
              height: height === 'inherit' ? 'inherit' : `${height}px`,
              maxWidth: '100%',
              width: width === 'inherit' ? 'inherit' : `${width}px`,
            }}
            controls
            muted={false}
            draggable={false}
            data-video-id={videoId}
          />
          {resizable && isFocused && (
            <VideoResizer
              editor={editor}
              videoRef={videoRef}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
            />
          )}
        </div>
      </>
    </React.Suspense>
  );
}

export interface VideoEditorProps {
  src: string;
  title?: string;
  nodeKey: NodeKey;
  width: 'inherit' | number;
  height: 'inherit' | number;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  videoId: string;
  autoplay: boolean;
}

export function VideoEditor({
  src,
  title,
  nodeKey,
  width,
  height,
  rest,
  videoId,
  autoplay,
}: VideoEditorProps): JSX.Element {
  const [videoFilePath] = useCellValues(videoFilePath$);
  const [Placeholder] = useCellValues(videoPlaceholder$);
  const [disableResize] = useCellValues(disableVideoResize$);
  const [EditVideoToolbar] = useCellValues(editVideoToolbarComponent$);
  const [disableSettingsButton] = useCellValues(disableVideoSettingsButton$);
  const [videoPreviewHandler] = useCellValues(videoPreviewHandler$);
  const [previewSrc, setPreviewSrc] = React.useState(src);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  React.useEffect(() => {
    if (videoPreviewHandler && src.startsWith('./')) {
      videoPreviewHandler(src).then(setPreviewSrc);
    } else {
      setPreviewSrc(src);
    }
  }, [src, videoPreviewHandler]);

  const isLocal = src.startsWith('./');
  const initialVideoPath = isLocal ? src : null;
  const videoSource = isLocal ? `${videoFilePath}${src.slice(1)}` : src;

  return (
    <React.Suspense fallback={Placeholder ? <Placeholder /> : null}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <LazyVideo
          src={previewSrc || videoSource}
          title={title}
          nodeKey={nodeKey}
          width={width}
          height={height}
          resizable={!disableResize}
          videoId={videoId}
        />
        {isSelected && !disableSettingsButton && EditVideoToolbar && (
          <EditVideoToolbar
            nodeKey={nodeKey}
            videoSource={videoSource}
            initialVideoPath={initialVideoPath}
            title={title || ''}
            rest={rest}
            width={typeof width === 'number' ? width : undefined}
            height={typeof height === 'number' ? height : undefined}
            autoplay={autoplay}
          />
        )}
      </div>
    </React.Suspense>
  );
}
