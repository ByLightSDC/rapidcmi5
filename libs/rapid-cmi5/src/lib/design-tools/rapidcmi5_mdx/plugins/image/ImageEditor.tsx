import React, { useContext, useEffect, useState } from 'react';

import type { BaseSelection, LexicalEditor } from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { useCellValues } from '@mdxeditor/gurx';
import classNames from 'classnames';
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
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxAttributeValueExpression,
} from 'mdast-util-mdx-jsx';
import {
  disableImageResize$,
  editImageToolbarComponent$,
  imagePlaceholder$ as imagePlaceholderComponent$,
  imagePreviewHandler$,
} from './index';
import styles from './styles/image-plugin.module.css';
import { readOnly$ } from '@mdxeditor/editor';
import { $isImageNode } from './ImageNode';
import ImageResizer from './ImageResizer';
import { GitContext } from '../../../course-builder/GitViewer/session/GitContext';
import { useSelector } from 'react-redux';
import { debugLogError, editorInPlayback$ } from '@rapid-cmi5/ui/branded';
import { currentAuPath } from '../../../../redux/courseBuilderReducer';

const BROKEN_IMG_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(/* xml */ `
    <svg id="imgLoadError" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="red" stroke-width="4" stroke-dasharray="4" />
      <text x="50" y="55" text-anchor="middle" font-size="20" fill="red">⚠️</text>
    </svg>
`);

export interface ImageEditorProps {
  nodeKey: string;
  src: string;
  alt?: string;
  title?: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  href?: string;
}

// https://css-tricks.com/pre-caching-image-with-react-suspense/
const imgCache = {
  __cache: {} as Record<string, string | Promise<void>>,
  read(src: string) {
    if (!this.__cache[src]) {
      this.__cache[src] = new Promise<void>((resolve) => {
        const img = new Image();

        img.onerror = () => {
          this.__cache[src] = BROKEN_IMG_URI;
          resolve();
        };

        img.onload = () => {
          this.__cache[src] = src;
          resolve();
        };

        img.src = src;
      });
    }

    if (this.__cache[src] instanceof Promise) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal, @typescript-eslint/only-throw-error
      throw this.__cache[src];
    }
    return this.__cache[src] as string;
  },
};

/**
 * Take a CSS string and return a React CSS properties object.
 * @param cssString
 */
function parseCssString(
  cssString: string | MdxJsxAttributeValueExpression | null | undefined,
): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (!cssString || typeof cssString !== 'string') {
    return style;
  }

  cssString.split(';').forEach((declaration) => {
    const parts = declaration.split(':').map((p) => p.trim());
    if (parts.length === 2) {
      const propName = parts[0];
      const propValue = parts[1];

      // convert kebab-case to camelCase for React's style prop
      const camelCasePropName = propName.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase(),
      );

      // TODO: this is very simple parsing. Is something more robust needed?
      (style as any)[camelCasePropName] = propValue;
    }
  });

  return style;
}

function LazyImage({
  title,
  alt,
  className,
  imageRef,
  src,
  width,
  height,
  rest,
  style,
}: {
  title: string;
  alt: string;
  className: string | null;
  imageRef: { current: null | HTMLImageElement };
  src: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  style?: React.CSSProperties;
}) {
  const [url, setUrl] = useState<string>(src);

  const { getLocalFileBlobUrl, isFsLoaded } = useContext(GitContext);

  const imageDir = useSelector(currentAuPath);

  // if images are local, handle that situation
  useEffect(() => {
    setUrl(src);

    if (!src.startsWith('./') && !src.startsWith('../')) {
      return;
    }

    if (!imageDir) {
      debugLogError('No lesson au path dir');
      return;
    }

    let loadAttemptCtr = 0;
    const MAX_LOAD_ATTEMPTS = 2;

    // Note: When a user uploads a new image, the LazyImage can be displayed
    // before the upload exists locally. Thus, it is necessary to do another
    // attempt in loading the local image.
    const loadImage = async () => {
      const blobUrl = await getLocalFileBlobUrl?.(src, imageDir);
      if (!blobUrl && loadAttemptCtr < MAX_LOAD_ATTEMPTS) {
        setTimeout(() => {
          // console.log('load image attempt', loadAttemptCtr);
          loadAttemptCtr++;
          loadImage();
        }, 100);
      } else {
        setUrl(blobUrl ? blobUrl : '');
      }
    };

    if (isFsLoaded) {
      loadImage();
    }
  }, [imageDir, src, getLocalFileBlobUrl]);

  return (
    <img
      className={className ?? undefined}
      alt={alt}
      src={imgCache.read(url)}
      title={title}
      ref={imageRef}
      draggable="false"
      width={width}
      height={height}
      style={style}
    />
  );
}

