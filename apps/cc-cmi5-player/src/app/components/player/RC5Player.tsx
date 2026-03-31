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
} from '@mdxeditor/editor';
import { imagePlayerPlugin } from './plugins/image-player/';
import { ariaOverridePlugin } from './plugins/aria-override/ariaOverridePlugin';
import {
  animationPlayerPlugin,
  parseFrontmatterAnimations,
  useAnimationPlayback,
} from './plugins/animation-player';
import '@mdxeditor/editor/style.css';
import React, { useContext, useEffect, useMemo, useState, useRef } from 'react';

import { Box, Typography } from '@mui/material';
import {
  AdmonitionDirectiveDescriptor,
  codeMirrorPlugin,
  debugLogError,
  YoutubeDirectiveDescriptor,
  headingsPlugin,
  footnotePlugin,
  FootnoteDefinitionDescriptor,
  FootnoteReferenceDescriptor,
  mathPlugin,
  MathDescriptor,
  MathCodeBlockDescriptor,
  languageList,
  htmlPlugin,
  CodeMirrorEditor,
  FxDirectiveDescriptor,
  AnimDirectiveDescriptor,
  InlineAnimDirectiveDescriptor,
  TabsDirectiveDescriptor,
  TabContentDirectiveDescriptor,
  AccordionDirectiveDescriptor,
  AccordionContentDirectiveDescriptor,
  ImageLabelDirectiveDescriptor,
  onCheckClickOutsideImageLabel,
  debugLog,
  AnimationConfig,
  themeColor,
  ImageTextDirectiveDescriptor,
  generateLessonThemeStyleTag,
  StepsDirectiveDescriptor,
  StepContentDirectiveDescriptor,
  LessonThemeContext,
} from '@rapid-cmi5/ui';

import { RC5PlayerToolbar } from './RC5PlayerToolbar';
import { ActivityDirectiveDescriptor } from './editors/directives/ActivityDirectiveDescriptor';
import { AuManagerContext } from '../../session/AuManager';
import { kebabToCamel } from '../../utils/StringUtils';
import { LayoutBoxDirectiveDescriptor } from './editors/directives/LayoutBoxDirectiveDescriptor';
import { GridContainerDirectiveDescriptor } from './editors/directives/GridContainerDirectiveDescriptor';
import { GridCellDirectiveDescriptor } from './editors/directives/GridCellDirectiveDescriptor';
import { mediaEventManager } from '../../utils/MediaEventManager';
import { logger } from '../../debug';
import { useSelector } from 'react-redux';
import { auJsonSel } from '../../redux/auReducer';

/**
 * Rapid CMI5 Visual Editor
 * @returns
 */
function RC5Player() {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { slideData, activeTab } = useContext(AuManagerContext);
  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const [fullScreenImageStyle, setFullScreenImageStyle] = useState({});
  const themeSel = useSelector(themeColor);
  const [mdxTheme, setMdxTheme] = useState(
    `${themeSel}-theme ${themeSel}-editor nested-editable-${themeSel}`,
  );
  const [slideAnimations, setSlideAnimations] = useState<AnimationConfig[]>([]);
  const auJson = useSelector(auJsonSel);
  const currentLessonTheme = auJson?.lessonTheme;
  const themeClass = useRef(
    `lesson-theme-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const slideContentRef = useRef<HTMLDivElement>(null);

  // Move focus into the slide region so NVDA starts reading from the top when a slide changes.
  // useEffect listens for activeTab, only fires when the active slide changes.
  useEffect(() => {
    //   // Wait for the new slide's editor to finish mounting before focusing
    const id = setTimeout(() => {
      //     // Find the root Lexical editor element (first match = outermost = root editor)
      const el = slideContentRef.current?.querySelector<HTMLElement>(
        '[data-lexical-editor="true"]',
      );
      if (el) {
        //       // tabindex="-1" is required to programmatically focus contenteditable="false"
        el.setAttribute('tabindex', '-1'); // shouldnt need, literally 0 in code now
        //       // Focus so NVDA reads from the top of the new slide.
        //       // preventScroll stops the page from jumping visually when focus moves.
        el.focus({ preventScroll: true }); // put this on slide content container even on tab button.
      }
    }, 150);
    //   // Cleanup — if the user switches slides before 150ms is up, cancel the previous timeout.
    return () => clearTimeout(id);
  }, [activeTab]);

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
          InlineAnimDirectiveDescriptor,
          YoutubeDirectiveDescriptor,
          LayoutBoxDirectiveDescriptor,
          GridContainerDirectiveDescriptor,
          GridCellDirectiveDescriptor,
          StepsDirectiveDescriptor,
          StepContentDirectiveDescriptor,
          TabsDirectiveDescriptor,
          TabContentDirectiveDescriptor,
          ImageLabelDirectiveDescriptor,
          ImageTextDirectiveDescriptor,
        ],
      }),
      codeMirrorPlugin({
        codeBlockLanguages: languageList,
      }),
      footnotePlugin({
        footnoteDefinitionEditorDescriptors: [FootnoteDefinitionDescriptor],
        footnoteReferenceEditorDescriptors: [FootnoteReferenceDescriptor],
      }),
      headingsPlugin(),
      htmlPlugin(),
      imagePlayerPlugin(),
      animationPlayerPlugin(),
      ariaOverridePlugin(),
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
   * Scroll to top when tab changes
   */
  useEffect(() => {
    const el = editorContainerRef.current?.querySelector(
      '.mdxeditor-root-contenteditable',
    ) as HTMLElement | null;
    if (!el) return;

    // walk up to find the nearest scrollable ancestor
    let scroller: HTMLElement | null = el;
    while (scroller) {
      const style = window.getComputedStyle(scroller);
      const overflowY = style.overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') break;
      scroller = scroller.parentElement;
    }

    (scroller ?? el).scrollTo({ top: 0 });
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
  }, [slideData, activeTab]);

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

  /**
   * UE sets mdx theme when MUI theme changes
   */
  useEffect(() => {
    setMdxTheme(
      `${themeSel}-theme ${themeSel}-editor nested-editable-${themeSel}`,
    );
  }, [themeSel]);

  // Use the animation playback hook with parsed animations
  useAnimationPlayback(slideAnimations, activeTab, true);

  return (
    <>
      <Box
        className={themeClass}
        sx={{ marginTop: pixelTop, height: `calc(100vh - ${pixelTop})` }}
        onClick={onClickSlide}
        ref={editorContainerRef}
      >
        {currentLessonTheme && (
          <style>
            {generateLessonThemeStyleTag(themeClass, currentLessonTheme)}
          </style>
        )}
        {thePlugins && thePlugins.length > 0 && (
          <LessonThemeContext.Provider
            value={{ lessonTheme: currentLessonTheme }}
          >
            <div
              role="tabpanel"
              aria-label="Slide content"
              tabIndex={0}
              ref={slideContentRef}
            >
              <div id="toc-portal-target" />
              <MDXEditor
                className={mdxTheme}
                ref={ref}
                markdown={''}
                plugins={thePlugins}
                readOnly={true}
                key={activeTab}
              />
            </div>
          </LessonThemeContext.Provider>
        )}
      </Box>
      {fullScreenImage && (
        <div
          role="dialog"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            setFullScreenImage('');
          }}
          id="full screen"
          style={{
            position: 'absolute',
            zIndex: 9999,
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
