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

} from './index';
import styles from './styles/image-plugin.module.css';
import { imagePreviewHandler$ } from 'packages/ui/src/lib/cmi5/mdx/plugins/image/methods';
import { BROKEN_IMG_URI, imgCache, parseCssString } from '@rapid-cmi5/ui';



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
 
  const [ImagePlaceholderComponent, imagePreviewHandler] = useCellValues(
    imagePlaceholderComponent$,
    imagePreviewHandler$,
  );
  const labelsRef = React.useRef<null | HTMLImageElement>(null);
  const [imageSource, setImageSource] = React.useState<string | null>(null);

  // determine styles
  let styleAttribute: MdxJsxAttribute | undefined;
  let style: React.CSSProperties = {};
  const wrapperStyle: React.CSSProperties = {};
  if (rest) {
    styleAttribute = rest.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
