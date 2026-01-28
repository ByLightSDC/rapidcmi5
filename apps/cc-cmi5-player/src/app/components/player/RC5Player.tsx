import {
  MDXEditor,
  MDXEditorMethods,
  toolbarPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  directivesPlugin,
  frontmatterPlugin,
  quotePlugin,
  AdmonitionDirectiveDescriptor,
  CodeMirrorEditor,
  codeMirrorPlugin,
  headingsPlugin,
} from '@mdxeditor/editor';
import { imagePlayerPlugin } from './plugins/image-player/';

import '@mdxeditor/editor/style.css';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';


import { RC5PlayerToolbar } from './RC5PlayerToolbar';
import { ActivityDirectiveDescriptor } from './editors/directives/ActivityDirectiveDescriptor';
import { AuManagerContext } from '../../session/AuManager';
import { kebabToCamel } from '../../utils/StringUtils';
import { githubDark } from '@uiw/codemirror-theme-github';
import { LayoutBoxDirectiveDescriptor } from './editors/directives/LayoutBoxDirectiveDescriptor';
import { debugLog, debugLogError, logger } from '../../debug';
import { AnimationConfig, mathPlugin, MathDescriptor, MathCodeBlockDescriptor, AccordionDirectiveDescriptor, AccordionContentDirectiveDescriptor, FxDirectiveDescriptor, AnimDirectiveDescriptor, YoutubeDirectiveDescriptor, TabsDirectiveDescriptor, TabContentDirectiveDescriptor, ImageLabelDirectiveDescriptor, languageList, footnotePlugin, FootnoteDefinitionDescriptor, FootnoteReferenceDescriptor, htmlPlugin, onCheckClickOutsideImageLabel } from '@rapid-cmi5/ui';
import { animationPlayerPlugin, parseFrontmatterAnimations, useAnimationPlayback } from './plugins/animation-player';
import { mediaEventManager } from '../../utils/MediaEventManager';

/**
 * Rapid CMI5 Visual Editor
 * @returns
 */
