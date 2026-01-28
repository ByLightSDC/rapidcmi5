import React, { useEffect, useState } from 'react';
import { useCellValues } from '@mdxeditor/gurx';
import classNames from 'classnames';
import {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxAttributeValueExpression,
} from 'mdast-util-mdx-jsx';

import {
  imagePlaceholder$ as imagePlaceholderComponent$,
  imagePreviewHandler$,
} from './index';
import styles from './styles/image-plugin.module.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';

const BROKEN_IMG_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(/* xml */ `
    <svg id="imgLoadError" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="red" stroke-width="4" stroke-dasharray="4" />
      <text x="50" y="55" text-anchor="middle" font-size="20" fill="red">⚠️</text>
    </svg>
`);

export interface ImageViewerProps {
  nodeKey: string;
  src: string;
  alt?: string;
  title?: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  href?: string;
  id?: string; // Unique persistent ID for animation targeting
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
  src,
  width,
  height,
  rest,
  style,
  id,
}: {
  title: string;
  alt: string;
  className: string | null;
  src: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  style?: React.CSSProperties;
  id?: string;
}) {
  const [url] = useState<string>(src);

  return (
    <img
      id={id}
      className={className ?? undefined}
      alt={alt}
      src={imgCache.read(url)}
      title={title}
      draggable="false"
      width={width}
      height={height}
      style={style}
    />
  );
}

export function ImageViewer({
  src,
  title,
  alt,
  nodeKey,
  width,
  height,
  rest,
  href,
  id,
}: ImageViewerProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [ImagePlaceholderComponent, imagePreviewHandler] = useCellValues(
    imagePlaceholderComponent$,
    imagePreviewHandler$,
  );
  const labelsRef = React.useRef<null | HTMLImageElement>(null);
  const [imageSource, setImageSource] = React.useState<string | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  // determine styles
  let styleAttribute: MdxJsxAttribute | undefined;
  let style: React.CSSProperties = {};
  const wrapperStyle: React.CSSProperties = {};
  if (rest) {
    styleAttribute = rest.find(
      (item: any): item is MdxJsxAttribute =>
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

  useEffect(() => {
    if (imagePreviewHandler) {
      const callPreviewHandler = async () => {
        const updatedSrc = await imagePreviewHandler(src);
        setImageSource(updatedSrc);
      };
      callPreviewHandler().catch((e: unknown) => {
        console.error(e);
      });
    } else {
      setImageSource(src);
    }
  }, [src, imagePreviewHandler]);

  const passedClassName = React.useMemo(() => {
    if (rest.length === 0) {
      return null;
    }
    const className = rest.find(
      (attr: any) =>
        attr.type === 'mdxJsxAttribute' &&
        (attr.name === 'class' || attr.name === 'className'),
    );
    if (className) {
      return className.value as string;
    }
    return null;
  }, [rest]);

  return imageSource !== null ? (
    <React.Suspense
      fallback={
        ImagePlaceholderComponent ? <ImagePlaceholderComponent /> : null
      }
    >
      <div id="image-styles" style={wrapperStyle}>
        <div
          id="image-wrapper"
          className={styles['imageWrapper']}
          data-editor-block-type="image"
        >
          <div
            id={`image-labels-${id}`}
            ref={labelsRef}
            style={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
          <LazyImage
            id={id}
            width={width}
            height={height}
            className={classNames(passedClassName)}
            src={imageSource}
            title={title ?? ''}
            alt={alt ?? ''}
            rest={rest}
            style={style}
          />
        </div>
      </div>
    </React.Suspense>
  ) : null;
}
