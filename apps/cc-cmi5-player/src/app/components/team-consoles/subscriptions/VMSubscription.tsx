/* CLONE */

import { useEffect } from 'react';
import { gql } from 'graphql-request';

import {
  graphqlVmFields,
  useSubscription,
  Topic,
} from '@rapid-cmi5/ui';
import { RangeVM } from '@rapid-cmi5/ui';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function VMSubscription({
  rangeId,
  scenarioId,
  setUpdate,
}: {
  rangeId: string;
  scenarioId: string;
  setUpdate: (deployedScenarioId: string, data: any, topic: Topic) => void;
}) {
  /**
   * Listen for realtime range VM updates
   * Fires when status of the VM changes (when start/stop)
   */
  const rangeVMsUpdatedQuery = gql`
  subscription RangeVMsUpdated($rangeId: String!, $scenarioId: String!) {
    rangeVMsUpdated(rangeId: $rangeId, scenarioId: $scenarioId) {
      ${graphqlVmFields}
    }
  }
`;

  const queryParamsRangeVMUpdates = {
    operationName: 'RangeVMsUpdated',
    query: rangeVMsUpdatedQuery,
    variables: {
      rangeId: rangeId,
      scenarioId: scenarioId,
    },
  };

  const updateVMsSubscription = useSubscription(queryParamsRangeVMUpdates, {
    data: { rangeVMsUpdated: {} },
  });

  /** UE handles subscription update for VM */
  useEffect(() => {
    if (Object.keys(updateVMsSubscription.data).length > 0) {
      if (updateVMsSubscription?.data?.data?.rangeVMsUpdated) {
        const vm = updateVMsSubscription.data.data
          .rangeVMsUpdated as Partial<RangeVM>;
        if (Object.keys(vm).length > 0 && vm.uuid) {
          setUpdate(scenarioId, vm, Topic.ResourceVM);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateVMsSubscription.data]);

  return <div />;
}
