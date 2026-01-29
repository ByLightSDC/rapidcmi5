/* CLONE */

import { useContext } from 'react';

import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import ScenarioSubscription from './ScenarioSubscription';
import { Topic, useGetRangeResourceScenarioGraph } from '@rangeos-nx/frontend/clients/hooks';
import { useQueryDetails, formatQueryError } from '@rapid-cmi5/ui';

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
