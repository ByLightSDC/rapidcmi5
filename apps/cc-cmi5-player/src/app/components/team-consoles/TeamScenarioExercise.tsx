import {
  useContext,
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  DeployedScenario,
  DeployedScenarioDetailStatusEnum,
} from '@rangeos-nx/frontend/clients/devops-api';

/* MUI */
import {
  Alert,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
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

import TimeClock from '../scenario/TimeClock';
import RangeResources from './list-views/RangeResources';
import { TeamConsolesContext } from './TeamScenarioContext';
import { ScenarioResources } from './types';
import TeamVMUpdates from './queries/TeamVMUpdates';
import TeamContainerUpdates from './queries/TeamContainerUpdates';
import TeamConsoleUpdates from './queries/TeamConsoleUpdates';
import TeamAutoGraderUpdates from './queries/TeamAutoGraderUpdates';
import {
  getScenarioStatusIcon,
  queryKeyRangeResourceAutoGraders,
  queryKeyRangeResourceContainers,
  Topic,
} from '@rangeos-nx/frontend/clients/hooks';
import {
  AuContextProps,
  TeamConsolesContent,
} from '@rapid-cmi5/cmi5-build-common';
import {
  LessonThemeContext,
  OverflowTypography,
  TabMainUi,
} from '@rapid-cmi5/ui';
import {
  maxFormWidths,
  useLessonThemeStyles,
} from 'packages/ui/src/lib/hooks/useLessonThemeStyles';

/**
 * Activity displays a Deployed Scenario status, VMs, Containers, and Autograders
 * provides Consoles access
 * Requires ScenarioWrapper at the top of
 * @returns
 */
function TeamScenarioExercise({
  auProps,
  content,
}: {
  auProps: Partial<AuContextProps>;
  content: TeamConsolesContent;
}) {
  const loadedScenario = useRef<ScenarioResources | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [notificationsCounter, setNotificationsCounter] = useState(0);
  const [rangeId, setRangeId] = useState<string>('');
  const [scenarioId, setScenarioId] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isClockShowing, setIsClockShowing] = useState(false);
  /* Lesson Theme */
  const { lessonTheme } = useContext(LessonThemeContext);
  const { outerActivitySxWithConstrainedWidth } = useLessonThemeStyles(
    lessonTheme,
    maxFormWidths.scenarioPlayback,
  );

  const {
    addListener,
    getConsolesByOwner,
    getScenario,
    getUpdates,
    isContextInitialized,
    loadScenario,
    removeListener,
    autoGraderStatusChangeCounter,
    vmStatusChangeCounter,
    containerStatusChangeCounter,
    consoleStatusChangeCounter,
    scenarioStatusChangeCounter,
    setUpdate,
    setUpdates,
  } = useContext(TeamConsolesContext);

  const getScenarioStatusChild = (data: Partial<DeployedScenario>) => {
    // don't want to display icon when Running
    if (data.status !== DeployedScenarioDetailStatusEnum.Ready) {
    const rowStatus = getScenarioStatusIcon(
      data.status,
      data.message,
      true, // show color
      true, // show hover
    );
    return (
      <ListItemIcon sx={{ margin: 0, padding: 0 }}>
        {rowStatus.icon}
      </ListItemIcon>
    );
    }
    return null;
  };

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setCurrentTab(newValue);
    },
    [setCurrentTab],
  );

  /**
   * Increment counter when notified of a change
   * This triggers nested action rows to render
   */
  const notifyEvents = useCallback(
    (topic: Topic, updates: any[]) => {
      if (currentTab === 0 && topic !== Topic.ResourceAutoGrader) {
        setNotificationsCounter(notificationsCounter + 1);
      } else if (currentTab === 1 && topic === Topic.ResourceAutoGrader) {
        setNotificationsCounter(notificationsCounter + 1);
      }
    },
    [currentTab, notificationsCounter],
  );

  const scenarioRecord = useMemo(() => {
    if (loadedScenario.current) {
      if (
        Object.prototype.hasOwnProperty.call(
          loadedScenario.current.updatesByTopic,
          Topic.Scenario,
        )
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            loadedScenario.current.updatesByTopic[Topic.Scenario],
            scenarioId,
          )
        ) {
          return loadedScenario.current.updatesByTopic[Topic.Scenario][
            scenarioId
          ];
        }
      }
    }
    return undefined;
  }, [scenarioId]);

  const scenarioClock = useMemo(() => {
    //debugLog('scenario', scenarioStatusChangeCounter);
    if (scenarioRecord) {
      return <TimeClock startDateStr={scenarioRecord.dateCreated || ''} />;
    }

    return undefined;
  }, [scenarioStatusChangeCounter, scenarioRecord]);

  const scenarioStatus = useMemo(() => {
    //debugLog('scenario', scenarioStatusChangeCounter);
    if (scenarioRecord) {
      const theIcon = getScenarioStatusChild(scenarioRecord);

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
            uuid={scenarioRecord.uuid}
            title={scenarioRecord.name}
            variant="h5"
            sxProps={{
              fontWeight: 'bold',
            }}
          />
          {theIcon}
        </Stack>
      );
    }

    return undefined;
  }, [scenarioStatusChangeCounter, scenarioRecord]);

  const toggleClock = useCallback(() => {
    setIsClockShowing(!isClockShowing);
  }, [setIsClockShowing, isClockShowing]);

  /**
   * Triggers loading scenario
   */
  useEffect(() => {
    const checkForScenario = async () => {
      // first try to get it from context if it was loaded before
      loadedScenario.current = getScenario(content.uuid, content.name);
      if (loadedScenario.current === null) {
        //try loading it
        try {
          await loadScenario(
            content.uuid,
            content.name,
            content.rc5id || 'missing',
          );
          //retry to get it
          loadedScenario.current = getScenario(content.uuid, content.name);
          //display error if it missing
          if (loadedScenario.current === null) {
            setErrorDetails(`No Scenario Found name=${content.name}`);
            setRangeId('');
            setScenarioId('');
          } else {
            //found scenario in context, update local state with deployed id
            if (loadedScenario.current?.deployedScenarioId) {
              setErrorDetails('');
              setRangeId(loadedScenario.current.rangeId);
              setScenarioId(loadedScenario.current.deployedScenarioId);
            }
          }
        } catch (e) {
          console.log('CAUGHT ERROR');
          console.log(e);
          setErrorDetails(e as string);
          setRangeId('');
          setScenarioId('');
        }
      } else {
        setErrorDetails('');
        //found scenario in context, update local state with deployed id
        if (loadedScenario.current?.deployedScenarioId) {
          setRangeId(loadedScenario.current.rangeId);
          setScenarioId(loadedScenario.current.deployedScenarioId);
        }
      }
    };

    setRangeId('');
    setScenarioId('');
    checkForScenario();
  }, [content, getScenario, loadScenario]);

  /**
   * Listen for Scenario Status Updates
   */
  useEffect(() => {
    addListener(scenarioId, notifyEvents);
    return () => {
      removeListener(scenarioId);
    };
  }, [addListener, scenarioId, notifyEvents, removeListener]);

  useEffect(() => {
    console.log('[Context] rerender after updates to vm, container, consoles');
    console.log();
  }, [
    vmStatusChangeCounter,
    containerStatusChangeCounter,
    consoleStatusChangeCounter,
    scenarioStatusChangeCounter,
  ]);

  return (
    <Paper
      className="paper-activity"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        ...outerActivitySxWithConstrainedWidth,
      }}
    >
      <Typography variant="caption">Team Exercise</Typography>
      {errorDetails && <Alert severity="error">{errorDetails}</Alert>}
      {scenarioId && (
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
              <IconButton aria-label="toggle-clock" onClick={toggleClock}>
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={500}
                  title={isClockShowing ? 'Hide Clock' : 'Show Clock'}
                  placement="bottom"
                >
                  <AccessTimeIcon />
                </Tooltip>
              </IconButton>
              {isClockShowing && scenarioClock}
            </Stack>
            <Box
              sx={{
                height: '30px',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
                position: 'absolute', //force tabs to sit on divider
                top: '0px',
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
          <Divider sx={{ margin: 1, marginLeft: 0 }} />
          {currentTab === 0 && (
            <>
              <RangeResources
                consoleCounter={consoleStatusChangeCounter}
                counter={vmStatusChangeCounter}
                counter2={notificationsCounter}
                getConsolesByOwner={getConsolesByOwner}
                getUpdates={getUpdates}
                isContextInitialized={isContextInitialized}
                rangeId={rangeId}
                scenarioId={scenarioId}
              />
              <RangeResources
                consoleCounter={consoleStatusChangeCounter}
                counter={containerStatusChangeCounter}
                counter2={notificationsCounter}
                getConsolesByOwner={getConsolesByOwner}
                getUpdates={getUpdates}
                isContextInitialized={isContextInitialized}
                rangeId={rangeId}
                scenarioId={scenarioId}
                queryKey={queryKeyRangeResourceContainers}
                title="Containers"
                topic={Topic.ResourceContainer}
              />
            </>
          )}

          {currentTab === 1 && (
            <RangeResources
              consoleCounter={-1}
              counter={autoGraderStatusChangeCounter}
              counter2={notificationsCounter}
              getConsolesByOwner={getConsolesByOwner}
              getUpdates={getUpdates}
              isContextInitialized={isContextInitialized}
              rangeId={rangeId}
              scenarioId={scenarioId}
              queryKey={queryKeyRangeResourceAutoGraders}
              title="Tasks"
              topic={Topic.ResourceAutoGrader}
            />
          )}
          <TeamAutoGraderUpdates
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
            setUpdates={setUpdates}
          />
          <TeamConsoleUpdates
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
            setUpdates={setUpdates}
          />
          <TeamContainerUpdates
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
            setUpdates={setUpdates}
          />
          <TeamVMUpdates
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
            setUpdates={setUpdates}
          />
        </>
      )}
    </Paper>
  );
}

export default TeamScenarioExercise;
