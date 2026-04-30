import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Divider,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { auJsonSel } from '../../redux/auReducer';
import { TOOLTIP_ENTER_DELAY, TOOLTIP_ENTER_NEXT_DELAY } from './shared';

/*
  This allows course managers and developers to debug issues in their course.
  By adding in a simple way to check where a course came from and what version of 
  rapid cmi5 it is running we can quickly see if there is a version mismatch.
*/
export default function BuildInfoButton() {
  const auJson = useSelector(auJsonSel);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  if (!auJson?.metadata) return null;

  const rows = [
    { label: 'RC5 Version', value: auJson.metadata.rc5Version },
    { label: 'Branch', value: auJson.metadata.gitBranch },
    { label: 'Remote', value: auJson.metadata.remoteGitUrl },
    {
      label: 'Build Time',
      value: auJson.metadata.buildTime
        ? new Date(auJson.metadata.buildTime).toLocaleString()
        : undefined,
    },
  ].filter((row) => Boolean(row.value));

  return (
    <>
      <Tooltip
        title="Build Information"
        enterDelay={TOOLTIP_ENTER_DELAY}
        enterNextDelay={TOOLTIP_ENTER_NEXT_DELAY}
      >
        <IconButton
          aria-label="Build Information"
          color="primary"
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <InfoOutlinedIcon fontSize="small" />
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
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 1.5,
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            Build Information
          </Typography>
        </Box>
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
                  color: 'text.secondary',
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
