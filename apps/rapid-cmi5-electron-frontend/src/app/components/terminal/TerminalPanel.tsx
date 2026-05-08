import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  PANEL_TRANSITION_MS,
  SessionStatus,
  TabButton,
  TerminalView,
  readStoredBool,
  readStoredNumber,
} from './TerminalView';

const STORAGE_KEY_HEIGHT = 'terminalPanel.height';
const STORAGE_KEY_OPEN = 'terminalPanel.open';
const MIN_HEIGHT = 160;
const DEFAULT_HEIGHT = 320;

interface TerminalPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFloatingButton?: boolean;
}

export default function TerminalPanel(props: TerminalPanelProps) {
  if (typeof window === 'undefined' || !window.terminalApi) return null;
  return <TerminalPanelInner {...props} />;
}

function TerminalPanelInner({
  open: controlledOpen,
  onOpenChange,
  showFloatingButton = true,
}: TerminalPanelProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(() =>
    readStoredBool(STORAGE_KEY_OPEN, false),
  );
  const open = controlledOpen ?? uncontrolledOpen;
  const [mounted, setMounted] = useState<boolean>(open);
  const [height, setHeight] = useState<number>(() =>
    readStoredNumber(STORAGE_KEY_HEIGHT, DEFAULT_HEIGHT),
  );
  const [resizing, setResizing] = useState(false);
  const [status, setStatus] = useState<{
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
    if (open) setMounted(true);
  }, [open]);

  const setPanelOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
      if (nextOpen) setMounted(true);
    },
    [isControlled, onOpenChange],
  );

  const handleOpen = useCallback(() => {
    setPanelOpen(true);
  }, [setPanelOpen]);

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

  const onStatusChange = useCallback(
    (s: SessionStatus, detail: string) => setStatus({ status: s, detail }),
    [],
  );

  return (
    <>
      <Fade in={showFloatingButton && !open} timeout={180} unmountOnExit>
        <div
          style={{
            position: 'fixed',
            bottom: 60,
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
            onClick={handleOpen}
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
              active
              onClick={() => undefined}
              label="Terminal"
              status={status.status}
            />
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}
          >
            <Tooltip title="Hide" placement="top">
              <IconButton
                size="small"
                onClick={() => setPanelOpen(false)}
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
          {mounted && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: 4,
              }}
            >
              <TerminalView
                api={window.terminalApi}
                visible={open}
                onStatusChange={onStatusChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
