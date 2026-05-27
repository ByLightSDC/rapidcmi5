import { Typography } from '@mui/material';
import { alpha, Box, Stack, useTheme } from '@mui/system';
import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import { formatDate } from '@rapid-cmi5/ui';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function ScenarioOptionCard({
  scenario,
  isSelected,
}: {
  scenario: ScenarioApi;
  isSelected: boolean;
}) {
  const theme = useTheme();
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textTertiary = alpha(theme.palette.text.secondary, 0.7);

  return (
    <Box sx={{ p: 2, pl: isSelected ? 2.5 : 2 }}>
      <Stack spacing={1.25}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              color: textPrimary,
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
            }}
          >
            {scenario.name}
          </Typography>
          {isSelected && (
            <CheckCircleIcon
              sx={{
                fontSize: 20,
                color: theme.palette.primary.main,
                flexShrink: 0,
              }}
            />
          )}
        </Box>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PersonOutlineIcon sx={{ fontSize: 15, color: textTertiary }} />
            <Typography
              variant="caption"
              sx={{ color: textSecondary, fontWeight: 500 }}
            >
              {scenario.author}
            </Typography>
          </Stack>
          {scenario?.dateEdited && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 15, color: textTertiary }} />
              <Typography
                variant="caption"
                sx={{ color: textSecondary, fontWeight: 500 }}
              >
                {formatDate(scenario?.dateEdited)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {scenario.description && (
          <Typography
            variant="body2"
            sx={{
              color: textSecondary,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {scenario.description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
