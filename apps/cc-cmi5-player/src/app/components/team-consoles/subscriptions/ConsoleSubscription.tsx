/* CLONE */

import { gql } from 'graphql-request';

import {
  graphqlConsoleFields,
  useSubscription,
  Topic,
} from '@rangeos-nx/frontend/clients/hooks';
import { DeployedRangeConsole } from '@rangeos-nx/frontend/clients/devops-api';
import { useEffect } from 'react';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function ConsoleSubscription({
  rangeId,
  scenarioId,
  setUpdate,
}: {
  rangeId: string;
  scenarioId: string;
  setUpdate: (deployedScenarioId: string, data: any, topic: Topic) => void;
}) {
  /**
   * Listen for realtime range console updates
   * Fires when status of the console changes (example owner of console is started/stopped...)
   */
  const rangeConsolesUpdatedQuery = gql`
    subscription RangeConsolesUpdated($rangeId: String!, $scenarioId: String!) {
      rangeConsolesUpdated(rangeId: $rangeId, scenarioId: $scenarioId) {
        ${graphqlConsoleFields}
      }
    }
  `;

  const queryParamsRangeConsoleUpdates = {
    operationName: 'RangeConsolesUpdated',
    query: rangeConsolesUpdatedQuery,
    variables: {
      rangeId: rangeId,
      scenarioId: scenarioId,
    },
  };

  const updateConsolesSubscription = useSubscription(
    queryParamsRangeConsoleUpdates,
    {
      data: { rangeConsolesUpdated: {} },
    },
  );

  /** UE handles subscription update for Console */
  useEffect(() => {
    if (Object.keys(updateConsolesSubscription.data).length > 0) {
      if (updateConsolesSubscription?.data?.data?.rangeConsolesUpdated) {
        const theConsole = updateConsolesSubscription.data.data
          .rangeConsolesUpdated as Partial<DeployedRangeConsole>;
        if (Object.keys(console).length > 0 && theConsole.uuid) {
          setUpdate(scenarioId, theConsole, Topic.ResourceConsole);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateConsolesSubscription.data]);

  return <div />;
}
