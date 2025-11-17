import { markdown as markdownLanguageSupport } from '@codemirror/lang-markdown';
import { Compartment } from '@codemirror/state';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import React, { useCallback, useEffect, useMemo } from 'react';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useTheme } from '@mui/material';
import { cmExtensions$ } from '.';
import {
  markdown$,
  markdownSourceEditorValue$,
  onBlur$,
  readOnly$,
} from '@mdxeditor/editor';
import { useCellValues, usePublisher } from '@mdxeditor/gurx';

export const COMMON_STATE_CONFIG_EXTENSIONS: Extension[] = [
  basicSetup,
  //basicLight,
  markdownLanguageSupport(),
  lineNumbers(),
  EditorView.lineWrapping,
];

export const SourceEditor = () => {
  const [markdown, readOnly, cmExtensions] = useCellValues(
    markdown$,
    readOnly$,
    cmExtensions$,
  );
  const updateMarkdown = usePublisher(markdownSourceEditorValue$);
  const triggerOnBlur = usePublisher(onBlur$);
  const editorViewRef = React.useRef<EditorView | null>(null);
  const themeCompartment = useMemo(() => {
    return new Compartment();
  }, []);
  const muiTheme = useTheme();

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      const cmTheme =
        muiTheme.palette.mode === 'dark' ? githubDark : githubLight;

      if (el !== null) {
        const extensions = [
          // custom extensions should come first so that you can override the default extensions
          ...cmExtensions,
          ...COMMON_STATE_CONFIG_EXTENSIONS,
          themeCompartment.of(cmTheme), // Initialize with a theme
          EditorView.updateListener.of(({ state }) => {
            updateMarkdown(state.doc.toString());
          }),
          EditorView.focusChangeEffect.of((_, focused) => {
            if (!focused) {
              triggerOnBlur(new FocusEvent('blur'));
            }
            return null;
          }),
        ];
        if (readOnly) {
          extensions.push(EditorState.readOnly.of(true));
        }
        el.innerHTML = '';
        editorViewRef.current = new EditorView({
          parent: el,
          state: EditorState.create({ doc: markdown, extensions }),
        });
      } else {
        editorViewRef.current?.destroy();
        editorViewRef.current = null;
      }
    },
    [
      markdown,
      readOnly,
      updateMarkdown,
      cmExtensions,
      editorViewRef,
      triggerOnBlur,
    ],
  );

  /**
   * Switch Themes
   */
  useEffect(() => {
    const cmTheme = muiTheme.palette.mode === 'dark' ? githubDark : githubLight;
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        effects: themeCompartment.reconfigure(cmTheme),
      });
    }
  }, [muiTheme.palette.mode, themeCompartment]);

  return <div ref={ref} className="cm-sourceView mdxeditor-source-editor" />;
};
