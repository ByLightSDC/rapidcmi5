import { useCallback, useRef, useState } from 'react';
import { usePublisher, useCellValue } from '@mdxeditor/gurx';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  keyframes,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material';
import { MUIButtonWithTooltip } from './MUIButtonWithTooltip';
import { aiShowSeq$ } from './drawers';
import { useRapidCmi5Opts } from '../../../course-builder/GitViewer/session/RapidCmi5OptsContext';

const thinkingPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0px rgba(0, 122, 204, 0); }
  50%       { box-shadow: 0 0 0 4px rgba(0, 122, 204, 0.55); }
`;

type AiMode = 'claude' | 'codex' | 'terminal';

const MODE_OPTIONS: { mode: AiMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'claude',   label: 'Open Claude',   icon: <SmartToyOutlinedIcon fontSize="small" /> },
  { mode: 'codex',    label: 'Open Codex',    icon: <CodeOutlinedIcon fontSize="small" /> },
  { mode: 'terminal', label: 'Open Terminal', icon: <TerminalOutlinedIcon fontSize="small" /> },
];

export const InsertAiPanel = () => {
  const { onAiClick, aiThinking } = useRapidCmi5Opts();
  const publishShowSeq = usePublisher(aiShowSeq$);
  const showSeq = useCellValue(aiShowSeq$);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const open = useCallback((mode: AiMode) => {
    publishShowSeq(showSeq + 1);
    onAiClick?.(mode);
  }, [onAiClick, publishShowSeq, showSeq]);

  if (!onAiClick) return null;

  return (
    <Box ref={anchorRef} sx={{ display: 'inline-flex' }}>
      <ButtonGroup variant="text" size="small" disableElevation>
        <MUIButtonWithTooltip
          title={aiThinking ? 'AI is thinking...' : 'Open AI Panel'}
          onClick={() => open('claude')}
          sx={aiThinking ? {
            animation: `${thinkingPulse} 1.4s ease-in-out infinite`,
            borderRadius: '50%',
          } : undefined}
        >
          <SmartToyOutlinedIcon fontSize="medium" />
        </MUIButtonWithTooltip>
        <MUIButtonWithTooltip
          title="Choose AI tool"
          onClick={() => setDropdownOpen((prev) => !prev)}
          sx={{ minWidth: '16px', px: 0 }}
        >
          <ArrowDropDownIcon fontSize="small" />
        </MUIButtonWithTooltip>
      </ButtonGroup>

      <Popper
        open={dropdownOpen}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        style={{ zIndex: 1600 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper elevation={4}>
              <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                <MenuList dense>
                  {MODE_OPTIONS.map(({ mode, label, icon }) => (
                    <MenuItem
                      key={mode}
                      onClick={() => { open(mode); setDropdownOpen(false); }}
                      sx={{ gap: 1 }}
                    >
                      {icon} {label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};
