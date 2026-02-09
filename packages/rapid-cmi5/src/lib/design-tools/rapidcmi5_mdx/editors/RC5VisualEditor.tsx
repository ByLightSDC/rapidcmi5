import './RC5VisualEditor.css';
import '../plugins/animation/styles/animationIndicators.css';

import {
  MDXEditor,
  MDXEditorMethods,
  toolbarPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  directivesPlugin,
  frontmatterPlugin,
  quotePlugin,
  RealmPlugin,
} from '@mdxeditor/editor';

import { history } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';

import '@mdxeditor/editor/style.css';
import { RapidCmi5Toolbar } from '../toolbar/RapidCmi5Toolbar';

import React, {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

// import SharedFormModals from '../../../shared-modals/SharedFormModals';
import { Box, Typography, useTheme } from '@mui/material';
import { RC5Context } from '../contexts/RC5Context';
import {
  AdmonitionDirectiveDescriptor,
  debugLogError,
  YoutubeDirectiveDescriptor,
  codeMirrorPlugin,
  headingsPlugin,
  footnotePlugin,
  FootnoteDefinitionDescriptor,
  FootnoteReferenceDescriptor,
  MathCodeBlockDescriptor,
  MathDescriptor,
  mathPlugin,
  languageList,
  CodeMirrorEditor,
  htmlPlugin,
  diffSourcePlugin,
  debugLog,
  FxDirectiveDescriptor,
  AnimDirectiveDescriptor,
  InlineAnimDirectiveDescriptor,
  animationDirectivePlugin,
  rc5TablePlugin,
  TabsDirectiveDescriptor,
  TabContentDirectiveDescriptor,
  AccordionDirectiveDescriptor,
  AccordionContentDirectiveDescriptor,
  ImageLabelDirectiveDescriptor,
  GridContainerDirectiveDescriptor,
  GridCellDirectiveDescriptor,
  appHeaderVisible,
} from '@rapid-cmi5/ui';

import {
  animationPlugin,
  AnimationConfig,
  parseAnimationsFromFrontmatter,
  injectAnimationsIntoFrontmatter,
  areAnimationsEqual,
} from '../plugins/animation';

import { imagePlugin } from '../plugins/image';
import { videoPlugin } from '../plugins/video';
import { audioPlugin } from '../plugins/audio';

import {
  currentSlideNum,
  currentAuPath,
  displayData,
  updateDirtyDisplay,
  updateTeamScenario,
} from '../../../redux/courseBuilderReducer';
import { ActivityDirectiveDescriptor } from './directives/ActivityDirectiveDescriptor';

import { useImageFile } from '../data-hooks/useImageFile';
import { GitContext } from '../../course-builder/GitViewer/session/GitContext';
import { RC5LinkDialog } from '../plugins/link/RC5LinkDialog';

import { directiveLinter } from './code/codeMirrorUtils';
import { LayoutBoxDirectiveDescriptor } from './directives/layout-box/LayoutBoxDirectiveDescriptor';
import { currentRepoAccessObjectSel } from '../../../redux/repoManagerReducer';

/**
 * Rapid CMI5 Visual Editor
 * @returns
 */
function RC5VisualEditor() {
  const ref = React.useRef<MDXEditorMethods>(null);
  const dispatch = useDispatch();
  const { addEditor, removeEditor } = useContext(RC5Context);
  const currentSlideIndex = useSelector(currentSlideNum);

  const theme = useTheme();
  const themeMode = theme.palette.mode;

  const [mdxTheme, setMdxTheme] = useState(
    `${themeMode}-theme ${themeMode}-editor nested-editable-${themeMode}`,
  );
  const isAppHeaderShowing = useSelector(appHeaderVisible);
  const content = useSelector(displayData); //CAREFUL here, retrieving from context causes inf rendering loop
  const currentAuPathSel = useSelector(currentAuPath);
  const currentRepoAccessObject = useSelector(currentRepoAccessObjectSel);
  const { handleBlobImageFile, isFsLoaded, currentCourse } =
    useContext(GitContext);

  const isEditing = true;
  const pixelTop = (isAppHeaderShowing ? 40 : 0) + (isEditing ? 87 : 0);

  //pixelTop = 0;
  //WARNING NOT SURE WHY THIS WORKS-------------------------------------------------------

  const debouncer = useRef<NodeJS.Timeout>();
  const lastFrontmatterRef = useRef<string | null>(null);

  // Store animations per slide (keyed by slide index)
  const slideAnimationsRef = useRef<Map<number, AnimationConfig[]>>(new Map());
  const [animationsVersion, setAnimationsVersion] = useState(0);
  const initialAnimationsForSlide = useMemo(() => {
    const cached = slideAnimationsRef.current.get(currentSlideIndex) || [];
    debugLog(
      `[RC5] build plugins: initialAnimationsForSlide for slide ${currentSlideIndex}`,
      { count: cached.length },
      undefined,
      'plugin',
    );
    return cached;
  }, [currentSlideIndex, animationsVersion]);

  const getMarkdownCb = useCallback(() => ref.current?.getMarkdown() || '', []);

  const setMarkdownCb = useCallback((markdown: string) => {
    ref.current?.setMarkdown(markdown);
  }, []);

  const onAnimationsChangeCb = useCallback(
    (animations: AnimationConfig[]) => {
      const currentAnims =
        slideAnimationsRef.current.get(currentSlideIndex) || [];

      debugLog(
        `🔔 onAnimationsChange triggered for slide ${currentSlideIndex}`,
        { prevCount: currentAnims.length, nextCount: animations.length },
        undefined,
        'plugin',
      );

      // ALWAYS update the ref (needed for save to work correctly)
      const oldAnimations =
        slideAnimationsRef.current.get(currentSlideIndex) || [];
      slideAnimationsRef.current.set(currentSlideIndex, animations);
      setAnimationsVersion((v) => {
        const newVersion = v + 1;
        debugLog(
          `🔢 animationsVersion: ${v} → ${newVersion} (slide ${currentSlideIndex}, reason: onAnimationsChange)`,
          undefined,
          undefined,
          'plugin',
        );
        return newVersion;
      });

      // Check if animations actually changed (deep comparison of relevant fields)
      const hasActuallyChanged = !areAnimationsEqual(oldAnimations, animations);

      if (!hasActuallyChanged) {
        debugLog(
          '⏭️  Animations unchanged (same content), skipping dirty flag',
        );
        // Note: AnimationResolver will update indicators after key resolution
        return; // Don't mark as dirty if nothing changed
      }

      debugLog('✅ Animations have changed, marking as dirty');

      // Update editor frontmatter in real-time to reflect animation changes
      if (ref.current) {
        try {
          const currentMarkdown = ref.current.getMarkdown();
          const updatedMarkdown = injectAnimationsIntoFrontmatter(
            currentMarkdown,
            animations,
          );

          // Only update if the markdown actually changed (to avoid unnecessary re-renders)
          if (currentMarkdown !== updatedMarkdown) {
            debugLog('📝 Updating editor frontmatter with new animations');
            ref.current.setMarkdown(updatedMarkdown);
          }
        } catch (error) {
          console.error('❌ Error updating editor frontmatter:', error);
        }
      }

      // Mark slide as dirty (enables save button)
      debugLog('💾 Setting dirty flag: animation changed');
      dispatch(updateDirtyDisplay({ reason: 'animation changed' }));

      // Note: AnimationResolver will update indicators after key resolution

      debugLog(
        `Animations changed for slide ${currentSlideIndex}:`,
        animations,
      );
    },
    [currentSlideIndex, dispatch],
  );

  const {
    imageFilePath,
    imageUploadHandler,
    videoFilePath,
    videoUploadHandler,
    audioFilePath,
    audioUploadHandler,
  } = useImageFile();

  // Preview handlers convert GitFS paths to blob URLs for browser display
  const imagePreviewHandler = useCallback(
    async (imageSrc: string) => {
      if (!isFsLoaded || !currentRepoAccessObject) return imageSrc;

      if (!imageSrc.startsWith('./')) return imageSrc;

      const fullPath = `${currentAuPathSel}/${imageSrc.slice(2)}`;
      const blob = await handleBlobImageFile(
        currentRepoAccessObject,
        fullPath,
        'image/*',
      );

      if (blob) {
        return URL.createObjectURL(blob);
      }
      return imageSrc;
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  const audioPreviewHandler = useCallback(
    async (audioSrc: string) => {
      if (!isFsLoaded || !currentRepoAccessObject) return audioSrc;

      if (!audioSrc.startsWith('./')) return audioSrc;

      const fullPath = `${currentAuPathSel}/${audioSrc.slice(2)}`;

      const blob = await handleBlobImageFile(
        currentRepoAccessObject,
        fullPath,
        'audio/mpeg',
      );

      if (blob) {
        return URL.createObjectURL(blob);
      }

      return audioSrc;
    },
    [currentRepoAccessObject, currentAuPathSel],
  );

  const videoPreviewHandler = useCallback(
    async (videoSrc: string) => {
      if (!isFsLoaded || !currentRepoAccessObject) return videoSrc;
      if (!videoSrc.startsWith('./')) return videoSrc;

      const fullPath = `${currentAuPathSel}/${videoSrc.slice(2)}`;
      const blob = await handleBlobImageFile(
        currentRepoAccessObject,
        fullPath,
        'video/*',
      );

      if (blob) {
        return URL.createObjectURL(blob);
      }
      return videoSrc;
    },
    [currentAuPathSel, currentRepoAccessObject, isFsLoaded],
  );

  const muiTheme = useTheme();

  const thePlugins = useMemo(() => {
    const initialList: RealmPlugin[] = [
      //DEBUG
      //catchAllPlugin(),
      frontmatterPlugin(), // ✅ Parse and hide YAML frontmatter
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
          ImageLabelDirectiveDescriptor,
          YoutubeDirectiveDescriptor,
          LayoutBoxDirectiveDescriptor,
          TabsDirectiveDescriptor,
          TabContentDirectiveDescriptor,
          AnimDirectiveDescriptor,
          InlineAnimDirectiveDescriptor,
          GridContainerDirectiveDescriptor,
          GridCellDirectiveDescriptor,
        ],
      }),
      codeMirrorPlugin({
        codeBlockLanguages: languageList,
        codeMirrorExtensions: [autocompletion(), history(), directiveLinter],
      }),
      footnotePlugin({
        footnoteDefinitionEditorDescriptors: [FootnoteDefinitionDescriptor],
        footnoteReferenceEditorDescriptors: [FootnoteReferenceDescriptor],
      }),
      animationDirectivePlugin(),
      imagePlugin({
        imageUploadHandler: imageUploadHandler,
        imageFilePath: imageFilePath,
        imagePreviewHandler: imagePreviewHandler,
      }),
      videoPlugin({
        videoUploadHandler: videoUploadHandler,
        videoFilePath: videoFilePath,
        videoPreviewHandler: videoPreviewHandler,
      }),
      audioPlugin({
        audioUploadHandler: audioUploadHandler,
        audioFilePath: audioFilePath,
        audioPreviewHandler: audioPreviewHandler,
      }),
      animationPlugin({
        initialAnimations: initialAnimationsForSlide,
        slideIndex: currentSlideIndex,
        getMarkdown: getMarkdownCb,
        setMarkdown: setMarkdownCb,
        onAnimationsChange: onAnimationsChangeCb,
      }),
      htmlPlugin(),
      listsPlugin(),
      linkPlugin({ disableAutoLink: false }),
      linkDialogPlugin({
        LinkDialog: () => <RC5LinkDialog />,
        onClickLinkCallback(url) {
          debugLog(
            `clicked ${url} in the edit link dialog`,
            undefined,
            undefined,
            'editor',
          );
        },
        onReadOnlyClickLinkCallback(e, _node, url) {
          //there is no read only editor, playback mode is a simulation of read only
          e.preventDefault();
          debugLog(
            `clicked ${url} in the read-only editor mode`,
            undefined,
            undefined,
            'editor',
          );
          window.open(url, '_blank', 'noreferrer');
        },
      }),
      quotePlugin(),
      rc5TablePlugin(),
      thematicBreakPlugin(),
      headingsPlugin({ topOffset: 112 }),
    ];

    if (!isEditing) {
      return initialList.concat(
        toolbarPlugin({
          toolbarClassName: 'mdxeditor-preview-toolbar',
          toolbarContents: () => <div />,
        }),
      );
    } else {
      return initialList.concat(
        diffSourcePlugin({
          //diffMarkdown: 'placeholder markdown',
          readOnlyDiff: true,
          viewMode: 'rich-text',
          codeMirrorExtensions: [autocompletion(), history(), directiveLinter],
        }),
        toolbarPlugin({
          toolbarClassName: 'mdxeditor-editor-toolbar',
          toolbarContents: () => <RapidCmi5Toolbar />,
        }),
      );
    }
  }, [
    isEditing,
    imageFilePath,
    imageUploadHandler,
    imagePreviewHandler,
    videoFilePath,
    videoUploadHandler,
    videoPreviewHandler,
    muiTheme.palette.mode,
    audioFilePath,
    audioUploadHandler,
    audioPreviewHandler,
    // NOTE: currentAnimations is intentionally NOT in the dependency array
    // to prevent plugin rebuilds on animation changes. The onAnimationsChange
    // callback handles animation updates via the cell/signal system.
    currentSlideIndex,
    dispatch,
    initialAnimationsForSlide,
    getMarkdownCb,
    setMarkdownCb,
    onAnimationsChangeCb,
    animationsVersion,
  ]);

  const onChange = (e: string) => {
    // Keep the in-memory animation cache in sync with the markdown.
    //
    // IMPORTANT: Save uses wrappedRef.getMarkdown() which injects animations from slideAnimationsRef.
    // If the user edits markdown source and removes/changes animations, but we don't sync slideAnimationsRef,
    // stale animations can be re-injected on save (appearing like "old markdown got reloaded").
    try {
      const frontmatterMatch = e.match(/^---\s*\n([\s\S]*?)\n---/);
      const frontmatter = frontmatterMatch?.[1] ?? '';

      if (frontmatter !== (lastFrontmatterRef.current ?? '')) {
        lastFrontmatterRef.current = frontmatter;
        const parsed = parseAnimationsFromFrontmatter(e);
        const existing =
          slideAnimationsRef.current.get(currentSlideIndex) || [];
        console.info('[Animations][RC5] onChange frontmatter parsed', {
          slide: currentSlideIndex,
          parsedCount: parsed.length,
          existingCount: existing.length,
          equal: areAnimationsEqual(existing, parsed),
        });

        if (!areAnimationsEqual(existing, parsed)) {
          debugLog(
            '🧬 Source markdown frontmatter changed → syncing animations',
            {
              slide: currentSlideIndex,
              prevCount: existing.length,
              nextCount: parsed.length,
              parsed,
            },
          );
          slideAnimationsRef.current.set(currentSlideIndex, parsed);

          // CRITICAL: Increment version to trigger useMemo recompute of initialAnimationsForSlide
          // Without this, the plugin never receives the updated animations from frontmatter changes
          setAnimationsVersion((v) => v + 1);
        }
      }
    } catch (err) {
      // Don't break editing if parsing fails; just log and continue.
      const message = err instanceof Error ? err.message : String(err);
      debugLogError(
        `❌ Failed to sync animations from markdown onChange: ${message}`,
      );
    }

    if (debouncer.current !== undefined) {
      clearTimeout(debouncer.current);
    }
    debouncer.current = setTimeout(() => {
      debugLog(
        '💾 Setting dirty flag: slide content edited (debounced after 1s)',
      );
      dispatch(updateDirtyDisplay({ reason: 'slide edited' }));
    }, 1000);
  };

  /**
   * Create a wrapped ref that intercepts getMarkdown to inject animations
   */
  const wrappedRef = useMemo(() => {
    return {
      current: ref.current
        ? {
            ...ref.current,
            getMarkdown: () => {
              const baseMarkdown = ref.current?.getMarkdown() || '';
              const cachedAnims =
                slideAnimationsRef.current.get(currentSlideIndex) || [];

              // IMPORTANT: If the user modified animations in source mode (or otherwise),
              // the markdown frontmatter is the source of truth. Do NOT resurrect stale
              // in-memory animations by injecting the cache over the markdown.
              const parsedFromMarkdown =
                parseAnimationsFromFrontmatter(baseMarkdown);
              const animsToPersist = areAnimationsEqual(
                cachedAnims,
                parsedFromMarkdown,
              )
                ? cachedAnims
                : parsedFromMarkdown;

              // Keep cache aligned for subsequent saves/publishes
              if (!areAnimationsEqual(cachedAnims, animsToPersist)) {
                slideAnimationsRef.current.set(
                  currentSlideIndex,
                  animsToPersist,
                );
              }

              const markdownWithAnimations = injectAnimationsIntoFrontmatter(
                baseMarkdown,
                animsToPersist,
              );
              debugLog(
                `Injecting animations into markdown for slide ${currentSlideIndex}:`,
                animsToPersist,
              );
              return markdownWithAnimations;
            },
          }
        : null,
    };
  }, [ref.current, currentSlideIndex]);

  /**
   * Persist reference to editor so we can save data
   */
  useEffect(() => {
    if (ref.current) {
      addEditor(wrappedRef as RefObject<MDXEditorMethods>);
    }
    return () => {
      removeEditor();
      if (debouncer.current !== undefined) {
        clearTimeout(debouncer.current);
      }
    };
  }, [ref?.current, wrappedRef]);

  /**
   * UE sets mdx theme when MUI theme changes
   */
  useEffect(() => {
    setMdxTheme(
      `${themeMode}-theme ${themeMode}-editor nested-editable-${themeMode}`,
    );
  }, [themeMode]);

  /**
   * Load animations for current slide when slide changes
   * This runs BEFORE markdown is parsed, so it loads from our in-memory store
   * The import visitor will then update if frontmatter has different data
   */
  useEffect(() => {
    const savedAnimations =
      slideAnimationsRef.current.get(currentSlideIndex) || [];
    debugLog(
      `Pre-loading animations for slide ${currentSlideIndex}`,
      savedAnimations,
    );
  }, [currentSlideIndex]);
  /**
   * UE injects markdown from lesson into editor and resets focus
   */
  useEffect(() => {
    if (ref.current) {
      if (typeof content !== 'string') {
        debugLogError('Attempting to inject non string data into MdxEditor');
        ref.current.setMarkdown('This slide data could not be presented ');
      } else {
        if (content !== ref.current.getMarkdown()) {
          debugLog(
            'sees content !== ref.current.getMarkdown()',
            undefined,
            undefined,
            'editor',
          );
          try {
            debugLog('updateTeamScenario (load slide)');
            const teamScenario =
              content.indexOf(':consoles') > 0
                ? { scenario: { uuid: 'unknown' } }
                : { scenario: undefined };
            dispatch(updateTeamScenario(teamScenario));

            // Parse animations from frontmatter before setting markdown.
            // If we already have unsaved animations in memory for this slide, keep them
            // when the frontmatter is empty so navigating away/back does not drop them.
            const parsedAnimations = parseAnimationsFromFrontmatter(content);
            const existingAnimations =
              slideAnimationsRef.current.get(currentSlideIndex) || [];

            const shouldKeepExisting =
              existingAnimations.length > 0 && parsedAnimations.length === 0;

            const animationsToUse = shouldKeepExisting
              ? existingAnimations
              : parsedAnimations;

            // Only update if animations actually changed to avoid unnecessary plugin rebuilds
            const animationsChanged = !areAnimationsEqual(
              existingAnimations,
              animationsToUse,
            );

            if (animationsChanged) {
              slideAnimationsRef.current.set(
                currentSlideIndex,
                animationsToUse,
              );
              setAnimationsVersion((v) => {
                const newVersion = v + 1;
                debugLog(
                  `🔢 animationsVersion: ${v} → ${newVersion} (loading slide ${currentSlideIndex}, ${animationsToUse.length} animations, keepExisting=${shouldKeepExisting})`,
                  undefined,
                  undefined,
                  'plugin',
                );
                return newVersion;
              });
            } else {
              debugLog(
                `⏭️ Skipping animationsVersion update - animations unchanged for slide ${currentSlideIndex}`,
                undefined,
                undefined,
                'plugin',
              );
            }

            debugLog(
              `Loaded animations for slide ${currentSlideIndex}:`,
              animationsToUse,
            );
            if (shouldKeepExisting) {
              debugLog(
                '↩️  Keeping in-memory animations because parsed frontmatter was empty',
              );
            }

            debugLog('setting markdown to', content, undefined, 'editor');
            ref.current.setMarkdown(content);
          } catch (error: any) {
            debugLog('Could not set markdown', error, undefined, 'editor');
          }
        }
      }

      ref.current?.focus();
    }
  }, [content, currentSlideIndex]); //DO NOT REMOVE currentSlideIndex

  /**
   * Note: Animation indicators are now updated by AnimationResolver
   * after key resolution to ensure targetNodeKey values are current
   */

  const onErrorHelper = (payload: { error: string; source: string }) => {
    debugLog('error src', payload, undefined, 'editor');
  };
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {thePlugins && thePlugins.length > 0 && currentCourse ? (
        <Box
          sx={{ height: `calc(100vh - ${pixelTop}px)`, position: 'relative' }}
        >
          <MDXEditor
            className={mdxTheme}
            onChange={onChange}
            ref={ref}
            markdown={''}
            plugins={thePlugins}
            readOnly={!isEditing}
            onError={onErrorHelper}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: `calc(100vh - ${pixelTop}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
          >
            Please create or open a course to begin editing
          </Typography>
        </Box>
      )}
      {/* <SharedFormModals isModal={false} /> */}
    </>
  );
}

export default RC5VisualEditor;
