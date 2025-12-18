import { useEffect, useRef, useState } from 'react';

// import 'katex/dist/katex.min.css';

import { AuContextProps } from '@rapid-cmi5/types/cmi5';

import { Typography } from '@mui/material';
import { MarkdownConvertorSlide } from './MarkdownConvertor';
import { markDownSlideStyle } from './styles';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const h = require('hastscript');

/**
 * AuMarkDownSlide
 * @param auProps
 * @returns
 */
export function AuMarkDownSlide({
  auProps,
  content,
  isSplitPanelShown,
  slideTop,
  slideRight,
  slideWidth,
  slideHeight,
}: {
  auProps?: AuContextProps;
  content: string;
  isSplitPanelShown?: boolean;
  slideTop?: number;
  slideRight?: number;
  slideWidth?: number;
  slideHeight?: number;
}) {
  // NOTE we pass content separately to force re-render when content string changes

  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const fontSize = !isSplitPanelShown ? 'prose-lg' : 'prose-md';

  const lookupState = useRef<{ [key: string]: boolean | number }>({
    accordion: true,
    accordions: 0,
    slideTop: 0,
    slideHeight: 0,
    slideWidth: 0,
  });

  /**
   * Set up an event listener for the ESC key.
   * Clean up the event listener properly on unmount.
   */
  useEffect(() => {
    // handle a press of the ESC key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullScreenImage('');
      }
    };

    // listen for a keydown event
    window.addEventListener('keydown', handleKeyDown);

    // return a function to clean up the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        // don't set the image to full screen if the image is the child of an
        // anchor tag
        const parentElement = event.target.parentElement;
        if (parentElement && parentElement.tagName === 'A') {
          return;
        }

        setFullScreenImage(srcAttr.value);
      }
    }
  };

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
        id="markdown-slide"
        className={`prose prose-invert max-w-[1440px] ${fontSize} w-full mx-auto`}
        style={{
          marginTop: '4px',
          // minWidth: slideWidth * 0.8
        }}
        onClick={onClickSlide}
      >
        {markDownSlideStyle}
        <MarkdownConvertorSlide
          markdown={content}
          auProps={auProps}
          lookupState={lookupState}
        />
        <div style={{ paddingBottom: 20 }} />
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

export default AuMarkDownSlide;
