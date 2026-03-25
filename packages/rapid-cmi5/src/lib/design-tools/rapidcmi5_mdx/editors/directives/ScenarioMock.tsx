import { useContext, useMemo, useState, useCallback } from 'react';

/* MUI */
import {
  Alert,
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  SxProps,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

/* Icons*/
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import TerminalIcon from '@mui/icons-material/Terminal';

import {
  LessonThemeContext,
  OverflowTypography,
  TabMainUi,
} from '@rapid-cmi5/ui';
import { maxFormWidths, useLessonThemeStyles } from 'packages/ui/src/lib/hooks/useLessonThemeStyles';
import { RC5ActivityTypeEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * Mock Activity display so course authors can perceive activity layout in preview mode
 * @returns JSX.Element
 */
function ScenarioMock({
  activity,
  scenarioName,
}: {
  activity: RC5ActivityTypeEnum;
  scenarioName?: string;
}) {
  const [currentTab, setCurrentTab] = useState(0);

  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidth} = useLessonThemeStyles(lessonTheme, maxFormWidths.scenarioPlayback);

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setCurrentTab(newValue);
    },
    [setCurrentTab],
  );

  const scenarioStatus = useMemo(() => {
    return (
      <Stack
        direction="row"
        sx={{
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
        }}
      >
        <OverflowTypography
          uuid="Scenario UUID"
          title={scenarioName || 'Scenario Name'}
          variant="h5"
          sxProps={{
            fontWeight: 'bold',
          }}
        />
      </Stack>
    );
  }, []);

  return (
    <Paper
      className="paper-activity"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        ...outerActivitySxWithConstrainedWidth,
      }}
    >
      <Typography variant="caption">{activity}</Typography>

      <>
        <Stack
          direction="row"
          sx={{
            padding: 0,
            position: 'relative',
          }}
        >
          {scenarioStatus}
          <Stack
            direction="row"
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: '132px',
            }}
          >
            <IconButton aria-label="toggle-clock">
              <Tooltip
                arrow
                enterDelay={500}
                enterNextDelay={500}
                title="Toggles clock during a lesson"
                placement="bottom"
              >
                <AccessTimeIcon />
              </Tooltip>
            </IconButton>
          </Stack>
          <Box
            sx={{
              height: '30px',
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'flex-end',
              position: 'absolute', //force tabs to sit on divider
              top: '-6px',
              right: 0,
            }}
          >
            <Tabs
              orientation="horizontal"
              aria-label="Scenario Tabs"
              sx={{ marginTop: 0 }}
              value={currentTab}
              onChange={handleChangeTab}
              slotProps={{
                indicator: {
                  sx: {
                    height: 4,
                    margin: '12px',
                    marginLeft: '0px',
                    marginBottom: 1,
                  },
                },
              }}
            >
              <TabMainUi
                icon={<TerminalIcon color="inherit" fontSize="small" />}
                iconPosition="start"
                label="Consoles"
                style={{ marginBottom: 0 }}
              />
              <TabMainUi
                icon={<AutoModeIcon color="inherit" fontSize="small" />}
                iconPosition="start"
                label="AutoGraders"
                style={{ marginBottom: 0 }}
              />
            </Tabs>
          </Box>
        </Stack>
        <Divider />
        {currentTab === 0 && (
          <Box sx={{ margin: '12px' }}>
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                padding: '12px',
                maxWidth: '640px',
              }}
            >
              During a lesson, consoles associated with this scenario can be
              accessed here
            </Alert>
          </Box>
        )}

        {currentTab === 1 && (
          <Box sx={{ margin: '12px' }}>
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                padding: '12px',
                maxWidth: '480px',
              }}
            >
              During a lesson, autograder tasks appear here
            </Alert>
          </Box>
        )}
      </>
    </Paper>
  );
}

export default ScenarioMock;
