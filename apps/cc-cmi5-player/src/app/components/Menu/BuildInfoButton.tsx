import { useState } from 'react';
import IconButton from '@mui/material/IconButton';

import {
  Divider,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { courseDataSel } from '../../redux/auReducer';
import { TOOLTIP_ENTER_DELAY, TOOLTIP_ENTER_NEXT_DELAY } from './shared';
import { RapidCmi5Icon, RapidCmi5Title } from '@rapid-cmi5/ui';

/*
  This allows course managers and developers to debug issues in their course.
  By adding in a simple way to check where a course came from and what version of 
  rapid cmi5 it is running we can quickly see if there is a version mismatch.
*/
export default function BuildInfoButton({ color }: { color?: string }) {
  const courseData = useSelector(courseDataSel);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const theme = useTheme();

  if (!courseData) return null;

  const rows = [
    { label: 'RC5 Version', value: courseData.rc5Version },
    { label: 'Branch', value: courseData.gitBranch },
    { label: 'Remote', value: courseData.remoteGitUrl },
    {
      label: 'Build Time',
      value: courseData.buildTime
        ? new Date(courseData.buildTime).toLocaleString()
        : undefined,
    },
  ].filter((row) => Boolean(row.value));

  return (
    <>
      <Tooltip
        title="About RapidCMI5"
        enterDelay={TOOLTIP_ENTER_DELAY}
        enterNextDelay={TOOLTIP_ENTER_NEXT_DELAY}
      >
        <IconButton
          sx={{ width: '32px', height: '32px' }}
          aria-label="Build Information"
          color="primary"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <RapidCmi5Icon overrideColor={color} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 320,
              maxWidth: 480,
              backgroundColor: (theme) => `${theme.palette.background.default}`,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
          <RapidCmi5Icon />
          <RapidCmi5Title textShouldContrast={false} />
        </Stack>
        <Divider />
        <Stack direction="column" spacing={1.5} sx={{ px: 2.5, py: 2 }}>
          {rows.map(({ label, value }) => (
            <Stack
              key={label}
              direction="row"
              spacing={1}
              alignItems="flex-start"
            >
              <Typography
                variant="caption"
                sx={{
                  minWidth: 80,
                  pt: '1px',
                  fontWeight: 600,
                }}
              >
                {label}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  wordBreak: 'break-all',
                  color: 'text.primary',
                }}
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
