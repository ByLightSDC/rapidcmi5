import {
  forwardRef,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import {
  Box,
  IconButton,
  LinearProgress,
  Tab,
  Tabs,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';

interface PtyStartOptions {
  cwd?: string;
  args?: string[];
  command?: string;
  cols?: number;
  rows?: number;
}

interface PtyDataPayload {
  sessionId: string;
  data: string;
  stream: 'stdout' | 'stderr';
}

interface PtyExitPayload {
  sessionId: string;
  code: number | null;
  signal: string | null;
}

interface PtyErrorPayload {
  sessionId: string;
  message: string;
}

interface PtyApi {
  start: (opts?: PtyStartOptions) => Promise<{ sessionId: string }>;
  input: (sessionId: string, data: string) => Promise<void>;
  resize: (sessionId: string, cols: number, rows: number) => Promise<void>;
  stop: (sessionId: string) => Promise<void>;
  onData: (handler: (payload: PtyDataPayload) => void) => () => void;
  onExit: (handler: (payload: PtyExitPayload) => void) => () => void;
  onError: (handler: (payload: PtyErrorPayload) => void) => () => void;
}

declare global {
  interface Window {
    claudeApi: PtyApi;
    codexApi: PtyApi;
    terminalApi: PtyApi;
  }
}

type PanelMode = 'claude' | 'codex' | 'terminal';
type SessionStatus = 'starting' | 'running' | 'exited' | 'error';

const STORAGE_KEY_MODE = 'aiDrawer.mode';

const THINKING_CLEAR_DEBOUNCE_MS = 600;

function readStoredMode(fallback: PanelMode): PanelMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY_MODE);
    return v === 'claude' || v === 'codex' || v === 'terminal' ? v : fallback;
  } catch {
    return fallback;
  }
}

export interface TerminalViewHandle {
  fitNow: () => void;
}

interface TerminalViewProps {
  api: PtyApi;
  onStatusChange: (status: SessionStatus) => void;
  onThinkingChange: (thinking: boolean) => void;
}

