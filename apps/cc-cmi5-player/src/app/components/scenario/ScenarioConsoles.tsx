import { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@rapid-cmi5/ui/branded';
import {
  rangeConsoleDataAttemptsSel,
  rangeConsoleDataErrorSel,
  rangeDataAttemptsSel,
  rangeDataErrorSel,
  setRangeConsoleData,
  setRangeDataAttempts,
} from '../../redux/auReducer';

// Console

import { ScenarioUpdatesContext } from './ScenarioUpdatesContext';
import {
  OverflowTypography,
  TabMainUi,
} from '@rapid-cmi5/ui/branded';
import {
  AutoGraderEvent,
  ButtonMainUi,
  ButtonMinorUi,
  getScenarioStatusIcon,
  queryKeyRangeResourceContainers,
  Topic,
} from '@rapid-cmi5/ui/branded';
import {
  DeployedScenario,
  DeployedScenarioDetailStatusEnum,
} from '@rapid-cmi5/ui/branded';

/* MUI */
import {
  Alert,
  AlertTitle,
  Box,
  IconButton,
  ListItemIcon,
  Paper,
  Stack,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';

/* Icons*/
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import ReplayIcon from '@mui/icons-material/Replay';
import TerminalIcon from '@mui/icons-material/Terminal';

import {
  confirmDeleteButtonText,
  deletePrompt,
  deleteTitle,
} from './constants';
import RangeResources from './list-views/RangeResources';
import ScenarioModals from './ScenarioModals';
import TimeClock from './TimeClock';
import { numRetries } from '../../hooks/useCMI5Session';
import { classChangeModalId } from '../CourseModals';
import { AuContextProps, ScenarioContent } from '@rapid-cmi5/cmi5-build/common';
import ScenarioProgress from './ScenarioProgress';
import { useAutoGraderProgress } from './hooks/useAutoGraderProgress';
import AutoGraderSubscription from './graph/AutoGraderSubscription';

/**
 * Slide that displays a Deployed Scenario status, VMs, Containers, and provides Consoles access
 * Requires ScenarioWrapper at the top of
 * @returns
 */
function ScenarioConsoles({
  auProps,
  content,
}: {
  auProps: Partial<AuContextProps>;
  content: ScenarioContent;
}) {
  const dispatch = useDispatch();
  const rangeDataError = useSelector(rangeDataErrorSel);
  const rangeConsoleDataError = useSelector(rangeConsoleDataErrorSel);
  const numRangeDataAttempts = useSelector(rangeDataAttemptsSel);
  const numRangeConsoleDataAttempts = useSelector(rangeConsoleDataAttemptsSel);
  const [currentTab, setCurrentTab] = useState(0);

  const { rangeId, scenarioId } = useContext(ScenarioUpdatesContext);

  // /**
  //  * REF UE debug
  //  */
  // useEffect(() => {
  //   console.log('ScenarioConsoles', scenarioId);
  //   console.log('rangeDataError', rangeDataError);
  //   console.log('numRangeDataAttempts', '' + numRangeDataAttempts + '/5');
  //   console.log('rangeConsoleDataError', rangeConsoleDataError);
  //   console.log(
  //     'numRangeConsoleDataAttempts',
  //     '' + numRangeConsoleDataAttempts + '/5',
  //   );
  // }, [
  //   rangeDataError,
  //   numRangeDataAttempts,
  //   numRangeDataAttempts,
  //   rangeConsoleDataError,
  //   scenarioId,
  // ]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const {
    getActivityCache,
    setActivityCache,
    isAuthenticated,
    isTestMode,
    setProgress,
    submitScore,
  } = auProps;

  // The logic for progress a scenario based on Auto Graders will go here
  // We need to lift the logic outside of the auto graders tab so that we can complete autograder tasks even when
  // we are not in the autograders tab.
  const { finishedTaskUUIDs, labProgress, autoGraders, markCompleted } =
    useAutoGraderProgress({
      isAuthenticated,
      isTestMode,
      setProgress,
      getActivityCache,
      setActivityCache,
      submitScore,
      scenarioContent: content,
    });

  return (
    <Paper
      className="paper-activity hover:prose-a:text-blue-500 prose prose-invert"
      variant="outlined"
      sx={{
        backgroundColor: 'background.default',
        minWidth: '320px',
        maxWidth: '1440px',
        marginBottom: '12px',
      }}
    >
      {content.introTitle && (
        <Typography
          color="text.primary"
          align="center"
          variant="h2"
          style={{
            fontWeight: 800,
            paddingBottom: '8px',
          }}
        >
          content.introTitle
        </Typography>
      )}
      {content.introContent && <p>{content.introContent}</p>}
      {(!rangeDataError || numRangeDataAttempts < numRetries) &&
        (!rangeConsoleDataError || numRangeConsoleDataAttempts < numRetries) &&
        !scenarioId && <p>Loading...</p>}

      {autoGraders && (
        // This is needed so that we can get autograder completion data
        // without having the autograders tab open
        <AutoGraderSubscription
          rangeId={rangeId}
          scenarioId={scenarioId}
          onUpdate={(results: AutoGraderEvent[]) => {
            results.forEach(({ result, autoGrader }) => {
              if (result.success == true) markCompleted(autoGrader.uuid);
            });
          }}
        />
      )}

      {rangeDataError && numRangeDataAttempts === numRetries && (
        <Alert severity="error">
          <AlertTitle>{rangeDataError}</AlertTitle>
          <ButtonMainUi
            startIcon={<ReplayIcon />}
            onClick={() => {
              dispatch(setRangeDataAttempts(-1));
            }}
          >
            Try Again
          </ButtonMainUi>
          <br />
          <br />
          <ButtonMainUi
            startIcon={<AssignmentIndIcon />}
            onClick={() => {
              dispatch(
                setModal({
                  type: classChangeModalId,
                  id: '',
                  name: '',
                }),
              );
            }}
          >
            Change ClassRoom
          </ButtonMainUi>
        </Alert>
      )}
      {!rangeDataError &&
        rangeConsoleDataError &&
        numRangeConsoleDataAttempts === numRetries && (
          <Alert severity="error">
            <AlertTitle>{rangeConsoleDataError}</AlertTitle>
            <ButtonMinorUi
              onClick={() => {
                dispatch(setRangeConsoleData(-1));
              }}
            >
              Try Again
            </ButtonMinorUi>
          </Alert>
        )}
      {scenarioId && (
        <>
          <ScenarioStatus
            currentTab={currentTab}
            handleChangeTab={handleChangeTab}
            slideContent={content}
          />
          {currentTab === 0 && (
            <>
              <RangeResources />
              <RangeResources
                queryKey={queryKeyRangeResourceContainers}
                title="Containers"
                topic={Topic.ResourceContainer}
              />
            </>
          )}

          {currentTab === 1 && autoGraders.length > 0 && (
            <ScenarioProgress
              autoGraders={autoGraders}
              labProgress={labProgress}
              finishedTasks={finishedTaskUUIDs}
            />
          )}
          {currentTab === 1 && autoGraders.length === 0 && (
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'transparent',
                borderWidth: '0px',
                width: 'auto',
                height: '48px',
              }}
            >
              No AutoGraders found for this Scenario
            </Alert>
          )}
        </>
      )}
    </Paper>
  );
}

