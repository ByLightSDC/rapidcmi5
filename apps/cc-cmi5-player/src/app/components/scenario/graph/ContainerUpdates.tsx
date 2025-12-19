/* eslint-disable @typescript-eslint/no-explicit-any */

/* CLONE */

import { useContext } from 'react';

import {
  useGetRangeResourceContainersGraph,
  useQueryDetails,
  Topic,
} from '@rapid-cmi5/ui/branded';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import ContainerSubscription from './ContainerSubscription';

/**
 * Queries graph for container updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ContainerUpdates({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { isContextInitialized, setInitialized, setUpdates } = useContext(
    ScenarioUpdatesContext,
  );

  // Containers for given scenario
  const containersQuery = useGetRangeResourceContainersGraph(
    rangeId,
    scenarioId,
  );
  useQueryDetails({
    queryObj: containersQuery,
    errorFunction: (queryError: any) => {
      setInitialized(Topic.ResourceContainer, true);
    },
    successFunction: (successData: any) => {
      const containers = successData?.rangeContainers || [];
      setUpdates(containers, Topic.ResourceContainer);
      setInitialized(Topic.ResourceContainer, true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isContextInitialized &&
        (containersQuery?.isSuccess || containersQuery?.isError) && (
          <ContainerSubscription rangeId={rangeId} scenarioId={scenarioId} />
        )}
    </div>
  );
}
