import React, {
  ImgHTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Markdown from 'react-markdown';

import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
// import 'katex/dist/katex.min.css';

import { AuContextProps } from '@rapid-cmi5/types/cmi5';

import { customMarkdownParser } from '../markdown/MarkDownParser';
import { imagePlugin } from '../markdown/ImagePlugin';
import { customRemarkPlugin } from '../markdown/CustomPlugIn';

import '../markdown/toc.css';
import { remarkAdmonitions } from '../markdown/AdmonitionsPlugIn';
import { debugPlugin, linkPlugin } from '../markdown/LinkPlugin';
import { markDownSlideStyle } from '../markdown/styles';
import { SxProps, Typography } from '@mui/material';
import { debounce } from 'lodash';

const minContentHeight = 480;

/**
 * AuSourceDocSlide
 * renders a slide that embeds both markdown and an iFrame with sourceDoc property
 * @param auProps
 * @returns
 */
export function AuSourceDocSlide({
  auProps,
  introContent,
  sourceDoc,
  styleProps = { minHeight: minContentHeight },
  isSplitPanelShown,
  slideTop,
  slideRight,
  slideWidth,
  slideHeight,
}: {
  auProps?: AuContextProps;
  introContent?: string;
  sourceDoc: string;
  styleProps?: any;
  isSplitPanelShown?: boolean;
  slideTop?: number;
  slideRight?: number;
  slideWidth: number;
  slideHeight: number;
}) {
  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const fontSize = !isSplitPanelShown ? 'prose-lg' : 'prose-md';
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const observerRef = useRef<any>(null);

  const lookupState = useRef<{ [key: string]: boolean | number }>({
    accordion: true,
    accordions: 0,
    slideTop: 0,
    slideHeight: 0,
    slideWidth: 0,
  });

  /**
   * Resize Image full screen
   * @param event
   */
  const onClickSlide = (event: any) => {
    if (event.target.nodeName === 'IMG') {
      event.stopPropagation();
      const srcAttr = event.target.attributes['src'];
      //TODO const styleAttr = event.target.attributes['style'];
      if (srcAttr) {
        setFullScreenImage(srcAttr.value);
      }
    }
  };

  /**
   * wacky work arounds for dynamic content not always resizing properly
   */
  const theStyleProps = {
    marginTop: '32px', //TODO why can't this be 4 like markdown. In Markdownslide, a <p> tag is getting inserted by the renderer
    minWidth: 600,
  };

  /**
   * we would normally unobserve, but we cant do to this
   * https://github.com/w3c/csswg-drafts/issues/5155
   */
  useEffect(() => {
    return () => {
      //don't do this frameRef.current = null;
      if (observerRef.current) {
        //REF console.log('UNMOUNT observerRef.current', observerRef.current);
        //REF observerRef.current.unobserve(frameRef.current.contentWindow.document.body);
        observerRef.current.disconnect();
      }
    };
  }, []);

  /**
   * UE records slide dimensions
   */
  useEffect(() => {
    lookupState.current['slideTop'] = slideTop || 0;
    lookupState.current['slideWidth'] = slideWidth || 0;
    lookupState.current['slideHeight'] = slideHeight || 0;
  }, [slideTop, slideWidth, slideHeight]);

  // without minWidth set, content with auto fit width to text only and will not grow to allow tables to be as wide as they cn be before scrolling
  return (
    <>
      <div
        id="source-doc-slide"
        className={`prose prose-invert max-w-[1440px] ${fontSize} w-full mx-auto`} //very important style for headers
        style={theStyleProps}
        onClick={onClickSlide}
      >
        {introContent && (
          <>
            {markDownSlideStyle}
            <Markdown
              remarkPlugins={[
                linkPlugin,
                imagePlugin,
                remarkGfm,
                remarkMath,
                remarkAdmonitions,
                remarkDirective,
                customRemarkPlugin,
              ]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={customMarkdownParser(auProps, lookupState)}
            >
              {introContent}
            </Markdown>
          </>
        )}
        <iframe
          scrolling="no"
          ref={frameRef}
          width="100%"
          height={slideHeight * 0.8}
          //REF height is calculated
          title="iframe-slide"
          srcDoc={sourceDoc}
          onLoad={() => {
            //REF console.log('on load');
            //REF console.log('frameRef.current', frameRef.current);
            if (frameRef.current && frameRef.current.contentWindow) {
              //REF console.log('content exists');

              // REF Debounce
              // const observer = new ResizeObserver(
              //   debounce((entries) => {
              //     const entry = entries[0];
              //     //REF console.log('new height', entry.contentRect.height);
              //     if (frameRef.current) {
              //       frameRef.current.height =
              //         Math.max(480, entry.contentRect.height + 100) + 'px';
              //       // NO frameRef.current.width = entry.contentRect.width + 0 + 'px';
              //     }
              //   }),
              // );

              const observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                //REF console.log('new height', entry.contentRect.height);
                if (frameRef.current) {
                  frameRef.current.height =
                    Math.max(minContentHeight, entry.contentRect.height + 100) +
                    'px';
                  // NO frameRef.current.width = entry.contentRect.width + 0 + 'px';
                }
              });

              const element = frameRef.current.contentWindow.document.body;
              //REF console.log('observerRef.current', observerRef.current);
              //REF console.log('element to observe', element);

              if (element) {
                // NO frameRef.current.width = element.scrollWidth + 'px';
                frameRef.current.height = element.scrollHeight + 100 + 'px';
                frameRef.current.height =
                  Math.max(minContentHeight, element.scrollHeight + 100) + 'px';
              }
              if (!observerRef.current && element) {
                //REF console.log('element to observe', element);
                observerRef.current = observer;
                observer.observe(element);
              }
            }
          }}
        ></iframe>
      </div>
      {fullScreenImage && (
        <div
          onClick={(e: any) => {
            e.stopPropagation();
            setFullScreenImage('');
          }}
          id="full screen"
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: 'black',
            width: '100vw',
            height: '100vh',
            left: 0,
            top: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* image will not scale beyond is source dimensions which prevents pixelation
              user should include images with the highest resolution they wish to display
              and use style tag to shrink inline, when not full screen */}
          <img
            style={{ display: 'block', margin: 'auto', maxHeight: '96%' }}
            src={fullScreenImage}
            alt="Full Screen"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ padding: '6px', position: 'absolute', left: 0, bottom: 0 }}
          >
            Click Anywhere to Close
          </Typography>
        </div>
      )}
    </>
  );
}

export default AuSourceDocSlide;
