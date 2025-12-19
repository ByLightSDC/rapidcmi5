import { Gauge } from '@mui/x-charts/Gauge';
import { useContext, useMemo } from 'react';
import { TeamConsolesContext } from '../TeamScenarioContext';
import { Alert } from '@mui/material';
import { Topic } from '@rapid-cmi5/ui/branded';
import { LoadingUi } from '@rapid-cmi5/ui/branded';

/**
 * Display gauge progress meter for Autograder Progress
 * @param param0
 * @returns
 */
export default function AutoGraderProgressDisplay({
  counter2,
  deployedScenarioId,
}: {
  counter2: number;
  deployedScenarioId: string;
}) {
  const {
    autoGraderStatusChangeCounter,
    getAutogradersPercentComplete,
    getInitialized,
    setUpdate,
  } = useContext(TeamConsolesContext);

  /**
   * Percent Complete
   * retrieved when graders count or grader status changes
   * -1 means no autograders present
   * -2 means autograders are loading
   */
  const autograderProgress = useMemo(() => {
    const gradersInit = getInitialized(
      deployedScenarioId,
      Topic.ResourceAutoGrader,
    );
    if (gradersInit) {
      //TODO Matt send LRS verbs
      return getAutogradersPercentComplete(deployedScenarioId);
    }
    return -2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployedScenarioId, autoGraderStatusChangeCounter, counter2]);

  //used to test visuals
  // not sure what performance and wip are
  // const test = () => {
  //   const record: Partial<DeployedAutoGrader> = {
  //     uuid: 'a7ed630a-60ce-421d-b950-43304c2bdd48',
  //     result: {
  //       success: true,
  //       answers: {
  //         performance: 100,
  //         wip: 100,
  //       },
  //     },
  //   };

  //   const fullRecord = {
  //     uuid: 'a7ed630a-60ce-421d-b950-43304c2bdd48',
  //     autograder: {
  //       telemetryAgent: 'a4220206-3cc1-4bc8-969e-a4dc849f2f4f',
  //       context: {},
  //       script:
  //         'export function grade(input, ctx) {\n  if (input.flag_matches == null) {\n    return;\n  }\n  const success = input.flag_matches === 1;\n  return {\n    success,\n    answers: { performance: success ? 100 : 0 },\n  };\n}',
  //       checksum:
  //         '990b7751dcde86e6eb88249398d1b6b516741008bf666159c8bf7433ac56d110',
  //       uuid: 'a7ed630a-60ce-421d-b950-43304c2bdd48',
  //       dateCreated: '2025-08-27T13:59:41.886Z',
  //       dateEdited: '2025-08-27T13:59:41.886Z',
  //       description: '',
  //       name: 'vm_0_input11',
  //       author: 'brandon.urias@bylight.com',
  //       metadata: {
  //         rangeOsUI: {
  //           quizQuestion: {
  //             question:
  //               'Create a file in /srv/flag.txt with the value "rangeos"',
  //             activityId: 'Create File',
  //             questionId: 'q1',
  //             questionType: 'Individual CMI5',
  //           },
  //         },
  //       },
  //     },
  //     result: {
  //       success: true,
  //       answers: {
  //         performance: 100,
  //         wip: 100,
  //       },
  //     },
  //   };

  //   setUpdate(deployedScenarioId, fullRecord, Topic.ResourceAutoGrader, false);
  // };

  return (
    <div className="w-full">
      {autograderProgress >= 0 && (
        <div className="w-[50vw] max-w-[250px] h-[50vw] max-h-[200px] mx-auto">
          <Gauge
            value={autograderProgress}
            startAngle={-90}
            endAngle={90}
            cornerRadius={5}
            sx={{
              color: 'white',
              '& .MuiGauge-valueText': {
                fontSize: '1.5em',
                transform: 'translate(0px, -30px)',
                fontWeight: 'bold',
              },
              '& .MuiGauge-valueArc': {
                fill: () =>
                  autograderProgress === 100 ? ' #15803D' : '#157CE9',
              },
              '& .MuiGauge-referenceArc': {
                fill: '#072AA7', // Remaining progress in light blue
              },
            }}
            text={({ value }) => `${value}%`}
          />
        </div>
      )}
      {autograderProgress === -1 && <Alert>No Tasks Found</Alert>}
      {autograderProgress === -2 && <LoadingUi />}
      {/* <ButtonMainUi onClick={test}>Test</ButtonMainUi> */}
    </div>
  );
}
