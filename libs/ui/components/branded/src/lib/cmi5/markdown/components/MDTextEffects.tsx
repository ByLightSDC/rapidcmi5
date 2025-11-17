import React, { useState, useRef, useEffect } from 'react';
import { RoughNotation } from 'react-rough-notation';
import { SlideTrigger } from '../constants/SlideTriggers';
import { useItemVisibleInBounds } from '../../../hooks/useItemVisibleInBounds';
import uniqid from 'uniqid';
import { SlideEvent } from '../constants/SlideEvents';

/**
 * A component that allows for a text effect to be added over children.
 * An effect is a notation.
 * A notation is a circle, underline, etc.
 *
 * A notation is created in markdown like so:
 * :fx[my text here]{foo="circle" color="yellow"}
 *
 * The notation is triggered by clicking on the item.
 *
 * @param props
 * @constructor
 */
export default function MDTextEffects(props: any) {
  const { children, ...rest } = props;
  const effectItemRef = useRef(null);

  const autoReveal = rest.autoReveal;
  // NOTE: autoReveal is left in for backwards compatibility. However, with the
  // addition of triggers, a SlideTriggerType.None now means to play immediately
  const [isShow, setIsShow] = useState(autoReveal && autoReveal === 'true');
  const [uniqueId] = useState(uniqid());
  const id = 'effect-' + uniqueId;

  // how is this effect triggered?
  let trigger = SlideTrigger.None;
  if (props.trigger) {
    trigger = props.trigger;
  }

  // does this effect trigger from a tag?
  let waitForTag = '';
  if (props.waitForTag) {
    waitForTag = props.waitForTag;
  }

  // play the effect
  const playEffect = () => {
    setIsShow(true);
  };

  // watch for item being visible on screen
  const isVisible = useItemVisibleInBounds(
    effectItemRef,
    null,
    '2px',
    (isVisible: boolean) => {
      // console.log('visibility changed', id, isVisible);
      if (trigger === SlideTrigger.InView) {
        playEffect();
      }
    },
  );

  // add listeners appropriate for the trigger type
  useEffect(() => {
    // if trigger type is none, play immediately
    if (trigger === SlideTrigger.None) {
      playEffect();
    }

    // handle a button click
    const handleMarkdownButtonClick = (e: any) => {
      if (e.detail && e.detail.tag) {
        const tag = e.detail.tag;
        // console.log('tag', tag);
        if (tag !== props.waitForTag) {
          return;
        }

        playEffect();
      }
    };

    // handle a slide click
    const handleSlideClick = (e: any) => {
      // console.log('slide clicked', e);
      playEffect();
    };

    // handle animation complete
    const handleAnimationComplete = (e: any) => {
      // console.log('======> animation complete', e);
      if (e.detail && e.detail.tag && e.detail.tag === waitForTag) {
        playEffect();
      }
    };

    // add event listeners appropriate for the trigger type
    if (trigger === SlideTrigger.ButtonClick) {
      window.addEventListener(
        SlideEvent.ButtonClick,
        handleMarkdownButtonClick,
      );
    } else if (trigger === SlideTrigger.SlideClick) {
      window.addEventListener(SlideEvent.SlideClick, handleSlideClick);
    } else if (trigger === SlideTrigger.TagComplete) {
      window.addEventListener(
        SlideEvent.AnimationComplete,
        handleAnimationComplete,
      );
    }

    // clean up any event listeners or timers
    return () => {
      if (trigger === SlideTrigger.ButtonClick) {
        window.removeEventListener(
          SlideEvent.ButtonClick,
          handleMarkdownButtonClick,
        );
      } else if (trigger === SlideTrigger.SlideClick) {
        window.removeEventListener(SlideEvent.SlideClick, handleSlideClick);
      } else if (trigger === SlideTrigger.TagComplete) {
        window.removeEventListener(
          SlideEvent.AnimationComplete,
          handleAnimationComplete,
        );
      }
    };
  }, [props.waitForTag, trigger, waitForTag]);

  return (
    <span
      id={id}
      ref={effectItemRef}
      onClick={() => {
        // console.log('clicked on text effect');
        playEffect();
      }}
    >
      <div
        style={{
          display: 'inline-block',
          position: 'relative',
        }}
      >
        <RoughNotation
          getAnnotationObject={(annotation) => {}}
          show={isShow}
          {...rest}
        >
          {children}
        </RoughNotation>
      </div>
    </span>
  );
}
