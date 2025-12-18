/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useGetRangeResourceContainersGraph,
  useQueryDetails,
  Topic,
} from '@rapid-cmi5/ui/api/hooks';

import { debugLogError } from '@rapid-cmi5/ui/branded';
import { useState } from 'react';
import ContainerSubscription from '../subscriptions/ContainerSubscription';

/**
 * Queries graph for container updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function TeamContainerUpdates({
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

  // Containers for given scenario
  const containersQuery = useGetRangeResourceContainersGraph(
    rangeId,
    scenarioId,
  );
  useQueryDetails({
    queryObj: containersQuery,
    errorFunction: (queryError: any) => {
      // ignore - container subscriptions may be able to get latest status
      debugLogError('Error retrieving Containers via graphql');
      //setInitialized(Topic.ResourceContainer, true);
      setIsInitialized(true);
    },
    successFunction: (successData: any) => {
      const containers = successData?.rangeContainers || [];
      setUpdates(scenarioId, containers, Topic.ResourceContainer);
      //setInitialized(Topic.ResourceContainer, true);
      setIsInitialized(true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isInitialized &&
        (containersQuery?.isSuccess || containersQuery?.isError) && (
          <ContainerSubscription
            rangeId={rangeId}
            scenarioId={scenarioId}
            setUpdate={setUpdate}
          />
        )}
    </div>
  );
}
