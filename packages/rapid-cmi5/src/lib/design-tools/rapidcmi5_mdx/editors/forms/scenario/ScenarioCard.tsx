import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { alpha } from '@mui/material';
import { Scenario } from '@rangeos-nx/frontend/clients/devops-api';

interface ScenarioCardProps {
  scenarioUUID: string;
  scenarioName: string;
  fetchScenario?: (uuid: string) => Promise<Scenario>;
}

type ValidationState = 'loading' | 'valid' | 'not-found' | 'not-connected';

export function ScenarioCard({
  scenarioUUID,
  scenarioName,
  fetchScenario,
}: ScenarioCardProps) {
  const [state, setState] = useState<ValidationState>('loading');
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    if (!fetchScenario) {
      setState('not-connected');
      return;
    }
    if (!scenarioUUID) {
      setState('not-found');
      setScenario(null);
      return;
    }

    setState('loading');
    let cancelled = false;

    fetchScenario(scenarioUUID)
      .then((data) => {
        if (!cancelled) {
          setScenario(data);
          setState('valid');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setScenario(null);
          setState('not-found');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scenarioUUID, fetchScenario]);

  const isLoading = state === 'loading';
  const isValid = state === 'valid';
  const displayName = scenario?.name ?? scenarioName;

  return (
    <Card
      variant="outlined"
      sx={{
        my: 1.5,
        borderColor: 'divider',
        borderLeftWidth: 3,
        borderLeftColor: isLoading
          ? 'divider'
          : isValid
            ? 'success.main'
            : 'warning.main',
        bgcolor: isLoading
          ? 'background.paper'
          : isValid
            ? (theme) => alpha(theme.palette.success.main, 0.05)
            : (theme) => alpha(theme.palette.warning.main, 0.05),
        transition: 'border-left-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLoading ? (
            <CircularProgress size={16} sx={{ flexShrink: 0 }} />
          ) : isValid ? (
            <CheckCircleIcon
              sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }}
            />
          ) : (
            <WarningAmberIcon
              sx={{ fontSize: 18, color: 'warning.main', flexShrink: 0 }}
            />
          )}
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName ?? 'Unnamed Scenario'}
          </Typography>
          <Chip
            size="small"
            label={isLoading ? 'Checking…' : isValid ? 'Verified' : 'Not Found'}
            color={isLoading ? 'default' : isValid ? 'success' : 'warning'}
            variant="outlined"
            sx={{ flexShrink: 0, fontSize: '0.7rem' }}
          />
        </Box>

        <Box
          sx={{
            pl: 3.25,
            mt: 0.75,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          {scenarioUUID && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'monospace', display: 'block' }}
            >
              {scenarioUUID}
            </Typography>
          )}

          {state === 'not-found' && scenarioUUID && (
            <Typography variant="caption" color="warning.main" display="block">
              This scenario UUID was not found in the current environment.
            </Typography>
          )}

          {(scenario?.description || scenario?.author) && (
            <>
              <Divider sx={{ my: 0.25 }} />
              {scenario.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {scenario.description}
                </Typography>
              )}
              {scenario.author && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Author: {scenario.author}
                </Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
