import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export interface PtyStartOptions {
  cwd?: string;
  args?: string[];
  command?: string;
  cols?: number;
  rows?: number;
}

export interface PtyDataPayload {
  sessionId: string;
  data: string;
  stream: 'stdout' | 'stderr';
}

export interface PtyExitPayload {
  sessionId: string;
  code: number | null;
  signal: string | null;
}

export interface PtyErrorPayload {
  sessionId: string;
  message: string;
}

export interface PtyApi {
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

export type SessionStatus = 'starting' | 'running' | 'exited' | 'error';

export const PANEL_TRANSITION_MS = 240;

export function readStoredNumber(key: string, fallback: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}

export function readStoredBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return fallback;
  } catch {
    return fallback;
  }
}

interface TerminalViewProps {
  api: PtyApi;
  visible: boolean;
  onStatusChange: (status: SessionStatus, detail: string) => void;
}

export function TerminalView({
  api,
  visible,
  onStatusChange,
}: TerminalViewProps) {
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

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  status: SessionStatus;
}

export function TabButton({
  active,
  onClick,
  label,
  status,
}: TabButtonProps) {
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
