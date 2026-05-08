import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import { TerminalSquare, PanelBottomClose } from 'lucide-react';
import {
  SessionStatus,
  TabButton,
  TerminalView,
  readStoredBool,
} from './TerminalView';

const STORAGE_KEY_OPEN = 'terminalPanel.open';
const thinIconProps = {
  strokeWidth: 1.5,
  absoluteStrokeWidth: true,
};

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
  const [status, setStatus] = useState<{
    status: SessionStatus;
    detail: string;
  }>({ status: 'starting', detail: '' });

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
            startIcon={<TerminalSquare {...thinIconProps} size={18} />}
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
          position: isControlled ? 'relative' : 'fixed',
          left: isControlled ? undefined : 0,
          right: isControlled ? undefined : 0,
          bottom: isControlled ? undefined : 0,
          width: '100%',
          height: isControlled ? '100%' : 320,
          minWidth: 0,
          minHeight: 0,
          background: '#1e1e1e',
          borderTop: '1px solid #333',
          boxShadow:
            !isControlled && open ? '0 -8px 24px rgba(0,0,0,0.45)' : 'none',
          transform:
            isControlled || open ? 'translateY(0)' : 'translateY(100%)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: isControlled ? undefined : 1300,
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
              active
              onClick={() => undefined}
              icon={<TerminalSquare {...thinIconProps} size={18} />}
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
                <PanelBottomClose {...thinIconProps} size={18} />
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
