import { useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { PanelRightCloseIcon, PackageXIcon } from 'lucide-react';
import {
  SessionStatus,
  TabButton,
  TerminalView,
} from './TerminalView';

interface NotInstalledOverlayProps {
  name: string;
  installCommand: string;
}

function NotInstalledOverlay({ name, installCommand }: NotInstalledOverlayProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 32,
        zIndex: 10,
      }}
    >
      <PackageXIcon size={36} color="#f48771" strokeWidth={1.5} />
      <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 600 }}>
        {name} is not installed
      </div>
      <div
        style={{
          color: '#888',
          fontSize: 12,
          textAlign: 'center',
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Install {name} to use this panel. Run the following in your terminal:
      </div>
      <div
        style={{
          background: '#252526',
          border: '1px solid #3c3c3c',
          borderRadius: 4,
          padding: '7px 14px',
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          fontSize: 12,
          color: '#9cdcfe',
          userSelect: 'all',
        }}
      >
        {installCommand}
      </div>
    </div>
  );
}

type AgentMode = 'claude' | 'codex';

const STORAGE_KEY_MODE = 'codingAgents.mode';

function readStoredMode(fallback: AgentMode): AgentMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY_MODE);
    return v === 'claude' || v === 'codex' ? v : fallback;
  } catch {
    return fallback;
  }
}

interface CodingAgentsPanelProps {
  open: boolean;
  onClose: () => void;
  onThinkingChange?: (thinking: boolean) => void;
}

export default function CodingAgentsPanel(props: CodingAgentsPanelProps) {
  if (typeof window === 'undefined') return null;
  if (!window.claudeApi && !window.codexApi) return null;
  return <CodingAgentsPanelInner {...props} />;
}

function CodingAgentsPanelInner({
  open,
  onClose,
  onThinkingChange,
}: CodingAgentsPanelProps) {
  const [mode, setMode] = useState<AgentMode>(() => readStoredMode('claude'));
  const [openedModes, setOpenedModes] = useState<Set<AgentMode>>(() =>
    open ? new Set<AgentMode>([readStoredMode('claude')]) : new Set(),
  );

  const [claudeStatus, setClaudeStatus] = useState<{
    status: SessionStatus;
    detail: string;
  }>({ status: 'starting', detail: '' });
  const [codexStatus, setCodexStatus] = useState<{
    status: SessionStatus;
    detail: string;
  }>({ status: 'starting', detail: '' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch {
      // storage unavailable
    }
  }, [mode]);

  // Mount the active mode's terminal lazily — only the first time it's shown.
  useEffect(() => {
    if (!open) return;
    setOpenedModes((prev) => {
      if (prev.has(mode)) return prev;
      const next = new Set(prev);
      next.add(mode);
      return next;
    });
  }, [open, mode]);

  // Treat "active session running" as the thinking signal. Refine if you need
  // a tighter heuristic (e.g., recent stdout activity).
  useEffect(() => {
    if (!onThinkingChange) return;
    const active = mode === 'claude' ? claudeStatus : codexStatus;
    onThinkingChange(active.status === 'running');
  }, [mode, claudeStatus, codexStatus, onThinkingChange]);

  const switchTo = useCallback((m: AgentMode) => setMode(m), []);

  const claudeStatusChange = useCallback(
    (status: SessionStatus, detail: string) =>
      setClaudeStatus({ status, detail }),
    [],
  );
  const codexStatusChange = useCallback(
    (status: SessionStatus, detail: string) =>
      setCodexStatus({ status, detail }),
    [],
  );

  return (
    <div
      aria-hidden={!open}
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        background: '#1e1e1e',
        borderLeft: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
            label="Claude"
            status={claudeStatus.status}
          />
          <TabButton
            active={mode === 'codex'}
            onClick={() => switchTo('codex')}
            label="Codex"
            status={codexStatus.status}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}>
          <Tooltip title="Hide" placement="top">
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#cccccc',
                '&:hover': { color: '#ffffff' },
              }}
            >
              <PanelRightCloseIcon
                size={20}
                strokeWidth={1.75}
                absoluteStrokeWidth={true}
              />
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
              missingBinaryName="claude"
            />
          </div>
        )}
        {openedModes.has('codex') && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: 4,
              display: mode === 'codex' ? 'block' : 'none',
            }}
          >
            <TerminalView
              api={window.codexApi}
              visible={open && mode === 'codex'}
              onStatusChange={codexStatusChange}
              missingBinaryName="codex"
            />
          </div>
        )}
        {mode === 'claude' &&
          claudeStatus.status === 'error' &&
          /could not be found/i.test(claudeStatus.detail) && (
            <NotInstalledOverlay
              name="Claude"
              installCommand="npm install -g @anthropic-ai/claude-code"
            />
          )}
        {mode === 'codex' &&
          codexStatus.status === 'error' &&
          /could not be found/i.test(codexStatus.detail) && (
            <NotInstalledOverlay
              name="Codex"
              installCommand="npm install -g @openai/codex"
            />
          )}
      </div>
    </div>
  );
}
