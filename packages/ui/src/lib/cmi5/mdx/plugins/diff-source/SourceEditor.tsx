import { markdown as markdownLanguageSupport } from '@codemirror/lang-markdown';
import { Compartment } from '@codemirror/state';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { useTheme } from '@mui/material';
import { cmExtensions$ } from '.';
import {
  markdown$,
  markdownSourceEditorValue$,
  onBlur$,
  readOnly$,
  setMarkdown$,
} from '@mdxeditor/editor';
import { useCellValues, usePublisher, useRealm } from '@mdxeditor/gurx';

export const COMMON_STATE_CONFIG_EXTENSIONS: Extension[] = [
  basicSetup,
  //basicLight,
  markdownLanguageSupport(),
  lineNumbers(),
  EditorView.lineWrapping,
];

export const SourceEditor = () => {
  const realm = useRealm();
  const [markdown, readOnly, cmExtensions] = useCellValues(
    markdown$,
    readOnly$,
    cmExtensions$,
  );
  const updateMarkdown = usePublisher(markdownSourceEditorValue$);
  const triggerOnBlur = usePublisher(onBlur$);
  const editorViewRef = useRef<EditorView | null>(null);
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
    // `markdown` is intentionally omitted — we update doc content via the
    // markdown$ subscription below instead of recreating the editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [readOnly, updateMarkdown, cmExtensions, triggerOnBlur],
  );

  /**
   * Push markdown changes into the existing editor view (e.g. on slide
   * change) without tearing down and rebuilding the editor, so cursor,
   * scroll, focus, and undo history are preserved.
   *
   * We subscribe to BOTH markdown$ and setMarkdown$ because MDXEditor's
   * internal setMarkdown$ handler short-circuits when the new markdown
   * trim-equals the current markdown$ value — meaning markdown$ never
   * re-emits and Lexical is never updated. That breaks the source view
   * when two slides share identical content but CodeMirror's doc has
   * diverged via in-place source-mode edits. Subscribing to setMarkdown$
   * directly bypasses that filter.
   */
  const replaceDoc = (next: string) => {
    const view = editorViewRef.current;
    if (!view) return;
    if (view.state.doc.toString() === next) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: next },
    });
  };

  useEffect(() => {
    const unsubMarkdown = realm.sub(markdown$, replaceDoc);
    const unsubSetMarkdown = realm.sub(setMarkdown$, replaceDoc);
    return () => {
      unsubMarkdown();
      unsubSetMarkdown();
    };
  }, [realm]);

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
