import React, { useState } from 'react';
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

const BROKEN_IMG_URI =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(/* xml */ `
    <svg id="imgLoadError" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect x="0" y="0" width="100" height="100" fill="none" stroke="red" stroke-width="4" stroke-dasharray="4" />
      <text x="50" y="55" text-anchor="middle" font-size="20" fill="red">⚠️</text>
    </svg>
`);

export interface ImageViewerProps {
  src: string;
  alt?: string;
  title?: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
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
}: {
  title: string;
  alt: string;
  className: string | null;
  src: string;
  width: number | 'inherit';
  height: number | 'inherit';
  rest: (MdxJsxAttribute | MdxJsxExpressionAttribute)[];
  style?: React.CSSProperties;
}) {
  const [url] = useState<string>(src);

  return (
    <img
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
  width,
  height,
  rest,
}: ImageViewerProps): JSX.Element | null {
  const [ImagePlaceholderComponent, imagePreviewHandler] = useCellValues(
    imagePlaceholderComponent$,
    imagePreviewHandler$,
  );

  const [imageSource, setImageSource] = React.useState<string | null>(null);

  // determine styles
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

  React.useEffect(() => {
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
      (attr) =>
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
      <div style={wrapperStyle}>
        <div className={styles['imageWrapper']} data-editor-block-type="image">
          <LazyImage
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
