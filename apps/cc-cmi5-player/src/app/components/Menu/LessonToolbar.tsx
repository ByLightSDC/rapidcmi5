import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import VerticalSplitIcon from '@mui/icons-material/VerticalSplit';
import ReorderIcon from '@mui/icons-material/Reorder';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { alpha, Stack, Switch, Tooltip, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme, themeColor } from '@rapid-cmi5/ui';
import StudentInfoButton from './StudentInfoButton';
import BuildInfoButton from './BuildInfoButton';

interface LessonToolbarProps {
  isMenuDrawerOpen: boolean;
  isSplitPanelShown: boolean;
  onDrawerOpen: () => void;
  onDrawerClose: () => void;
  onSplitOn: () => void;
  onSplitOff: () => void;
}

export default function LessonToolbar({
  isMenuDrawerOpen,
  isSplitPanelShown,
  onDrawerOpen,
  onDrawerClose,
  onSplitOn,
  onSplitOff,
}: LessonToolbarProps) {
  const dispatch = useDispatch();
  const theColor = useSelector(themeColor);
  const { palette } = useTheme();

  return (
    <Stack
      role="toolbar"
      aria-label="Lesson Options"
      direction="row"
      sx={{
        position: 'absolute',
        zIndex: (theme) => theme.zIndex.appBar + 1,
        backgroundColor: alpha(palette.background.paper, 0.9),
        borderRadius: '6px',
        width: '100%',
      }}
    >
      <Tooltip
        title={isMenuDrawerOpen ? 'Collapse Navigation' : 'Open Navigation'}
      >
        <IconButton
          aria-label={
            isMenuDrawerOpen ? 'Collapse Navigation' : 'Open Navigation'
          }
          size="small"
          color="primary"
          onClick={() => (isMenuDrawerOpen ? onDrawerClose() : onDrawerOpen())}
        >
          {isMenuDrawerOpen ? (
            <KeyboardArrowLeftIcon />
          ) : (
            <KeyboardArrowRightIcon />
          )}
        </IconButton>
      </Tooltip>

      <Tooltip title="Turn Split Screen On">
        <IconButton
          aria-label="Turn Split Screen On"
          color="primary"
          disabled={isSplitPanelShown}
          onClick={() => (isSplitPanelShown ? onSplitOff() : onSplitOn())}
        >
          <VerticalSplitIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Turn Split Screen Off">
        <IconButton
          aria-label="Turn Split Screen Off"
          color="primary"
          disabled={!isSplitPanelShown}
          onClick={() => (isSplitPanelShown ? onSplitOff() : onSplitOn())}
        >
          <ReorderIcon />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          theColor === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
        }
      >
        <Switch
          checked={theColor === 'dark'}
          slotProps={{
            input: {
              'aria-label':
                theColor === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode',
              role: 'switch',
            },
          }}
          icon={
            <LightModeIcon
              name="Light Mode"
              color="primary"
              fontSize="small"
              sx={{
                backgroundColor: 'background.default',
                borderRadius: '12px',
                borderStyle: 1,
              }}
            />
          }
          checkedIcon={
            <DarkModeIcon
              name="Dark Mode"
              color="primary"
              fontSize="small"
              sx={{
                backgroundColor: 'background.default',
                borderRadius: '12px',
                borderStyle: 1,
              }}
            />
          }
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(setTheme(event.target.checked ? 'dark' : 'light'));
          }}
        />
      </Tooltip>

      <StudentInfoButton />
      <BuildInfoButton />
    </Stack>
  );
}
