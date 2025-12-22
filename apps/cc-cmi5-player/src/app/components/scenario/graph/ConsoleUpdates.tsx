/* eslint-disable @typescript-eslint/no-explicit-any */

/* CLONE */

import { useContext } from 'react';

import {
  useGetRangeResourceConsolesGraph,
  useQueryDetails,
  Topic,
} from '@rapid-cmi5/ui';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import ConsoleSubscription from './ConsoleSubscription';

/**
 * Queries graph for console updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ConsoleUpdates({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { isContextInitialized, setInitialized, setUpdates } = useContext(
    ScenarioUpdatesContext,
  );

  // Consoles for given scenario
  const consolesQuery = useGetRangeResourceConsolesGraph(rangeId, scenarioId);
  useQueryDetails({
    queryObj: consolesQuery,
    errorFunction: (queryError: any) => {
      setInitialized(Topic.ResourceConsole, true);
    },
    successFunction: (successData: any) => {
      const consoles = successData?.rangeConsoles || [];
      setUpdates(consoles, Topic.ResourceConsole);
      setInitialized(Topic.ResourceConsole, true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isContextInitialized &&
        (consolesQuery?.isSuccess || consolesQuery?.isError) && (
          <ConsoleSubscription rangeId={rangeId} scenarioId={scenarioId} />
        )}
    </div>
  );
}