export default ScenarioConsoles;

/**
 * Renders scenario name and status if scenario is not ready
 * @returns
 */
function ScenarioStatus({
  currentTab,
  handleChangeTab,
  slideContent,
}: {
  currentTab: number;
  handleChangeTab: (event: React.SyntheticEvent, newValue: number) => void;
  slideContent: ScenarioContent;
}) {
  const [isClockShowing, setIsClockShowing] = useState(false);

  const { getUpdates, rangeId, scenarioId, scenarioStatusChangeCounter } =
    useContext(ScenarioUpdatesContext);

  const confirmStopButtonText =
    slideContent.confirmStopButtonText || confirmDeleteButtonText;

  const stopScenarioTitle = slideContent.stopScenarioTitle || deleteTitle;
  const stopScenarioMessage = slideContent.stopScenarioMessage || deletePrompt;

  const toggleClock = () => {
    setIsClockShowing(!isClockShowing);
  };

  const getScenarioStatusChild = useMemo(() => {
    const scenarios = Object.values(getUpdates(Topic.ResourceScenario));

    const scenarioWithStatus: Partial<DeployedScenario> =
      scenarios.length > 0 ? scenarios[0] : null;

    // don't want to display icon when Running
    if (scenarioWithStatus) {
      const rowStatus = getScenarioStatusIcon(
        scenarioWithStatus.status,
        scenarioWithStatus.message,
        true, // show color
        true, // show hover
      );
      return (
        <Stack
          direction="row"
          sx={{
            padding: 0,
          }}
        >
          <OverflowTypography
            uuid={scenarioWithStatus.uuid}
            title={scenarioWithStatus?.name || 'Unknown'}
            variant="h5"
            sxProps={{
              fontWeight: 'bold',
              paddingTop: '4px',
            }}
          />
          {scenarioWithStatus.status !==
            DeployedScenarioDetailStatusEnum.Ready && (
            <ListItemIcon
              sx={{
                marginLeft: '4px',
                padding: 0,
                margin: 0,
                height: '32px',
                minWidth: 0,
                //backgroundColor: 'pink',
              }}
            >
              {rowStatus.icon}
            </ListItemIcon>
          )}
          <Box
            sx={{
              //backgroundColor: 'orange',
              marginLeft: '0px',
              height: '32px',
              display: 'flex',
              flexGrow: 1,
              justifyContent: 'flex-end',
            }}
          >
            <Tabs
              orientation="horizontal"
              sx={{ marginTop: 0 }}
              value={currentTab}
              onChange={handleChangeTab}
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
            {isClockShowing && (
              <TimeClock startDateStr={scenarioWithStatus?.dateCreated || ''} />
            )}
          </Box>

          <ScenarioModals
            rangeIdSel={rangeId}
            confirmStopButtonText={confirmStopButtonText}
            stopScenarioMessage={stopScenarioMessage}
            stopScenarioTitle={stopScenarioTitle}
          />
        </Stack>
      );
    }
    return (
      <OverflowTypography
        title="Loading..."
        variant="h5"
        sxProps={
          {
            //fontWeight: 'bold',
          }
        }
      />
    );
  }, [
    scenarioStatusChangeCounter,
    getUpdates,
    isClockShowing,
    currentTab,
    handleChangeTab,
  ]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{getScenarioStatusChild}</>;
}
