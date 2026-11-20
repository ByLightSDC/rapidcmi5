import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { mermaid as mermaidLanguage } from 'codemirror-lang-mermaid';
import {
  MermaidDiagram,
  MermaidEditDialogProps,
  parseMermaid,
} from '@rapid-cmi5/ui';

/** wait for a pause in typing before parsing / re-rendering the preview */
const PREVIEW_DEBOUNCE_MS = 400;

type CheckState =
  | { status: 'checking' }
  | { status: 'valid' }
  | { status: 'invalid'; message: string };

/**
 * Edit a mermaid diagram's source with a live preview.
 *
 * The preview keeps the last version that parsed, so a half-typed line
 * doesn't flash an error card on every keystroke. Saving an invalid diagram
 * is allowed (authors may save work in progress) but warned about.
 */
export function MermaidEditDialog({
  code,
  onSave,
  onClose,
}: MermaidEditDialogProps) {
  const [draft, setDraft] = useState(code);
  const [lastValid, setLastValid] = useState<string | null>(null);
  const [check, setCheck] = useState<CheckState>({ status: 'checking' });

  useEffect(() => {
    // keep showing the previous result until this check finishes, so the
    // error message doesn't flicker while typing
    let cancelled = false;
    const timer = setTimeout(() => {
      parseMermaid(draft).then((message) => {
        // a newer draft has been typed since; ignore this result
        if (cancelled) return;
        if (message === null) {
          setCheck({ status: 'valid' });
          setLastValid(draft);
        } else {
          setCheck({ status: 'invalid', message });
        }
      });
    }, PREVIEW_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft]);

  const isDirty = draft !== code;
  const isInvalid = check.status === 'invalid';

  return (
    <Dialog
      open
      fullWidth
      maxWidth="lg"
      aria-labelledby="mermaid-edit-dialog-title"
      onClose={(_event, reason) => {
        // a stray click outside shouldn't throw away edits
        if (reason === 'backdropClick' && isDirty) return;
        onClose();
      }}
      // The dialog is portaled, but React events still bubble through the
      // component tree into the Lexical decorator that rendered it.
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <DialogTitle id="mermaid-edit-dialog-title">Edit diagram</DialogTitle>
      <DialogContent>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Mermaid source
            </Typography>
            <MermaidSourceEditor initialCode={code} onChange={setDraft} />
            {isInvalid ? (
              <Alert severity="error" role="alert">
                <Typography
                  component="pre"
                  variant="body2"
                  sx={{
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                >
                  {check.message}
                </Typography>
              </Alert>
            ) : (
              <Typography
                variant="body2"
                color={check.status === 'valid' ? 'success.main' : 'text.secondary'}
              >
                {check.status === 'valid' ? 'Valid diagram' : 'Checking…'}
              </Typography>
            )}
          </Stack>

          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Preview
            </Typography>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                minHeight: 300,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {isInvalid && lastValid !== null && (
                <Alert severity="warning" sx={{ borderRadius: 0 }}>
                  Showing the last version that worked
                </Alert>
              )}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isInvalid ? 0.45 : 1,
                }}
              >
                {lastValid !== null ? (
                  <Box sx={{ width: '100%' }}>
                    <MermaidDiagram code={lastValid} />
                  </Box>
                ) : (
                  isInvalid && (
                    <Typography variant="body2" color="text.secondary">
                      Fix the error to see a preview
                    </Typography>
                  )
                )}
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              The preview updates when you stop typing.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        {isInvalid && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ flex: '1 1 320px', alignItems: 'center', color: 'warning.main' }}
          >
            <WarningAmberIcon fontSize="small" />
            <Typography variant="body2">
              This diagram has an error. You can still save it, but learners
              will see an error instead of the diagram until it's fixed.
            </Typography>
          </Stack>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!isDirty}
          onClick={() => onSave(draft)}
        >
          {isInvalid ? 'Save anyway' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const themeCompartment = new Compartment();

/**
 * CodeMirror instance for the dialog. Kept as its own component so its ref
 * exists when the effect runs (Dialog content mounts after the portal).
 * Uncontrolled: initialCode seeds it once, edits flow out through onChange.
 */
function MermaidSourceEditor({
  initialCode,
  onChange,
}: {
  initialCode: string;
  onChange: (code: string) => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  useEffect(() => {
    const view = new EditorView({
      parent: elRef.current!,
      state: EditorState.create({
        doc: initialCode,
        extensions: [
          basicSetup,
          mermaidLanguage(),
          themeCompartment.of(isDark ? githubDark : githubLight),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': 'Mermaid source' }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    viewRef.current = view;
    view.focus();
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // created once; initialCode only seeds the document
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.reconfigure(isDark ? githubDark : githubLight),
    });
  }, [isDark]);

  return (
    <Box
      ref={elRef}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '& .cm-editor': { minHeight: 300, maxHeight: '55vh' },
        '& .cm-scroller': { fontFamily: 'monospace' },
      }}
    />
  );
}
