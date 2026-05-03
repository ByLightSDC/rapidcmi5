import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import CloseIcon from '@mui/icons-material/Close';

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
    terminalApi: PtyApi;
  }
}

type PanelMode = 'claude' | 'terminal';
type SessionStatus = 'starting' | 'running' | 'exited' | 'error';

const STORAGE_KEY_HEIGHT = 'claudeWindow.height';
const STORAGE_KEY_OPEN = 'claudeWindow.open';
const STORAGE_KEY_MODE = 'claudeWindow.mode';
const MIN_HEIGHT = 160;
const DEFAULT_HEIGHT = 320;
const PANEL_TRANSITION_MS = 240;

function readStoredNumber(key: string, fallback: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

function readStoredBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

function readStoredMode(fallback: PanelMode): PanelMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY_MODE);
    return v === 'claude' || v === 'terminal' ? v : fallback;
  } catch {
    return fallback;
  }
}

interface TerminalViewProps {
  api: PtyApi;
  visible: boolean;
  onStatusChange: (status: SessionStatus, detail: string) => void;
}

function TerminalView({ api, visible, onStatusChange }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string | null>(null);

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
    try {
      fit.fit();
    } catch {
      // container may be hidden at mount time
    }
    termRef.current = term;
    fitRef.current = fit;

    let disposed = false;

    const unsubData = api.onData((p) => {
      if (p.sessionId === sessionIdRef.current) term.write(p.data);
    });
    const unsubExit = api.onExit((p) => {
      if (p.sessionId !== sessionIdRef.current) return;
      onStatusChange('exited', `exit code ${p.code ?? '?'}`);
      term.write(`\r\n\x1b[33m[process exited: ${p.code ?? '?'}]\x1b[0m\r\n`);
    });
    const unsubError = api.onError((p) => {
      if (p.sessionId !== sessionIdRef.current) return;
      onStatusChange('error', p.message);
      term.write(`\r\n\x1b[31m[error: ${p.message}]\x1b[0m\r\n`);
    });

    const onTermData = term.onData((data) => {
      const id = sessionIdRef.current;
      if (id) api.input(id, data);
    });

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
        const id = sessionIdRef.current;
        if (id) api.resize(id, term.cols, term.rows);
      } catch {
        // container not yet measurable
      }
    });
    ro.observe(container);

    api
      .start({ cols: term.cols, rows: term.rows })
      .then(({ sessionId }) => {
        if (disposed) {
          api.stop(sessionId);
          return;
        }
        sessionIdRef.current = sessionId;
        onStatusChange('running', '');
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        onStatusChange('error', msg);
      });

    return () => {
      disposed = true;
      onTermData.dispose();
      unsubData();
      unsubExit();
      unsubError();
      ro.disconnect();
      const id = sessionIdRef.current;
      if (id) api.stop(id);
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // api/onStatusChange are stable callers; intentional one-shot init.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When this view becomes visible, refit so xterm picks up the real size.
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      const term = termRef.current;
      const fit = fitRef.current;
      if (!term || !fit) return;
      try {
        fit.fit();
        const id = sessionIdRef.current;
        if (id) api.resize(id, term.cols, term.rows);
        term.focus();
      } catch {
        // ignore
      }
    }, PANEL_TRANSITION_MS + 20);
    return () => clearTimeout(t);
  }, [visible, api]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  status: SessionStatus;
}

function TabButton({ active, onClick, icon, label, status }: TabButtonProps) {
  const statusColor =
    status === 'error'
      ? '#f48771'
      : status === 'exited'
      ? '#d7ba7d'
      : status === 'running'
      ? '#73c991'
      : '#888';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: active ? '#1e1e1e' : 'transparent',
        color: active ? '#ffffff' : '#cccccc',
        border: 'none',
        borderTop: active ? '1px solid #007acc' : '1px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        height: '100%',
      }}
    >
      {icon}
      <span>{label}</span>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: statusColor,
          marginLeft: 2,
        }}
      />
    </button>
  );
}

