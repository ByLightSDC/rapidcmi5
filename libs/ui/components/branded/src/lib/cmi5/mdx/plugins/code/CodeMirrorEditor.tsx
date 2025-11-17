import { useCellValues } from '@mdxeditor/gurx';
import React, { useEffect, useMemo } from 'react';
import { Compartment } from '@codemirror/state';
import { languages } from '@codemirror/language-data';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { basicSetup } from 'codemirror';
import {
  CodeBlockEditorProps,
  useCodeBlockEditorContext,
  codeMirrorAutoLoadLanguageSupport$,
  readOnly$,
} from '@mdxeditor/editor';
import { useCodeMirrorRef } from './useCodeMirrorRef';
import { SelectorMainUi } from '../../../../inputs/selectors/selectors';
import { languageOptions } from './vars';
import DeleteIconButton from '../../components/DeleteIconButton';
import RightMenuContainer from '../../components/RightMenuContainer';
import { editorInPlayback$ } from '../../state/vars';
import { Box, useTheme } from '@mui/material';
import { codeMirrorExtensions$ } from '.';
const themeCompartment = new Compartment();

export const COMMON_STATE_CONFIG_EXTENSIONS: Extension[] = [];
const EMPTY_VALUE = '__EMPTY_VALUE__';

export const CodeMirrorEditor = ({
  language,
  nodeKey,
  code,
  focusEmitter,
}: CodeBlockEditorProps) => {
  const { parentEditor, lexicalNode } = useCodeBlockEditorContext();

  const [readOnly, codeMirrorExtensions, autoLoadLanguageSupport, isPlayback] =
    useCellValues(
      readOnly$,
      codeMirrorExtensions$,
      codeMirrorAutoLoadLanguageSupport$,
      editorInPlayback$,
    );

  const codeMirrorRef = useCodeMirrorRef(
    nodeKey,
    'codeblock',
    language,
    focusEmitter,
  );
  const { setCode } = useCodeBlockEditorContext();
  const editorViewRef = React.useRef<EditorView | null>(null);
  const elRef = React.useRef<HTMLDivElement | null>(null);

  const setCodeRef = React.useRef(setCode);
  setCodeRef.current = setCode;
  codeMirrorRef.current = {
    getCodemirror: () => editorViewRef.current!,
  };

  const muiTheme = useTheme();

  /**
   * delete mdast node
   */
  const onDelete = (event?: MouseEvent) => {
    event?.stopImmediatePropagation();
    parentEditor.update(() => {
      lexicalNode.remove();
    });
  };

  /**
   * Cache bg color based on theme
   */
  const bgColor = useMemo(() => {
    return muiTheme.palette.mode === 'dark' ? '#0D1118' : '#FFFFFF';
  }, [muiTheme.palette.mode]);

  /**
   * Create Editor with extensions passed to editor
   */
  useEffect(() => {
    const el = elRef.current!;
    const cmTheme = muiTheme.palette.mode === 'dark' ? githubDark : githubLight;
    void (async () => {
      const extensions = [
        ...codeMirrorExtensions,
        basicSetup,
        themeCompartment.of(cmTheme), // Initialize with a theme
        lineNumbers(),
        keymap.of([indentWithTab]),
        EditorView.lineWrapping,
        EditorView.updateListener.of(({ state }) => {
          setCodeRef.current(state.doc.toString());
        }),
      ];
      if (readOnly) {
        extensions.push(EditorState.readOnly.of(true));
      }
      if (language !== '' && autoLoadLanguageSupport) {
        const languageData = languages.find((l) => {
          return (
            l.name === language ||
            l.alias.includes(language) ||
            l.extensions.includes(language)
          );
        });
        if (languageData) {
          try {
            const languageSupport = await languageData.load();
            extensions.push(languageSupport.extension);
          } catch (e) {
            console.warn('failed to load language support for', language);
          }
        }
      }
      el.innerHTML = '';
      editorViewRef.current = new EditorView({
        parent: el,
        state: EditorState.create({ doc: code, extensions }),
      });

      el.addEventListener('keydown', stopPropagationHandler);
    })();
    return () => {
      editorViewRef.current?.destroy();
      editorViewRef.current = null;
      el.removeEventListener('keydown', stopPropagationHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, language]);

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
  }, [muiTheme.palette.mode]);

  return (
    <Box
      className="codeMirrorWrapper"
      sx={{
        position: 'relative',
        //backgroundColor: 'background.default',
        backgroundColor: bgColor,
      }}
    >
      {!isPlayback && !readOnly && (
        <RightMenuContainer sxProps={{ zIndex: 9 }}>
          <SelectorMainUi
            key="select-language"
            id="select-language"
            defaultValue={language}
            optionsAlt={languageOptions}
            sxProps={{ width: '140px', height: '30px' }}
            isFormStyle={false}
            listItemProps={{
              fontWeight: '400 !important',
              textTransform: 'none',
            }}
            onSelect={(language) => {
              parentEditor.update(() => {
                lexicalNode.setLanguage(
                  language === EMPTY_VALUE ? '' : language,
                );
                setTimeout(() => {
                  parentEditor.update(() => {
                    lexicalNode.getLatest().select();
                  });
                });
              });
            }}
          />
          <DeleteIconButton onDelete={onDelete} />
        </RightMenuContainer>
      )}
      {/* </div> */}

      <div ref={elRef} />
    </Box>
  );
};
function stopPropagationHandler(this: HTMLDivElement, ev: KeyboardEvent) {
  ev.stopPropagation();
}
