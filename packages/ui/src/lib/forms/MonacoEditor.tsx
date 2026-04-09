import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/system';
import { useEffect, useRef } from 'react';

export const runtimeToMonacoLanguage: Record<string, string> = {
  nodejs: 'javascript', node: 'javascript', 'node.js': 'javascript',
  javascript: 'javascript', js: 'javascript',
  typescript: 'typescript', ts: 'typescript',
  python3: 'python', python2: 'python', python: 'python', py: 'python',
  java: 'java',
  c: 'c', cpp: 'cpp', 'c++': 'cpp',
  csharp: 'csharp', 'c#': 'csharp', dotnet: 'csharp',
  go: 'go', golang: 'go',
  ruby: 'ruby', rb: 'ruby',
  php: 'php',
  rust: 'rust',
  kotlin: 'kotlin',
  swift: 'swift',
  bash: 'shell', sh: 'shell', shell: 'shell',
  sql: 'sql',
  html: 'html', css: 'css', json: 'json', xml: 'xml',
  markdown: 'markdown', md: 'markdown',
};

export const resolveMonacoLanguage = (lang: string): string =>
  runtimeToMonacoLanguage[lang.toLowerCase()] ?? lang.toLowerCase();

export type tMonacoEditorProps = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  onBlur?: () => void;
  language?: string;
  readOnly?: boolean;
  disabled?: boolean;
  height?: string | number;
  error?: boolean;
};

export function MonacoEditor({
  value = '',
  onChange,
  onBlur,
  language = 'javascript',
  readOnly = false,
  disabled = false,
  height = 200,
  error = false,
}: tMonacoEditorProps) {
  const theme = useTheme();
  const monacoTheme = theme.palette.mode === 'light' ? 'light' : 'vs-dark';
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const resolvedLanguage = resolveMonacoLanguage(language);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, resolvedLanguage);
    }
  }, [resolvedLanguage]);

  return (
    <Box
      sx={{
        border: 1,
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: error ? 'error.main' : 'primary.main',
          borderWidth: 2,
        },
      }}
    >
      <Editor
        height={height}
        language={resolvedLanguage}
        theme={monacoTheme}
        value={value}
        options={{
          readOnly: readOnly || disabled,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 13,
          lineNumbers: 'on',
          tabSize: 2,
        }}
        onChange={onChange}
        onMount={(editor) => {
          editorRef.current = editor;
          if (onBlur) {
            editor.onDidBlurEditorWidget(onBlur);
          }
        }}
      />
    </Box>
  );
}

export default MonacoEditor;