// No ResizeObserver — xterm columns are recalculated only when the parent
// explicitly calls fitNow() (i.e. once after the drawer open animation ends).
// This prevents fit.fit() → canvas resize → observer fires → fit.fit() loops.
const TerminalView = forwardRef<TerminalViewHandle, TerminalViewProps>(
  function TerminalView({ api, onStatusChange, onThinkingChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitRef = useRef<FitAddon | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const clearThinkingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const thinkingRef = useRef(false);

    const setThinking = useCallback((v: boolean) => {
      if (thinkingRef.current === v) return;
      thinkingRef.current = v;
      onThinkingChange(v);
    }, [onThinkingChange]);

    useImperativeHandle(ref, () => ({
      fitNow() {
        const term = termRef.current;
        const fit = fitRef.current;
        if (!term || !fit) return;
        try {
          fit.fit();
          const id = sessionIdRef.current;
          if (id) api.resize(id, term.cols, term.rows);
          term.focus();
        } catch { /* ignore */ }
      },
    }), [api]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const term = new Terminal({
        convertEol: true,
        cursorBlink: true,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        fontSize: 13,
        theme: { background: '#1e1e1e', foreground: '#d4d4d4' },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(container);
      termRef.current = term;
      fitRef.current = fit;

      let disposed = false;

      const unsubData = api.onData((p) => {
        if (p.sessionId !== sessionIdRef.current) return;
        term.write(p.data);
        if (clearThinkingTimer.current) clearTimeout(clearThinkingTimer.current);
        clearThinkingTimer.current = setTimeout(() => setThinking(false), THINKING_CLEAR_DEBOUNCE_MS);
      });

      const unsubExit = api.onExit((p) => {
        if (p.sessionId !== sessionIdRef.current) return;
        setThinking(false);
        onStatusChange('exited');
        term.write(`\r\n\x1b[33m[process exited: ${p.code ?? '?'}]\x1b[0m\r\n`);
      });

      const unsubError = api.onError((p) => {
        if (p.sessionId !== sessionIdRef.current) return;
        setThinking(false);
        onStatusChange('error');
        term.write(`\r\n\x1b[31m[error: ${p.message}]\x1b[0m\r\n`);
      });

      const onTermData = term.onData((data) => {
        const id = sessionIdRef.current;
        if (id) {
          api.input(id, data);
          if (data === '\r' || data === '\n') {
            if (clearThinkingTimer.current) clearTimeout(clearThinkingTimer.current);
            setThinking(true);
          }
        }
      });

      api.start({ cols: term.cols, rows: term.rows })
        .then(({ sessionId }) => {
          if (disposed) { api.stop(sessionId); return; }
          sessionIdRef.current = sessionId;
          onStatusChange('running');
        })
        .catch(() => onStatusChange('error'));

      return () => {
        disposed = true;
        if (clearThinkingTimer.current) clearTimeout(clearThinkingTimer.current);
        onTermData.dispose();
        unsubData(); unsubExit(); unsubError();
        const id = sessionIdRef.current;
        if (id) api.stop(id);
        term.dispose();
        termRef.current = null;
        fitRef.current = null;
      };
      // intentional one-shot init
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }
);

interface AiDrawerProps {
  open: boolean;
  onClose: () => void;
  initialMode?: PanelMode;
  onThinkingChange?: (thinking: boolean) => void;
  onResizeStart?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  resizeToken?: number;
}

export default function AiDrawer({
  open,
  onClose,
  initialMode,
  onThinkingChange,
  onResizeStart,
  resizeToken,
}: AiDrawerProps) {
  const [mode, setMode] = useState<PanelMode>(() =>
    initialMode ?? readStoredMode('claude'),
  );
  const [openedModes, setOpenedModes] = useState<Set<PanelMode>>(new Set());

  const [claudeStatus, setClaudeStatus] = useState<SessionStatus>('starting');
  const [codexStatus, setCodexStatus] = useState<SessionStatus>('starting');
  const [terminalStatus, setTerminalStatus] = useState<SessionStatus>('starting');

  const [claudeThinking, setClaudeThinking] = useState(false);
  const [codexThinking, setCodexThinking] = useState(false);

  const claudeRef = useRef<TerminalViewHandle>(null);
  const codexRef = useRef<TerminalViewHandle>(null);
  const terminalRef = useRef<TerminalViewHandle>(null);
  const drawerPaperRef = useRef<HTMLDivElement | null>(null);

  const isThinking = (mode === 'claude' && claudeThinking) ||
                     (mode === 'codex' && codexThinking);

  useEffect(() => {
    onThinkingChange?.(isThinking);
  }, [isThinking, onThinkingChange]);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // When drawer opens, ensure current mode is in openedModes
  useEffect(() => {
    if (!open) return;
    setOpenedModes((prev) => {
      if (prev.has(mode)) return prev;
      const next = new Set(prev);
      next.add(mode);
      return next;
    });
  }, [open, mode]);

  useEffect(() => {
    if (!open || !openedModes.has(mode)) return;
    const fitTimer = setTimeout(() => {
      const activeRef =
        mode === 'claude' ? claudeRef :
        mode === 'codex'  ? codexRef  : terminalRef;
      activeRef.current?.fitNow();
    }, 0);

    return () => clearTimeout(fitTimer);
  }, [mode, open, openedModes, resizeToken]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_MODE, mode); } catch { /* ignore */ }
  }, [mode]);

  // Call fit exactly once after the panel finishes its open animation.
  // We listen for transitionend so we don't depend on a hardcoded timeout.
  useEffect(() => {
    if (!open) return;
    const paper = drawerPaperRef.current;
    if (!paper) return;

    const onTransitionEnd = (e: TransitionEvent) => {
      // Ignore child transitions, such as opacity on the loading indicator.
      if (e.target !== paper) return;
      const activeRef =
        mode === 'claude' ? claudeRef :
        mode === 'codex'  ? codexRef  : terminalRef;
      activeRef.current?.fitNow();
    };

    paper.addEventListener('transitionend', onTransitionEnd);
    return () => paper.removeEventListener('transitionend', onTransitionEnd);
  }, [open, mode]);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newMode: PanelMode) => {
    setMode(newMode);
    setOpenedModes((prev) => {
      if (prev.has(newMode)) return prev;
      const next = new Set(prev);
      next.add(newMode);
      return next;
    });
    // When switching tabs, fit the newly visible terminal immediately
    // (it was hidden so its canvas may be stale).
    setTimeout(() => {
      const activeRef =
        newMode === 'claude' ? claudeRef :
        newMode === 'codex'  ? codexRef  : terminalRef;
      activeRef.current?.fitNow();
    }, 0);
  }, []);

  const noOp = useCallback(() => {}, []);

  const statusDot = (status: SessionStatus) => (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        ml: 0.75,
        bgcolor:
          status === 'running' ? '#73c991' :
          status === 'error'   ? '#f48771' :
          status === 'exited'  ? '#d7ba7d' : '#888',
      }}
    />
  );

  return (
    <Box
      ref={drawerPaperRef}
      component="aside"
      aria-hidden={!open}
      sx={{
        height: '100%',
        minHeight: 0,
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e1e1e',
        borderTop: open ? '1px solid #333' : 0,
        overflow: 'hidden',
        transition: (theme) =>
          theme.transitions.create(['border-width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Box
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize AI terminal"
        onPointerDown={onResizeStart}
        sx={{
          flex: '0 0 6px',
          cursor: 'row-resize',
          bgcolor: '#252526',
          borderBottom: '1px solid #333',
          '&:hover': {
            bgcolor: '#333',
          },
          '&::before': {
            content: '""',
            display: 'block',
            width: 40,
            height: 2,
            mx: 'auto',
            mt: '2px',
            borderRadius: 1,
            bgcolor: '#666',
          },
        }}
      />

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#252526',
          borderBottom: isThinking ? 'none' : '1px solid #333',
          flex: '0 0 auto',
          pl: 1,
          pr: 0.5,
          minHeight: 40,
        }}
      >
        <Tabs
          value={mode}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: 12,
              color: '#ccc',
              textTransform: 'none',
              py: 0,
              px: 1.5,
            },
            '& .Mui-selected': { color: '#fff' },
            '& .MuiTabs-indicator': { backgroundColor: '#007acc' },
          }}
        >
          <Tab
            value="claude"
            icon={<SmartToyOutlinedIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={<span>Claude {statusDot(claudeStatus)}</span>}
          />
          <Tab
            value="codex"
            icon={<CodeOutlinedIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={<span>Codex {statusDot(codexStatus)}</span>}
          />
          <Tab
            value="terminal"
            icon={<TerminalOutlinedIcon sx={{ fontSize: 14 }} />}
            iconPosition="start"
            label={<span>Terminal {statusDot(terminalStatus)}</span>}
          />
        </Tabs>

        <Tooltip title="Close" placement="left">
          <IconButton size="small" onClick={onClose} sx={{ color: '#ccc', '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Thinking indicator — replaces the bottom border of the header */}
      <LinearProgress
        sx={{
          flex: '0 0 auto',
          height: 2,
          bgcolor: '#333',
          opacity: isThinking ? 1 : 0,
          transition: 'opacity 200ms ease',
          '& .MuiLinearProgress-bar': { bgcolor: '#007acc' },
        }}
      />

      {/* Terminal panels */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {openedModes.has('claude') && (
          <Box sx={{
            position: 'absolute', inset: 0, p: 0.5,
            display: mode === 'claude' ? 'block' : 'none',
          }}>
            <TerminalView
              ref={claudeRef}
              api={window.claudeApi}
              onStatusChange={setClaudeStatus}
              onThinkingChange={setClaudeThinking}
            />
          </Box>
        )}
        {openedModes.has('codex') && (
          <Box sx={{
            position: 'absolute', inset: 0, p: 0.5,
            display: mode === 'codex' ? 'block' : 'none',
          }}>
            <TerminalView
              ref={codexRef}
              api={window.codexApi}
              onStatusChange={setCodexStatus}
              onThinkingChange={setCodexThinking}
            />
          </Box>
        )}
        {openedModes.has('terminal') && (
          <Box sx={{
            position: 'absolute', inset: 0, p: 0.5,
            display: mode === 'terminal' ? 'block' : 'none',
          }}>
            <TerminalView
              ref={terminalRef}
              api={window.terminalApi}
              onStatusChange={setTerminalStatus}
              onThinkingChange={noOp}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
