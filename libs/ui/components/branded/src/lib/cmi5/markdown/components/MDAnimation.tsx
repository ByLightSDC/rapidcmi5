import React, { useEffect, useRef, useState } from 'react';
import uniqid from 'uniqid';
import { SlideTrigger } from '../constants/SlideTriggers';
import { useItemVisibleInBounds } from '@rangeos-nx/ui/branded';
import anime from 'animejs/lib/anime';
import { SlideEvent } from '../constants/SlideEvents';

/**
 * A component that allows for an element in markdown to be animated.
 *
 * The animation is declared in markdown like so:
 * ::animate[Make me Move]{translateX=300 translateY=400 rotate=360}
 *
 * @param props
 * @constructor
 */
export default function MDAnimation(props: any) {
  const { children, ...rest } = props;
  const animationItemRef = useRef(null);
  // console.log('--------> ', props);

  // use a unique identifier for each animation
  const [uniqueId] = useState(uniqid());
  const id = 'animation-' + uniqueId;
  const targets = '#' + id;

  // how is this animation triggered?
  let trigger = SlideTrigger.None;
  if (props.trigger) {
    trigger = props.trigger;
  }

  const processRestProps = (rest: any) => {
    const processedRest = {};
    for (const key in rest) {
      if (Object.hasOwnProperty.call(rest, key)) {
        const value = rest[key];
        if (typeof value === 'string' && value.includes(',')) {
          (processedRest as any)[key] = value.split(',').map(item => item.trim());
        } else if (typeof value === 'string' && value === 'true') {
          (processedRest as any)[key] = true; // handle booleans
        } else {
          (processedRest as any)[key] = value;
        }
      }
    }
    return processedRest;
  };

  const processedProps = processRestProps(rest);

  // watch for item being visible on screen
  const isVisible = useItemVisibleInBounds(
    animationItemRef,
    null,
    '2px',
    (isVisible: boolean) => {
      // console.log('visibility changed', id, isVisible);
      if (trigger === SlideTrigger.InView) {
        playAnimation();
      }
    }
  );

  // does this animation trigger from a tag?
  let waitForTag = '';
  if (props.waitForTag) {
    waitForTag = props.waitForTag;
  }

  // does this animation itself have a tag?
  let tag = '';
  if (props.tag) {
    tag = props.tag;
  }

  // play the animation for this component
  const playAnimation = () => {
    // console.log('****** ', processedProps);
    anime({
      targets: targets,
      ...processedProps,
    }).finished.then(() => {
      // console.log('animation complete', id);
      window.dispatchEvent(new CustomEvent(SlideEvent.AnimationComplete, { detail: { tag: tag } }));
    });
  };

  // add listeners appropriate for the trigger type
  useEffect(() => {
    // if trigger type is none, play immediately
    if (trigger === SlideTrigger.None) {
      playAnimation();
    }

    // handle a button click
    const handleMarkdownButtonClick = (e: any) => {
      if (e.detail && e.detail.tag) {
        const tag = e.detail.tag;
        // console.log('tag', tag);

        if (tag !== props.waitForTag) {
          return;
        }

        playAnimation();
      }
    };

    // handle a slide click
    const handleSlideClick = (e: any) => {
      // console.log('slide clicked', e);
      playAnimation();
    };

    // handle animation complete
    const handleAnimationComplete = (e: any) => {
      // console.log('======> animation complete', e);
      if (e.detail && e.detail.tag && e.detail.tag === waitForTag) {
        playAnimation();
      }
    };

    // add event listeners appropriate for the trigger type
    if (trigger === SlideTrigger.ButtonClick) {
      window.addEventListener(SlideEvent.ButtonClick, handleMarkdownButtonClick);
    } else if (trigger === SlideTrigger.SlideClick) {
      window.addEventListener(SlideEvent.SlideClick, handleSlideClick);
    } else if (trigger === SlideTrigger.TagComplete) {
      window.addEventListener(SlideEvent.AnimationComplete, handleAnimationComplete);
    }

    // clean up any event listeners or timers
    return () => {
      if (trigger === SlideTrigger.ButtonClick) {
        window.removeEventListener(SlideEvent.ButtonClick, handleMarkdownButtonClick);
      } else if (trigger === SlideTrigger.SlideClick) {
        window.removeEventListener(SlideEvent.SlideClick, handleSlideClick);
      } else if (trigger === SlideTrigger.TagComplete) {
        window.removeEventListener(SlideEvent.AnimationComplete, handleAnimationComplete);
      }
    }
  }, [playAnimation, props.waitForTag, trigger, waitForTag]);

  return (
    <div
      id={id}
      ref={animationItemRef}
      style={{
        // width: 'fit-content',
        // height: 'fit-content',
        display: 'inline-block',
      }}
      onClick={(e) => {
        e.stopPropagation();
        // console.log('clicked animation', props);

        if (trigger === SlideTrigger.ItemClick) {
          playAnimation();
        }
      }}
    >
      {children}
    </div>
  );
}
