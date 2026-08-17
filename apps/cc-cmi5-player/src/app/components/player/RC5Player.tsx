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
import { useContext, useEffect, useMemo, useState, useRef } from 'react';

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
  QuotesContainerDirectiveDescriptor,
  QuotesContentDirectiveDescriptor,
  StatementsContainerDirectiveDescriptor,
  StatementDirectiveDescriptor,
  useCoursePresentation,
} from '@rapid-cmi5/ui';

import { audioPlugin, videoPlugin } from '@rapid-cmi5/react-editor';
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
import { slideWidth } from '../../redux/auReducer';
import SlideControlBar from './SlideControlBar';
import { useSlideNavigation } from './useSlideNavigation';

/**
 * Rapid CMI5 Visual Editor
 * @returns
 */
function RC5Player() {
  const ref = useRef<MDXEditorMethods>(null);
  const { slideData, activeTab } = useContext(AuManagerContext);
  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const [fullScreenImageStyle, setFullScreenImageStyle] = useState({});
  const themeSel = useSelector(themeColor);
  const [mdxTheme, setMdxTheme] = useState(
    `${themeSel}-theme ${themeSel}-editor nested-editable-${themeSel}`,
  );
  const [slideAnimations, setSlideAnimations] = useState<AnimationConfig[]>([]);
  const slideWidthSel = useSelector(slideWidth);

  const { rc5Theme } = useCoursePresentation();

  const themeClass = useRef(
    `lesson-theme-${Math.random().toString(36).slice(2, 9)}`,
  ).current;

  const slideContentRef = useRef<HTMLDivElement>(null);
  const fullScreenDialogRef = useRef<HTMLDivElement>(null);
  // remembers whatever had focus (usually the image) so it can be restored
  // when the full screen dialog closes
  const fullScreenTriggerRef = useRef<HTMLElement | null>(null);

  // Move focus into the slide region so NVDA starts reading from the top when a slide changes.
  // useEffect listens for activeTab, only fires when the active slide changes.
  useEffect(() => {
    // Wait for the new slide's editor to finish mounting before focusing
    const id = setTimeout(() => {
      // Focus the <main> landmark rather than the Lexical editor element inside
      // it. Both make NVDA read from the top of the slide, but <main> sits
      // BEFORE the editor's focusables, so a single Shift+Tab from here reaches
      // the slide controls. Focusing the editor itself put the controls behind
      // the user's position, effectively burying the WCAG 2.2.2 pause control.
      const el = slideContentRef.current?.querySelector<HTMLElement>(
        '#main-content',
      );
      if (el) {
        // preventScroll stops the page from jumping visually when focus moves.
        el.focus({ preventScroll: true });
      }
    }, 150);
    // Cleanup — if the user switches slides before 150ms is up, cancel the previous timeout.
    return () => clearTimeout(id);
  }, [activeTab]);

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
          QuotesContainerDirectiveDescriptor,
          QuotesContentDirectiveDescriptor,
          StatementsContainerDirectiveDescriptor,
          StatementDirectiveDescriptor,
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
      videoPlugin({
        disableVideoResize: true,
        disableVideoSettingsButton: true,
      }),
      audioPlugin({ disableAudioSettingsButton: true }),
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

          // remember what had focus so it can be restored when the dialog closes
          fullScreenTriggerRef.current =
            document.activeElement as HTMLElement | null;

          // set the full screen image
          setFullScreenImage(src);
        }
      }
    }
  };

  /**
   * create lesson css
   */
  const lessonStyleCss = useMemo(() => {
    const css = generateLessonThemeStyleTag(
      themeClass,
      rc5Theme,
      slideWidthSel,
      true,
    );
    return css;
  }, [themeClass, rc5Theme, slideWidthSel]);

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
   * Move focus into the full screen dialog when it opens, and restore focus
   * to whatever triggered it (usually the image) when it closes. Without
   * this, focus silently stays on the (now hidden) slide image the whole
   * time, which is what left screen readers unable to tell the dialog had
   * opened or closed.
   */
  useEffect(() => {
    if (fullScreenImage) {
      fullScreenDialogRef.current?.focus();
    } else {
      fullScreenTriggerRef.current?.focus();
    }
  }, [fullScreenImage]);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Parse animations from markdown BEFORE loading into editor
   * This runs every time slide content changes
   */
  useEffect(() => {
    if (typeof slideData === 'string') {
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
  const { hasAnimations, isPaused, isComplete, toggle, replay } =
    useAnimationPlayback(slideAnimations, activeTab, true);

  const { canGoPrevious, canGoNext, goToPrevious, goToNext } =
    useSlideNavigation();

  return (
    <>
      <Box
        className={themeClass}
        sx={{
          height: '100%',
          // The slide controls are position:fixed, so they no longer occupy
          // space in the flow. Reserve room at the bottom so the end of a long
          // slide can still be scrolled clear of the bar.
          pb: '72px',
        }}
        onClick={onClickSlide}
        ref={editorContainerRef}
      >
        {rc5Theme && <style>{lessonStyleCss}</style>}
        {thePlugins && thePlugins.length > 0 && (
          <div role="tabpanel" aria-label="Slide content" ref={slideContentRef}>
            <div id="toc-portal-target" />
            {/*
              Slide controls come immediately AFTER the <main> landmark.
              On slide change focus is placed on <main> (see the effect above),
              so this ordering makes the controls the very next forward Tab stop
              — the pause control required by WCAG 2.2.2 is reachable with one
              Tab instead of being buried behind the slide's content.
            */}
            {/* Add main landmark for ease of nav and skip link to use */}
            <main id="main-content" tabIndex={-1}>
              <MDXEditor
                className={mdxTheme}
                ref={ref}
                markdown={''}
                plugins={thePlugins}
                readOnly={true}
                key={activeTab}
              />
            </main>
            <SlideControlBar
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              onPrevious={goToPrevious}
              onNext={goToNext}
              hasAnimations={hasAnimations}
              isPaused={isPaused}
              isComplete={isComplete}
              onTogglePause={toggle}
              onReplay={replay}
            />
          </div>
        )}
      </Box>
      {fullScreenImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image"
          ref={fullScreenDialogRef}
          tabIndex={-1}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            setFullScreenImage('');
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            // there's nothing else to tab to in here, so keep focus in the
            // dialog rather than letting it wander into the hidden slide behind it
            if (e.key === 'Tab') {
              e.preventDefault();
              fullScreenDialogRef.current?.focus();
            }
          }}
          id="full screen"
          style={{
            backgroundColor: '#000000',
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
            color="common.white"
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
