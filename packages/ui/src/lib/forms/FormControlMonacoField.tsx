import { Control, Controller } from 'react-hook-form';
import { Editor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

const runtimeToMonacoLanguage: Record<string, string> = {
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
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/system';
import { useEffect, useRef } from 'react';

export type tFormControlMonacoFieldProps = {
  control?: Control;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  hidden?: boolean;
  label?: string;
  language?: string;
  name: string;
  readOnly?: boolean;
  height?: string | number;
  onBlur?: () => void;
  onChange?: (value: string | undefined) => void;
};

export function FormControlMonacoField({
  control,
  disabled = false,
  error = false,
  helperText = '',
  hidden = false,
  label = '',
  language = 'javascript',
  name,
  readOnly = false,
  height = 200,
  onBlur,
  onChange,
}: tFormControlMonacoFieldProps) {
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
    <FormControl
      error={error}
      style={{ width: hidden ? '0px' : '100%', display: hidden ? 'none' : undefined }}
    >
      <Controller
        key={name}
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {label && (
              <InputLabel
                shrink
                sx={{
                  position: 'relative',
                  transform: 'none',
                  fontSize: '0.75rem',
                  color: error ? 'error.main' : 'text.secondary',
                  mb: 0.5,
                }}
              >
                {label}
              </InputLabel>
            )}
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
                value={field.value ?? ''}
                options={{
                  readOnly: readOnly || disabled,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  fontSize: 13,
                  lineNumbers: 'on',
                  tabSize: 2,
                }}
                onChange={(value) => {
                  if (onChange) {
                    onChange(value);
                  } else {
                    field.onChange(value);
                  }
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.onDidBlurEditorWidget(() => {
                    field.onBlur();
                    if (onBlur) onBlur();
                  });
                }}
              />
            </Box>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
          </>
        )}
      />
    </FormControl>
  );
}

export default FormControlMonacoField;
