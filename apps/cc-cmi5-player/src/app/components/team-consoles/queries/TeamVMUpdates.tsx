/* CLONE */

import {
  useGetRangeResourceVmsGraph,
  Topic,
} from '@rangeos-nx/frontend/clients/hooks';
import { useState } from 'react';
import VMSubscription from '../subscriptions/VMSubscription';
import { useQueryDetails } from '@rapid-cmi5/ui';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function TeamVMUpdates({
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
  //console.log(`query VM graph ${rangeId} ${scenarioId}`);
  const vmsQuery = useGetRangeResourceVmsGraph(rangeId, scenarioId);
  useQueryDetails({
    queryObj: vmsQuery,
    errorFunction: (queryError) => {
      console.log('error vms', queryError);
      //setInitialized(Topic.ResourceVM, true);
      setIsInitialized(true);
    },
    successFunction: (successData) => {
      const vms = successData?.rangeVMs || [];
      //console.log('success vms', vms);
      setUpdates(scenarioId, vms, Topic.ResourceVM);
      //setInitialized(Topic.ResourceVM, true);
      setIsInitialized(true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isInitialized && (vmsQuery?.isSuccess || vmsQuery?.isError) && (
        <VMSubscription
          rangeId={rangeId}
          scenarioId={scenarioId}
          setUpdate={setUpdate}
        />
      )}
    </div>
  );
}
