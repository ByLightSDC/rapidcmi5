/* CLONE */

import { useContext, useEffect } from 'react';
import { gql } from 'graphql-request';


import {
  DeployedScenarioData,
  ScenarioUpdatesContext,
} from '../ScenarioUpdatesContext';
import { graphqlScenarioFields, Topic, useSubscription } from '@rangeos-nx/frontend/clients/hooks';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ScenarioSubscription({
  rangeId,
  scenarioId,
}: {
  rangeId: string;
  scenarioId: string;
}) {
  const { setUpdate } = useContext(ScenarioUpdatesContext);

  /**
   * Listen for realtime range scenario updates
   * Fires when status of the scenario changes
   */
  const scenarioUpdatedQuery = gql`
    subscription ScenarioUpdated($rangeId: String!, $uuid: String!) {
      scenarioUpdated(rangeId: $rangeId, uuid: $uuid) {
        ${graphqlScenarioFields}
      }
    }
  `;

  const queryParamsScenarioUpdates = {
    operationName: 'ScenarioUpdated',
    query: scenarioUpdatedQuery,
    variables: {
      rangeId: rangeId,
      // The query declares $uuid (scenarioUpdated(uuid: $uuid)); this MUST be
      // keyed `uuid`, not `scenarioId`. Passing `scenarioId` left $uuid unbound
      // → the server filter never matched → ZERO scenarioUpdated events → the
      // scenario header stayed stuck NotReady (while console/VM subscriptions,
      // which correctly declare+pass $scenarioId, worked fine). scenarioId IS
      // the scenario's uuid.
      uuid: scenarioId,
    },
  };

  const updateScenarioSubscription = useSubscription(
    queryParamsScenarioUpdates,
    {
      data: { scenarioUpdated: {} },
    },
  );

  /** UE handles subscription update for Scenario */
  useEffect(() => {
    if (Object.keys(updateScenarioSubscription.data).length > 0) {
      //console.log('updateScenarioSubscription?.data', updateScenarioSubscription?.data);
      if (updateScenarioSubscription?.data?.data?.scenarioUpdated) {
        const scenario = updateScenarioSubscription.data.data
          .scenarioUpdated as Partial<DeployedScenarioData>;
        // Accept the update if it carries packages OR a status. The original
        // guard only let through events with a `packages` field, which would
        // DROP a status-only update (e.g. NotReady → Ready) — so even once
        // events arrive, the header could miss the Ready transition. Gating on
        // status too lets the scenario header advance on status-only pushes.
        if (
          Object.prototype.hasOwnProperty.call(scenario, 'packages') ||
          scenario.status !== undefined
        ) {
          setUpdate(scenario, Topic.ResourceScenario);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateScenarioSubscription.data]);

  return <div />;
}
