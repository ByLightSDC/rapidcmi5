/* CLONE */

import { useContext, useEffect } from 'react';
import { gql } from 'graphql-request';

import {
  graphqlScenarioFields,
  Topic,
  useSubscription,
} from '@rangeos-nx/ui/api/hooks';
import {
  DeployedScenarioData,
  ScenarioUpdatesContext,
} from '../ScenarioUpdatesContext';

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
      scenarioId: scenarioId,
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
        if (Object.prototype.hasOwnProperty.call(scenario, 'packages')) {
          setUpdate(scenario, Topic.ResourceScenario);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateScenarioSubscription.data]);

  return <div />;
}
