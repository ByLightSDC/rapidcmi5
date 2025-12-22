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
import '@mdxeditor/editor/style.css';
import React, { useContext, useEffect, useMemo, useState } from 'react';
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
} from '@rapid-cmi5/ui';

import { RC5PlayerToolbar } from './RC5PlayerToolbar';
import { ActivityDirectiveDescriptor } from './editors/directives/ActivityDirectiveDescriptor';
import { AuManagerContext } from '../../session/AuManager';
import { kebabToCamel } from '../../utils/StringUtils';
import { githubDark } from '@uiw/codemirror-theme-github';
import { LayoutBoxDirectiveDescriptor } from './editors/directives/LayoutBoxDirectiveDescriptor';

/**
 * Rapid CMI5 Visual Editor
 * @returns
 */
function RC5Player() {
  const ref = React.useRef<MDXEditorMethods>(null);
  const { slideData, activeTab } = useContext(AuManagerContext);
  const [fullScreenImage, setFullScreenImage] = useState<string>('');
  const [fullScreenImageStyle, setFullScreenImageStyle] = useState({});

  const pixelTop = '40px';

  const thePlugins = useMemo(() => {
    const initialList = [
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
        codeMirrorExtensions: [githubDark],
      }),
      footnotePlugin({
        footnoteDefinitionEditorDescriptors: [FootnoteDefinitionDescriptor],
        footnoteReferenceEditorDescriptors: [FootnoteReferenceDescriptor],
      }),
      frontmatterPlugin(),
      headingsPlugin(),
      htmlPlugin(),
      imagePlayerPlugin(),
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
  const onClickSlide = (event: any) => {
    if (event.target.nodeName === 'IMG') {
      event.stopPropagation();
      const srcAttr = event.target.attributes['src'];
      const styleObj = event.target.style;
      if (srcAttr) {
        // don't set the image to full screen if the image is the child of an
        // anchor tag
        const hasAnchorAncestor = event.target.closest('a') !== null;
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
        setFullScreenImage(srcAttr.value);
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
   * UE injects markdown from lesson into editor and resets focus
   */
  useEffect(() => {
    //REF debugLog(displayData);
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
