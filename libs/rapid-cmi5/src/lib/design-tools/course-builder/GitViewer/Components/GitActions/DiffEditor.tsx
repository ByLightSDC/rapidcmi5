import { Box } from '@mui/material';
import { DiffEditor } from '@monaco-editor/react';

export default function MonacoDiff({
  original,
  modified,
  language = 'typescript', // 'javascript' | 'json' | 'markdown' | etc.
  height = 600,
}: {
  original: string;
  modified: string;
  language?: string;
  height?: number | string;
}) {
  return (
    <Box sx={{ height, border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        theme="vs-dark"             // or 'light', or switch from MUI theme
        options={{
          
          readOnly: true,
          renderSideBySide: true,   // false = unified
          wordWrap: 'off',          // 'on' | 'bounded' | 'off'
          minimap: { enabled: false },
          renderIndicators: true,
          ignoreTrimWhitespace: true,
          // diffAlgorithm: 'advanced', // try for better diffs (Monaco 0.44+)
        }}
      />
    </Box>
  );
}