export function ImageEditor({
  src,
  title,
  alt,
  nodeKey,
  width,
  height,
  rest,
  href,
}: ImageEditorProps): JSX.Element | null {
  const [
    ImagePlaceholderComponent,
    disableImageResize,
    imagePreviewHandler,
    readOnly,
    EditImageToolbar,
    isPlayback,
  ] = useCellValues(
    imagePlaceholderComponent$,
    disableImageResize$,
    imagePreviewHandler$,
    readOnly$,
    editImageToolbarComponent$,
    editorInPlayback$,
  );

  const imageRef = React.useRef<null | HTMLImageElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = React.useState<BaseSelection | null>(null);
  const activeEditorRef = React.useRef<LexicalEditor | null>(null);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [imageSource, setImageSource] = React.useState<string | null>(null);
  const [initialImagePath, setInitialImagePath] = React.useState<string | null>(
    null,
  );

  // determine styles
  // NOTE: wrapper style is required because of the way the image plugin uses
  // an inline-block style
  let styleAttribute: MdxJsxAttribute | undefined;
  let style: React.CSSProperties = {};
  const wrapperStyle: React.CSSProperties = {};
  if (rest) {
    styleAttribute = rest.find(
      (item): item is MdxJsxAttribute =>
        item.type === 'mdxJsxAttribute' && item.name === 'style',
    );

    if (styleAttribute) {
      style = parseCssString(styleAttribute.value);
      // the textAlign property is removed here and instead used on a wrapper div
      if (style.textAlign) {
        wrapperStyle.textAlign = style.textAlign;
        delete style.textAlign;
      }
    }
  }

  const onDelete = React.useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
      }
      return false;
    },
    [isSelected, nodeKey],
  );

  const onEnter = React.useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [isSelected],
  );

  const onEscape = React.useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [editor, setSelected],
  );

  React.useEffect(() => {
    if (imagePreviewHandler) {
      const callPreviewHandler = async () => {
        if (!initialImagePath) setInitialImagePath(src);
        const updatedSrc = await imagePreviewHandler(src);
        setImageSource(updatedSrc);
      };
      callPreviewHandler().catch((e: unknown) => {
        console.error(e);
      });
    } else {
      setImageSource(src);
    }
  }, [src, imagePreviewHandler, initialImagePath]);

  React.useEffect(() => {
    let isMounted = true;
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (isResizing) {
            return true;
          }
          if (event.target === imageRef.current) {
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
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
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
    setSelected,
  ]);

  const onResizeEnd = (
    nextWidth: 'inherit' | number,
    nextHeight: 'inherit' | number,
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidthAndHeight(nextWidth, nextHeight);
        }
      },
      {
        onUpdate: () => {
          // clear the temporary inline styles after the update
          if (imageRef.current) {
            imageRef.current.style.width = '';
            imageRef.current.style.height = '';
          }
        },
      },
    );
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const draggable = $isNodeSelection(selection);
  const isFocused = isSelected;

  const passedClassName = React.useMemo(() => {
    if (rest.length === 0) {
      return null;
    }
    const className = rest.find(
      (attr) =>
        attr.type === 'mdxJsxAttribute' &&
        (attr.name === 'class' || attr.name === 'className'),
    );
    if (className) {
      return className.value as string;
    }
    return null;
  }, [rest]);

  const imageElement = (
    <LazyImage
      width={width}
      height={height}
      className={classNames(
        {
          [styles['focusedImage']]: isFocused,
        },
        passedClassName,
      )}
      src={imageSource ?? BROKEN_IMG_URI}
      title={title ?? ''}
      alt={alt ?? ''}
      imageRef={imageRef}
      rest={rest}
      style={style}
    />
  );

  const imageWithOptionalLink = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // Prevent link navigation when in edit mode
        if (!readOnly) {
          e.preventDefault();
        }
      }}
      style={{ display: 'inline-block' }}
    >
      {imageElement}
    </a>
  ) : (
    imageElement
  );

  return imageSource !== null ? (
    <React.Suspense
      fallback={
        ImagePlaceholderComponent ? <ImagePlaceholderComponent /> : null
      }
    >
      <div style={wrapperStyle}>
        <div className={styles['imageWrapper']} data-editor-block-type="image">
          <div draggable={draggable}>{imageWithOptionalLink}</div>
          {draggable && isFocused && !disableImageResize && (
            <ImageResizer
              editor={editor}
              imageRef={imageRef}
              onResizeStart={onResizeStart}
              onResizeEnd={onResizeEnd}
            />
          )}
          {!readOnly && !isPlayback && (
            <EditImageToolbar
              nodeKey={nodeKey}
              imageSource={imageSource}
              initialImagePath={initialImagePath}
              title={title ?? ''}
              alt={alt ?? ''}
              rest={rest ?? []}
              width={width === 'inherit' ? undefined : width}
              height={height === 'inherit' ? undefined : height}
              href={href}
            />
          )}
        </div>
      </div>
    </React.Suspense>
  ) : null;
}
