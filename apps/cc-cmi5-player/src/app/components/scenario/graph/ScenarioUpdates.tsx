/* CLONE */

import { useContext } from 'react';

import {
  formatQueryError,
  useGetRangeResourceScenarioGraph,
  useQueryDetails,
  Topic,
} from '@rapid-cmi5/ui/branded';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import ScenarioSubscription from './ScenarioSubscription';

/**
 * Queries graph for sceanrio updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ScenarioUpdates({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { isContextInitialized, setErrorMsg, setInitialized, setUpdate } =
    useContext(ScenarioUpdatesContext);

  // Scenario
  const scenarioQuery = useGetRangeResourceScenarioGraph(rangeId, scenarioId);
  useQueryDetails({
    queryObj: scenarioQuery,
    errorFunction: (queryError) => {
      setErrorMsg(Topic.ResourceScenario, formatQueryError(queryError));
    },
    successFunction: (successData) => {
      const scenario = successData?.scenario || [];
      setUpdate(scenario, Topic.ResourceScenario);
      setInitialized(Topic.ResourceScenario, true);
    },
    shouldDisplayToaster: false,
  });

  //#endregion
  return (
    <div>
      {isContextInitialized && scenarioQuery?.isSuccess && (
        <ScenarioSubscription rangeId={rangeId} scenarioId={scenarioId} />
      )}
    </div>
  );
}
