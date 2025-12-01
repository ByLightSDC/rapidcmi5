import { useDispatch, useSelector } from 'react-redux';
import * as monaco from 'monaco-editor';
import { Editor } from '@monaco-editor/react';
import { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import {
  RepoState,
  setFileContent,
  setSelectedFile,
} from '../../../../../redux/repoManagerReducer';
import { RootState, AppDispatch } from '../../../../../redux/store';
import { ButtonModalCancelUi } from '@rangeos-nx/ui/branded';

/* Icons */
import { Stack } from '@mui/system';
import path from 'path-browserify';
import { themeColor } from '@rangeos-nx/ui/redux';
import { getMonacoTheme } from '../../utils/monacoEditor';
import { validateMarkdownDirectives } from '@rangeos-nx/cmi5-build/common';
import {
  ConflictBlock,
  parseConflictBlocksFromModel,
} from './mergeConflictHelpers';
import { GitContext } from '../../session/GitContext';

const titleSxProps = { fontFamily: 'monospace' };

export default function ViewFile() {
  const { fileState }: RepoState = useSelector(
    (state: RootState) => state.repoManager,
  );

  const { handleUpdateFile } = useContext(GitContext);

  const dispatch = useDispatch<AppDispatch>();
  const themeSel = useSelector(themeColor);
  const [monacoEditorTheme, setMonacoEditorTheme] = useState(
    getMonacoTheme(themeSel),
  );

  const [editorContent, setEditorContent] = useState<string>('');
  const [isSavable, setIsSaveable] = useState<boolean>(false);
  const [numberOfErrors, setNumberOfErrors] = useState(0);
  const [monacoRef, setMonacoRef] = useState<typeof monaco | null>(null);
  const [editorRef, setEditorRef] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef =
    useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  /**
   * updates editor file display when content changes
   */
  useEffect(() => {
    setEditorContent(fileState.fileContent as string);
    validateEditorContent(fileState.fileContent as string);
  }, [fileState.fileContent, monacoRef, editorRef]);

  /**
   * UE sets mdx theme when MUI theme changes
   */
  useEffect(() => {
    setMonacoEditorTheme(getMonacoTheme(themeSel));
  }, [themeSel]);

  useEffect(() => {
    setIsSaveable(false);
  }, [fileState.selectedFile]);

  function applyMergeHighlights(blocks: ConflictBlock[]) {
    const decos: monaco.editor.IModelDeltaDecoration[] = [];

    for (const b of blocks) {
      if (b.right_start && b.right_end) {
        decos.push({
          range: new monaco.Range(b.right_start, 1, b.right_end + 1, 1),
          options: {
            isWholeLine: true,
            className: 'mergeRight',
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        });
      }
      if (b.left_start && b.left_end) {
        decos.push({
          range: new monaco.Range(b.left_start - 1, 1, b.left_end, 1),
          options: {
            isWholeLine: true,
            className: 'mergeLeft',
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        });
      }
    }

    if (!editorRef || !decos) return;

    decorationsRef.current?.set(decos);
  }

  useEffect(() => {
    const blocks = parseConflictBlocksFromModel(editorContent);
    applyMergeHighlights(blocks);
  }, [editorRef, editorContent]);

  const validateEditorContent = (content: string) => {
    if (!fileState.selectedFile?.endsWith('.md') && !monacoRef && !editorRef)
      return;
    try {
      const errorMarkers = validateMarkdownDirectives(content);
      setNumberOfErrors(errorMarkers.length);
      // Set the markers
      if (editorRef?.getModel()) {
        monacoRef?.editor.setModelMarkers(
          editorRef.getModel()!,
          'directive-validator',
          errorMarkers,
        );
      }
    } catch (e) {
      console.error('Validation parse error:', e);
    }
  };

  const handleSave = async () => {
    if (!fileState.selectedFile) {
      console.error('No selected file for save. Not a user error.');
      return;
    }

    try {
      dispatch(
        setFileContent({
          content: editorContent,
          type: fileState.fileType as string,
        }),
      );

      await handleUpdateFile(fileState.selectedFile, editorContent);

      setIsSaveable(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Check console for details.');
    }
  };

  const handleCancel = async () => {
    if (!fileState.selectedFile) {
      console.error('No selected file for save. Not a user error.');
      return;
    }

    try {
      dispatch(
        setFileContent({
          content: null,
          type: null,
        }),
      );
      dispatch(setSelectedFile(null));
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. Check console for details.');
    }
  };

  const fileExtensionToLanguageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    html: 'html',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    md: 'markdown',
    php: 'php',
    sql: 'sql',
    sh: 'shell',
  };

  const getLanguageFromFilename = (filename: string | null): string => {
    if (filename === null) return 'plaintext';
    const ext = filename.split('.').pop() || '';
    return fileExtensionToLanguageMap[ext] || 'plaintext'; // Default to plaintext
  };

  return (
    <div style={{ flex: 1 }}>
      <Box>
        {fileState.fileType === 'image' ? (
          <img
            src={fileState.fileContent as string}
            alt="Select a file"
            style={{ maxWidth: '100%', maxHeight: '500px' }}
          />
        ) : (
          // <Box sx={{ position: 'absolute', right:0, top:0 }}>
          <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
            {/* TODO only show if file  */}

            {fileState.fileType && (
              <Stack
                direction="row"
                spacing={2}
                style={{
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  // TODO grey to match monaco backgroundColor: 'black',
                  // position: 'absolute', right:0, top:40
                }}
              >
                <Typography
                  sx={{
                    paddingTop: '4px',
                    color: numberOfErrors > 0 ? 'error.main' : 'text.hint',
                    ...titleSxProps,
                  }}
                >
                  {path.basename(fileState.selectedFile ?? '')}
                  {numberOfErrors > 0 ? ` (${numberOfErrors})` : ''}
                </Typography>

                <ButtonModalCancelUi onClick={handleCancel}>
                  Close
                </ButtonModalCancelUi>
                <ButtonModalCancelUi disabled={!isSavable} onClick={handleSave}>
                  Save
                </ButtonModalCancelUi>
              </Stack>
            )}
            <Editor
              height="80vh"
              language={getLanguageFromFilename(fileState.selectedFile)}
              theme={monacoEditorTheme}
              value={editorContent}
              onMount={(editor, monacoInstance) => {
                setEditorRef(editor);
                setMonacoRef(monacoInstance);
                decorationsRef.current = editor.createDecorationsCollection([]);
              }}
              onChange={(newContent: string | undefined) => {
                const content = newContent ?? '';
                setEditorContent(content);
                setIsSaveable(true);

                validateEditorContent(content);
              }}
            />
          </Box>
        )}
      </Box>
    </div>
  );
}
