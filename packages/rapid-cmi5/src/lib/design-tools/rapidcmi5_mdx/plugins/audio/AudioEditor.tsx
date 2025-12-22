import React from 'react';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  audioPlaceholder$,
  audioPreviewHandler$,
  editAudioToolbarComponent$,
  disableAudioSettingsButton$,
} from './index';
import { $isAudioNode } from './AudioNode';
import styles from './styles/audio-plugin.module.css';
import { useCellValues } from '@mdxeditor/gurx';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

interface AudioComponentProps {
  src: string;
  title?: string;
  nodeKey: NodeKey;
}

function AudioComponent({
  src,
  title,
  nodeKey,
}: AudioComponentProps): JSX.Element {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isAudioNode(node)) {
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
        if ($isAudioNode(node)) {
          event.preventDefault();
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
        if ($isAudioNode(node)) {
          clearSelection();
          setSelected(false);
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey, clearSelection, setSelected],
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const onClick = React.useCallback(
    (payload: MouseEvent) => {
      const event = payload;
      // Check if click is within the container or audio element
      if (
        (audioRef.current && audioRef.current.contains(event.target as Node)) ||
        (containerRef.current &&
          containerRef.current.contains(event.target as Node))
      ) {
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
    [isSelected, setSelected, clearSelection],
  );

  React.useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === audioRef.current) {
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
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );

    return () => {
      isMounted = false;
      unregister();
    };
  }, [editor, isSelected, nodeKey, onDelete, onEnter, onEscape, onClick]);

  const isFocused = isSelected;

  const handleWrapperClick = (e: React.MouseEvent) => {
    // Only handle clicks on the wrapper itself, not on the audio controls
    if (e.target === containerRef.current) {
      if (e.shiftKey) {
        setSelected(!isSelected);
      } else {
        clearSelection();
        setSelected(true);
      }
    }
  };

  return (
    <React.Suspense fallback={null}>
      <div
        ref={containerRef}
        onClick={handleWrapperClick}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          padding: '8px',
          cursor: 'pointer',
          border: isFocused
            ? '2px solid rgb(60, 132, 244)'
            : '2px solid transparent',
          borderRadius: '4px',
          backgroundColor: isFocused
            ? 'rgba(60, 132, 244, 0.05)'
            : 'transparent',
        }}
      >
        <audio
          className={styles.audioNode}
          src={src}
          title={title}
          ref={audioRef}
          controls
          muted={false}
          style={{
            display: 'block',
            maxWidth: '100%',
            width: '100%',
            height: '54px',
            pointerEvents: 'auto',
          }}
        />
      </div>
    </React.Suspense>
  );
}

export interface AudioEditorProps {
  src: string;
  title?: string;
  nodeKey: NodeKey;
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
}

export function AudioEditor({
  src,
  title,
  nodeKey,
  rest,
}: AudioEditorProps): JSX.Element {
  const [Placeholder] = useCellValues(audioPlaceholder$);
  const [EditAudioToolbar] = useCellValues(editAudioToolbarComponent$);
  const [disableSettingsButton] = useCellValues(disableAudioSettingsButton$);
  const [audioPreviewHandler] = useCellValues(audioPreviewHandler$);
  const [previewSrc, setPreviewSrc] = React.useState(src);
  const [isSelected] = useLexicalNodeSelection(nodeKey);

  React.useEffect(() => {
    if (audioPreviewHandler && src.startsWith('./')) {
      audioPreviewHandler(src)
        .then((blobUrl) => {
          setPreviewSrc(blobUrl);
        })
        .catch((err) => {
          console.error('[AudioEditor] Preview handler error:', err);
          setPreviewSrc(src);
        });
    } else {
      setPreviewSrc(src);
    }
  }, [src, audioPreviewHandler]);

  const isLocal = src.startsWith('./');
  const initialAudioPath = isLocal ? src : null;
  const shouldShowToolbar =
    isSelected && !disableSettingsButton && EditAudioToolbar;

  return (
    <React.Suspense fallback={Placeholder ? <Placeholder /> : null}>
      <div
        style={{ position: 'relative', display: 'inline-block', width: '100%' }}
      >
        <AudioComponent src={previewSrc} title={title} nodeKey={nodeKey} />
        {shouldShowToolbar && (
          <EditAudioToolbar
            nodeKey={nodeKey}
            audioSource={src}
            initialAudioPath={initialAudioPath}
            title={title || ''}
            rest={rest}
          />
        )}
      </div>
    </React.Suspense>
  );
}
