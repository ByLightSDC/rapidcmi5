import './RC5VisualEditor.css';

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
  RealmPlugin,
} from '@mdxeditor/editor';

import { history } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';

import '@mdxeditor/editor/style.css';
import { RapidCmi5Toolbar } from '../toolbar/RapidCmi5Toolbar';

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AnimationConfig,
  animationDirectivePlugin,
  appHeaderVisible,
  themeColor,
} from '@rapid-cmi5/ui';
// import SharedFormModals from '../../../shared-modals/SharedFormModals';
import { Box, useTheme } from '@mui/material';
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
} from '@rapid-cmi5/ui';
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
import {
  animationPlugin,
  areAnimationsEqual,
  injectAnimationsIntoFrontmatter,
} from '../plugins/animation';

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
  const { handleBlobImageFile, isFsLoaded } = useContext(GitContext);

  const isEditing = true;
  const pixelTop = (isAppHeaderShowing ? 40 : 0) + (isEditing ? 87 : 0);

  //pixelTop = 0;
  //WARNING NOT SURE WHY THIS WORKS-------------------------------------------------------

  const debouncer = useRef<NodeJS.Timeout>();

  // Store animations per slide (keyed by slide index)
  const slideAnimationsRef = useRef<Map<number, AnimationConfig[]>>(new Map());
  const [animationsVersion, setAnimationsVersion] = useState(0);
  const initialAnimationsForSlide = useMemo(
    () => slideAnimationsRef.current.get(currentSlideIndex) || [],
    [currentSlideIndex, animationsVersion],
  );

  const getMarkdownCb = useCallback(() => ref.current?.getMarkdown() || '', []);

  const setMarkdownCb = useCallback((markdown: string) => {
    ref.current?.setMarkdown(markdown);
  }, []);

  const onAnimationsChangeCb = useCallback(
    (animations: AnimationConfig[]) => {
      debugLog('🔔 onAnimationsChange triggered');
      const currentAnims =
        slideAnimationsRef.current.get(currentSlideIndex) || [];
      debugLog(`  Current animations: ${currentAnims.length} items`);
      debugLog(`  New animations: ${animations.length} items`);

      // ALWAYS update the ref (needed for save to work correctly)
      const oldAnimations =
        slideAnimationsRef.current.get(currentSlideIndex) || [];
      slideAnimationsRef.current.set(currentSlideIndex, animations);
      setAnimationsVersion((v) => v + 1);

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
          AdmonitionDirectiveDescriptor,
          ActivityDirectiveDescriptor,
          YoutubeDirectiveDescriptor,
          LayoutBoxDirectiveDescriptor,
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
      frontmatterPlugin(),
      animationDirectivePlugin(),
      animationPlugin({
        initialAnimations: initialAnimationsForSlide,
        getMarkdown: getMarkdownCb,
        setMarkdown: setMarkdownCb,
        onAnimationsChange: onAnimationsChangeCb,
      }),
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
      htmlPlugin(),
      listsPlugin(),
      linkPlugin({ disableAutoLink: false }),
      linkDialogPlugin({
        LinkDialog: () => <RC5LinkDialog />,
        onClickLinkCallback(url) {
          console.log(`clicked ${url} in the edit link dialog`);
        },
        onReadOnlyClickLinkCallback(e, _node, url) {
          //there is no read only editor, playback mode is a simulation of read only
          e.preventDefault();
          console.log(`clicked ${url} in the read-only editor mode`);
          window.open(url, '_blank', 'noreferrer');
        },
      }),
      quotePlugin(),
      tablePlugin(),
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
  ]);

  const onChange = (e: string) => {
    if (debouncer.current !== undefined) {
      clearTimeout(debouncer.current);
    }
    debouncer.current = setTimeout(() => {
      dispatch(updateDirtyDisplay({ reason: 'slide edited' }));
    }, 1000);
  };

  /**
   * Persist reference to editor so we can save data
   */
  useEffect(() => {
    if (ref.current) {
      addEditor(ref);
    }
    return () => {
      removeEditor();
      if (debouncer.current !== undefined) {
        clearTimeout(debouncer.current);
      }
    };
  }, [ref?.current]);

  /**
   * UE sets mdx theme when MUI theme changes
   */
  useEffect(() => {
    setMdxTheme(
      `${themeMode}-theme ${themeMode}-editor nested-editable-${themeMode}`,
    );
  }, [themeMode]);

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
          try {
            debugLog('updateTeamScenario (load slide)');
            const teamScenario =
              content.indexOf(':consoles') > 0
                ? { scenario: { uuid: 'unknown' } }
                : { scenario: undefined };
            dispatch(updateTeamScenario(teamScenario));
            ref.current.setMarkdown(content);
          } catch (error: any) {
            console.log('Could not set markdown', error);
          }
        }
      }

      ref.current?.focus();
    }
  }, [content, currentSlideIndex]); //DO NOT REMOVE currentSlideIndex

  const onErrorHelper = (payload: { error: string; source: string }) => {
    console.log('erorr src', payload);
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {thePlugins && thePlugins.length > 0 && (
        <Box sx={{ height: `calc(100vh - ${pixelTop}px)` }}>
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
      )}
      {/* <SharedFormModals isModal={false} /> */}
    </>
  );
}

export default RC5VisualEditor;