function RC5Player() {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { slideData, activeTab } = useContext(AuManagerContext);
  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const [fullScreenImageStyle, setFullScreenImageStyle] = useState({});
  const [slideAnimations, setSlideAnimations] = useState<AnimationConfig[]>([]);

  const pixelTop = '40px';

  const thePlugins = useMemo(() => {
    const initialList = [
      frontmatterPlugin(), // CRITICAL: Hide frontmatter (animations, etc) from rendering
      mathPlugin({ mathEditorDescriptors: [MathDescriptor] }),
      codeBlockPlugin({
        defaultCodeBlockLanguage: 'js',
        codeBlockEditorDescriptors: [
          MathCodeBlockDescriptor,
          {
            priority: -10,
            match: (_) => true,
            Editor: CodeMirrorEditor,
          },
        ],
      }),
      directivesPlugin({
        directiveDescriptors: [
          AccordionDirectiveDescriptor,
          AccordionContentDirectiveDescriptor,
          AdmonitionDirectiveDescriptor,
          ActivityDirectiveDescriptor,
          FxDirectiveDescriptor,
          AnimDirectiveDescriptor,
          YoutubeDirectiveDescriptor,
          LayoutBoxDirectiveDescriptor,
          TabsDirectiveDescriptor,
          TabContentDirectiveDescriptor,
          ImageLabelDirectiveDescriptor,
        ],
      }),
      codeMirrorPlugin({
        codeBlockLanguages: languageList,
        codeMirrorExtensions: [githubDark],
      }),
      footnotePlugin({
        footnoteDefinitionEditorDescriptors: [FootnoteDefinitionDescriptor],
        footnoteReferenceEditorDescriptors: [FootnoteReferenceDescriptor],
      }),
      headingsPlugin(),
      htmlPlugin(),
      imagePlayerPlugin(),
      animationPlayerPlugin(),
      listsPlugin(),
      linkPlugin(),
      linkDialogPlugin({
        onReadOnlyClickLinkCallback(e, _node, url) {
          //this fxn overrides built in behavior
          //opens link NOT in new tab instead of replacing CMI5 player app window
          e.preventDefault();
          window.open(url, '_blank', 'noreferrer');
        },
      }),
      quotePlugin(),
      tablePlugin(),
      thematicBreakPlugin(),
      toolbarPlugin({
        toolbarClassName: 'mdxeditor-preview-toolbar',
        toolbarContents: () => <RC5PlayerToolbar />,
      }),
    ];
    return initialList;
  }, []);

  /**
   * Resize Image full screen
   * @param event
   */
  const onClickSlide = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const id = target?.id ?? null;

    if (!target || !id) {
      return;
    }

    // image labels covers image width and height 100%
    if (target.nodeName === 'DIV' && id && id.startsWith('image-labels')) {
      event.stopPropagation();

      const imageId = id.replace('image-labels-', '');
      debugLog('clicked imageId', imageId);

      if (onCheckClickOutsideImageLabel(imageId)) {
        // clickoutside of open label content so block full screen
        return;
      }
      const imgEl = document.getElementById(imageId);
      if (imgEl) {
        const src = imgEl.getAttribute('src');
        const styleObj = imgEl.style;
        if (src) {
          //check whether to go fullscreen 

          // don't set the image to full screen if the image is the child of an
          // anchor tag
          const hasAnchorAncestor = imgEl.closest('a') !== null;
          if (hasAnchorAncestor) {
            return;
          }

          // set the style of the full screen image if it exists on the image that
          // was clicked
          if (styleObj) {
            // create a usable object of style properties
            const inlineStyles: Record<string, string> = {};
            for (let i = 0; i < styleObj.length; i++) {
              const propName = styleObj.item(i);
              const propNameCamelCase = kebabToCamel(styleObj.item(i));
              const propValue = styleObj.getPropertyValue(propName);
              if (propValue) {
                inlineStyles[propNameCamelCase] = propValue;
              }
            }

            setFullScreenImageStyle(inlineStyles);
          } else {
            setFullScreenImageStyle({});
          }

          // set the full screen image
          setFullScreenImage(src);
        }
      }
    }
  };

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

  const editorContainerRef = React.useRef<HTMLDivElement>(null);

  /**
   * Parse animations from markdown BEFORE loading into editor
   * This runs every time slide content changes
   */
  useEffect(() => {
    if (typeof slideData === 'string') {
      console.log('🔄 Slide changed, parsing animations...');
      const animations = parseFrontmatterAnimations(slideData);
      setSlideAnimations(animations);
    } else {
      setSlideAnimations([]);
    }
  }, [slideData, activeTab]);

  /**
   * Inject markdown into editor and reset focus
   */
  useEffect(() => {
    if (ref.current) {
      if (typeof slideData !== 'string') {
        debugLogError('Attempting to inject non string data into MdxEditor');
        ref.current.setMarkdown('This slide data could not be presented ');
      } else {
        ref.current.setMarkdown(slideData);
      }
      ref.current?.focus();
    }
  }, [slideData]);

  /**
   * Attach media event listeners after slide content renders
   * This enables audio/video playback tracking for LRS events
   */
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered after MDX content loads
    const timeoutId = setTimeout(() => {
      logger.debug(
        `Attaching media event listeners for slide ${activeTab}`,
        undefined,
        'media',
      );
      mediaEventManager.attachMediaEventListeners();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [slideData, activeTab]);

  // Use the animation playback hook with parsed animations
  useAnimationPlayback(slideAnimations, activeTab, true);

  return (
    <>
      <Box
        sx={{ marginTop: pixelTop, height: `calc(100vh - ${pixelTop})` }}
        onClick={onClickSlide}
        ref={editorContainerRef}
      >
        {thePlugins && thePlugins.length > 0 && (
          <MDXEditor
            className="dark-theme dark-editor"
            ref={ref}
            markdown={''}
            plugins={thePlugins}
            readOnly={true}
            key={activeTab}
          />
        )}
      </Box>
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
            style={{
              ...fullScreenImageStyle,
              display: 'block',
              margin: 'auto',
              maxHeight: '96%',
            }}
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

export default RC5Player;