export default function ClaudeWindow() {
  const [open, setOpen] = useState<boolean>(() =>
    readStoredBool(STORAGE_KEY_OPEN, false),
  );
  const [mode, setMode] = useState<PanelMode>(() => readStoredMode('claude'));
  const [openedModes, setOpenedModes] = useState<Set<PanelMode>>(() => {
    const initialOpen = readStoredBool(STORAGE_KEY_OPEN, false);
    return initialOpen ? new Set<PanelMode>([readStoredMode('claude')]) : new Set();
  });
  const [height, setHeight] = useState<number>(() =>
    readStoredNumber(STORAGE_KEY_HEIGHT, DEFAULT_HEIGHT),
  );
  const [resizing, setResizing] = useState(false);

  const [claudeStatus, setClaudeStatus] = useState<{
    status: SessionStatus;
    detail: string;
  }>({ status: 'starting', detail: '' });
  const [terminalStatus, setTerminalStatus] = useState<{
    status: SessionStatus;
    detail: string;
  }>({ status: 'starting', detail: '' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HEIGHT, String(height));
    } catch {
      // storage unavailable
    }
  }, [height]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OPEN, String(open));
    } catch {
      // storage unavailable
    }
  }, [open]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch {
      // storage unavailable
    }
  }, [mode]);

  const openWith = useCallback((m: PanelMode) => {
    setOpenedModes((prev) => {
      if (prev.has(m)) return prev;
      const next = new Set(prev);
      next.add(m);
      return next;
    });
    setMode(m);
    setOpen(true);
  }, []);

  const switchTo = useCallback((m: PanelMode) => {
    setOpenedModes((prev) => {
      if (prev.has(m)) return prev;
      const next = new Set(prev);
      next.add(m);
      return next;
    });
    setMode(m);
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = height;
      const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - 80);
      setResizing(true);

      const onMove = (ev: MouseEvent) => {
        const dy = startY - ev.clientY;
        const next = Math.max(
          MIN_HEIGHT,
          Math.min(maxHeight, startHeight + dy),
        );
        setHeight(next);
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setResizing(false);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [height],
  );

  const claudeStatusChange = useCallback(
    (status: SessionStatus, detail: string) =>
      setClaudeStatus({ status, detail }),
    [],
  );
  const terminalStatusChange = useCallback(
    (status: SessionStatus, detail: string) =>
      setTerminalStatus({ status, detail }),
    [],
  );

  return (
    <>
      <Fade in={!open} timeout={180} unmountOnExit>
        <div
          style={{
            position: 'fixed',
            bottom: 12,
            right: 12,
            zIndex: 1299,
            display: 'flex',
            gap: 8,
          }}
        >
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => openWith('claude')}
            startIcon={<SmartToyOutlinedIcon />}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              paddingX: 1.5,
              paddingY: 0.5,
              minHeight: 0,
            }}
          >
            Open AI Agent
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={() => openWith('terminal')}
            startIcon={<TerminalOutlinedIcon />}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              paddingX: 1.5,
              paddingY: 0.5,
              minHeight: 0,
            }}
          >
            Open Terminal
          </Button>
        </div>
      </Fade>

      <div
        aria-hidden={!open}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height,
          background: '#1e1e1e',
          borderTop: '1px solid #333',
          boxShadow: open ? '0 -8px 24px rgba(0,0,0,0.45)' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: resizing
            ? 'none'
            : `transform ${PANEL_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow ${PANEL_TRANSITION_MS}ms ease`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
          willChange: 'transform',
        }}
      >
        <div
          onMouseDown={onResizeStart}
          aria-label="Resize panel"
          role="separator"
          style={{
            position: 'absolute',
            top: -3,
            left: 0,
            right: 0,
            height: 6,
            cursor: 'ns-resize',
            zIndex: 2,
            background: resizing ? 'rgba(100, 150, 255, 0.4)' : 'transparent',
            transition: 'background 120ms ease',
          }}
          onMouseEnter={(e) => {
            if (!resizing)
              e.currentTarget.style.background = 'rgba(100, 150, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            if (!resizing) e.currentTarget.style.background = 'transparent';
          }}
        />

        <div
          style={{
            background: '#252526',
            color: '#cccccc',
            fontFamily: 'Menlo, monospace',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            flex: '0 0 auto',
            height: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <TabButton
              active={mode === 'claude'}
              onClick={() => switchTo('claude')}
              icon={<SmartToyOutlinedIcon style={{ fontSize: 14 }} />}
              label="AI Agent"
              status={claudeStatus.status}
            />
            <TabButton
              active={mode === 'terminal'}
              onClick={() => switchTo('terminal')}
              icon={<TerminalOutlinedIcon style={{ fontSize: 14 }} />}
              label="Terminal"
              status={terminalStatus.status}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}>
            <Tooltip title="Hide" placement="top">
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{
                  color: '#cccccc',
                  '&:hover': { color: '#ffffff' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {openedModes.has('claude') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: 4,
                display: mode === 'claude' ? 'block' : 'none',
              }}
            >
              <TerminalView
                api={window.claudeApi}
                visible={open && mode === 'claude'}
                onStatusChange={claudeStatusChange}
              />
            </div>
          )}
          {openedModes.has('terminal') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: 4,
                display: mode === 'terminal' ? 'block' : 'none',
              }}
            >
              <TerminalView
                api={window.terminalApi}
                visible={open && mode === 'terminal'}
                onStatusChange={terminalStatusChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
