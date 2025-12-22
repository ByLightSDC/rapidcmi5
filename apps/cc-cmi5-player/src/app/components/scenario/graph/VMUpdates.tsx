/* CLONE */

import { useContext } from 'react';

import {
  useGetRangeResourceVmsGraph,
  useQueryDetails,
  Topic,
} from '@rapid-cmi5/ui';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';
import VMSubscription from './VMSubscription';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function VMUpdates({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { isContextInitialized, setInitialized, setUpdates } = useContext(
    ScenarioUpdatesContext,
  );

  // VMs for given scenario
  const vmsQuery = useGetRangeResourceVmsGraph(rangeId, scenarioId);
  useQueryDetails({
    queryObj: vmsQuery,
    errorFunction: (queryError) => {
      setInitialized(Topic.ResourceVM, true);
    },
    successFunction: (successData) => {
      const vms = successData?.rangeVMs || [];
      setUpdates(vms, Topic.ResourceVM);
      setInitialized(Topic.ResourceVM, true);
    },
    shouldDisplayToaster: false,
  });

  // only start subscription AFTER query - even if error on full list - individuals may be ok
  return (
    <div>
      {isContextInitialized && (vmsQuery?.isSuccess || vmsQuery?.isError) && (
        <VMSubscription rangeId={rangeId} scenarioId={scenarioId} />
      )}
    </div>
  );
}
