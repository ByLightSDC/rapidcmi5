import React, { useEffect, useState } from 'react';
import { useCellValues } from '@mdxeditor/gurx';
import classNames from 'classnames';
import { MdxJsxAttribute, MdxJsxExpressionAttribute } from 'mdast-util-mdx-jsx';

import { imagePlaceholder$ as imagePlaceholderComponent$ } from './index';
import styles from './styles/image-plugin.module.css';
import { imagePreviewHandler$, imgCache, parseCssString } from '@rapid-cmi5/ui';

import Tooltip from '@mui/material/Tooltip';
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
  isLinked,
  onFullscreenHintVisibilityChange,
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
  isLinked: boolean;
  onFullscreenHintVisibilityChange: (visible: boolean) => void;
}) {
  const [url] = useState<string>(src);

  return (
    <img
      id={id}
      className={className ?? undefined}
      alt={alt}
      aria-label={isLinked ? undefined : `${alt}. Click to view full screen.`}
      src={imgCache.read(url)}
      title={title}
      draggable="false"
      width={width}
      height={height}
      style={style}
      // linked images already navigate via the surrounding <a> on click/enter,
      // so only non-linked images get the full-screen keyboard trigger + warning
      tabIndex={isLinked ? undefined : 0}
      onKeyDown={
        isLinked
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                document.getElementById(`image-labels-${id}`)?.click();
              }
            }
      }
      // keyboard focus lands on the image itself (it sits under the overlay),
      // so the overlay's tooltip is shown/hidden in sync with focus here too
      onFocus={
        isLinked ? undefined : () => onFullscreenHintVisibilityChange(true)
      }
      onBlur={
        isLinked ? undefined : () => onFullscreenHintVisibilityChange(false)
      }
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
  const [imageSource, setImageSource] = React.useState<string | null>(null);
  // images inside a link already navigate on click/enter and get their
  // accessible name from the alt text, so they don't need the full-screen
  // button/tooltip treatment. The overlay div is only rendered once
  // imageSource resolves, so a callback ref is used instead of a mount
  // effect, which would run before the div exists and never fire again.
  const [isLinked, setIsLinked] = React.useState(false);
  const labelsRef = React.useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setIsLinked(node.closest('a') != null);
    }
  }, []);
  // the tooltip's child (the overlay) only ever gets mouse hover, since
  // keyboard focus lands on the <img> underneath it - control the tooltip's
  // open state directly so both trigger it
  const [showFullscreenHint, setShowFullscreenHint] = React.useState(false);

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
          {isLinked ? (
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
          ) : (
            <Tooltip title="Click to view full screen" open={showFullscreenHint}>
              <div
                id={`image-labels-${id}`}
                ref={labelsRef}
                aria-hidden="true"
                onMouseEnter={() => setShowFullscreenHint(true)}
                onMouseLeave={() => setShowFullscreenHint(false)}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Tooltip>
          )}
          <LazyImage
            id={id}
            width={width}
            height={height}
            className={classNames(passedClassName)}
            src={imageSource}
            title={title ?? ''}
            alt={alt ?? ''}
            isLinked={isLinked}
            onFullscreenHintVisibilityChange={setShowFullscreenHint}
            rest={rest}
            style={style}
          />
        </div>
      </div>
    </React.Suspense>
  ) : null;
}
