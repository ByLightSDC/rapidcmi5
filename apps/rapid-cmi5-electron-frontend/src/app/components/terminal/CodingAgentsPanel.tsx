import { useCallback, useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { X } from 'lucide-react'
import {
  SessionStatus,
  TabButton,
  TerminalView,
} from './TerminalView';

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
              <X fontSize="small" />
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
