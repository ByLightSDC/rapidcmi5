/* eslint-disable @typescript-eslint/no-explicit-any */
/* User Portal Flavor - Without Notifications*/

import { useState } from 'react';
import ConsoleSubscription from '../subscriptions/ConsoleSubscription';
import { Topic, useGetRangeResourceConsolesGraph } from '@rangeos-nx/frontend/clients/hooks';
import { useQueryDetails } from '@rapid-cmi5/ui';

/**
 * Queries graph for console updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function TeamConsoleUpdates({
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

  // Consoles for given scenario
  const consolesQuery = useGetRangeResourceConsolesGraph(rangeId, scenarioId);
  //console.log('query consoles');

  useQueryDetails({
    queryObj: consolesQuery,
    errorFunction: (queryError: any) => {
      console.log('error consoles');
      //addNotification('Error Retrieving Consoles', true);
      //setInitialized(Topic.ResourceConsole, true);
      setIsInitialized(true);
    },
    successFunction: (successData: any) => {
      const consoles = successData?.rangeConsoles || [];
      //console.log('success consoles', consoles);
      setUpdates(scenarioId, consoles, Topic.ResourceConsole);
      //setInitialized(Topic.ResourceConsole, true);
      setIsInitialized(true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isInitialized &&
        (consolesQuery?.isSuccess || consolesQuery?.isError) && (
          <ConsoleSubscription
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
          />
        )}
    </div>
  );
}
