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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { alpha } from '@mui/material';
import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';

interface ScenarioCardProps {
  scenarioUUID: string;
  scenarioName: string;
  fetchScenario?: (uuid: string) => Promise<ScenarioApi>;
}

type ValidationState = 'loading' | 'valid' | 'not-found' | 'not-connected';

export function ScenarioCard({
  scenarioUUID,
  scenarioName,
  fetchScenario,
}: ScenarioCardProps) {
  const [state, setState] = useState<ValidationState>('loading');
  const [scenario, setScenario] = useState<ScenarioApi | null>(null);

  const getAlertMeta = () => {
    switch (state) {
      case 'loading':
        return {
          label: 'Checking…',
          color: 'default' as const,
          icon: <CircularProgress size={16} sx={{ flexShrink: 0 }} />,
          borderColor: 'divider',
          bgColor: 'background.paper',
        };

      case 'valid':
        return {
          label: 'Verified',
          color: 'success' as const,
          icon: (
            <CheckCircleIcon
              sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }}
            />
          ),
          borderColor: 'success.main',
          bgColor: (theme: any) => alpha(theme.palette.success.main, 0.05),
        };

      case 'not-connected':
        return {
          label: 'Unverified',
          color: 'info' as const,
          icon: (
            <InfoOutlinedIcon
              sx={{ fontSize: 18, color: 'info.main', flexShrink: 0 }}
            />
          ),
          borderColor: 'info.main',
          bgColor: (theme: any) => alpha(theme.palette.info.main, 0.05),
        };

      case 'not-found':
      default:
        return {
          label: 'Not Found',
          color: 'warning' as const,
          icon: (
            <WarningAmberIcon
              sx={{ fontSize: 18, color: 'warning.main', flexShrink: 0 }}
            />
          ),
          borderColor: 'warning.main',
          bgColor: (theme: any) => alpha(theme.palette.warning.main, 0.05),
        };
    }
  };

  useEffect(() => {
    if (!fetchScenario) {
      setState('not-connected');
      setScenario(null);
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

  const displayName = scenario?.name ?? scenarioName;
  const alert = getAlertMeta();

  return (
    <Card
      variant="outlined"
      sx={{
        my: 1.5,
        borderColor: 'divider',
        borderLeftWidth: 3,
        borderLeftColor: alert.borderColor,
        bgcolor: alert.bgColor,
        transition: 'border-left-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {alert.icon}

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
            label={alert.label}
            color={alert.color}
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

          {state === 'not-connected' && scenarioUUID && (
            <Typography variant="caption" color="info.main" display="block">
              This scenario could not be verified because scenario validation is
              not connected in this environment.
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
