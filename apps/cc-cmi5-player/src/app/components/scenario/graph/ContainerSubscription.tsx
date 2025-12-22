/* CLONE */

import { useContext, useEffect } from 'react';
import { gql } from 'graphql-request';

import {
  graphqlContainerFields,
  useSubscription,
  Topic,
} from '@rapid-cmi5/ui';
import { RangeContainer } from '@rapid-cmi5/ui';
import { ScenarioUpdatesContext } from '../ScenarioUpdatesContext';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ContainerSubscription({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { setUpdate } = useContext(ScenarioUpdatesContext);

  /**
   * Listen for realtime range container updates
   * Fires when status of the container changes (when resuming/pausing)
   */
  const rangeContainersUpdatedQuery = gql`
    subscription RangeContainersUpdated(
      $rangeId: String!
      $scenarioId: String!
    ) {
      rangeContainersUpdated(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlContainerFields}
      }
    }
  `;

  const queryParamsRangeContainerUpdates = {
    operationName: 'RangeContainersUpdated',
    query: rangeContainersUpdatedQuery,
    variables: {
      rangeId: rangeId,
      scenarioId: scenarioId,
    },
  };

  const updateContainersSubscription = useSubscription(
    queryParamsRangeContainerUpdates,
    {
      data: { rangeContainersUpdated: {} },
    },
  );

  /** UE handles subscription update for Container */
  useEffect(() => {
    if (Object.keys(updateContainersSubscription.data).length > 0) {
      if (updateContainersSubscription?.data?.data?.rangeContainersUpdated) {
        const container = updateContainersSubscription.data.data
          .rangeContainersUpdated as Partial<RangeContainer>;
        if (Object.keys(container).length > 0 && container.uuid) {
          setUpdate(container, Topic.ResourceContainer);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateContainersSubscription.data]);

  return <div />;
}
