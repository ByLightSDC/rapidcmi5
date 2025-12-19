import {
  useQueryDetails,
  Topic,
  useGetRangeResourceAutoGraders,
} from '@rapid-cmi5/ui/branded';
import { useState } from 'react';
import AutograderSubscription from '../subscriptions/AutograderSubscription';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function TeamAutoGraderUpdates({
  rangeId,
  scenarioId,
  setUpdate,
  setUpdates,
}: {
  rangeId: string;
  scenarioId: string;
  setUpdate: (deployedScenarioId: string, data: any[], topic: Topic) => void;
  setUpdates: (
    deployedScenarioId: string,
    data: any[],
    topic: Topic,
    skipCounter?: boolean,
  ) => void;
}) {
  const [isInitialized, setIsInitialized] = useState(false);

  // VMs for given scenario
  //console.log(`query AutoGraders  ${rangeId} ${scenarioId}`);
  const autogradersQuery = useGetRangeResourceAutoGraders({
    rangeId,
    scenarioId,
  });
  useQueryDetails({
    queryObj: autogradersQuery,
    errorFunction: (queryError) => {
      setIsInitialized(true);
    },
    successFunction: (successData) => {
      setUpdates(scenarioId, successData, Topic.ResourceAutoGrader);
      setIsInitialized(true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isInitialized &&
        (autogradersQuery?.isSuccess || autogradersQuery?.isError) && (
          <AutograderSubscription
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
          />
        )}
    </div>
  );
}
