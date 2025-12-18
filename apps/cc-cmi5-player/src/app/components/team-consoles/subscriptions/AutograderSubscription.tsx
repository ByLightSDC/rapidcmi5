/* CLONE */

import { useEffect } from 'react';
import { gql } from 'graphql-request';

import {
  graphqlAutoGraderResultsFields,
  useSubscription,
  Topic,
  AutoGraderEvent,
} from '@rapid-cmi5/ui/api/hooks';

/**
 * Queries graph for vm updates
 * Pushes updates to ScenarioUpdatesContext
 * @param param0
 * @returns
 */
export default function AutograderSubscription({
  rangeId,
  scenarioId,
  setUpdate,
}: {
  rangeId: string;
  scenarioId: string;
  setUpdate: (deployedScenarioId: string, data: any, topic: Topic) => void;
}) {
  /**
   * Listen for realtime scenario autograder results updates
   * Fires when status of the autograder event changes
   */
  const scenarioAutoGraderResultsQuery = gql`
      subscription AutoGraderResults($rangeId: String!, $scenarioId: String!) {
      autoGraderResults(rangeId: $rangeId, scenarioId: $scenarioId) {
         ${graphqlAutoGraderResultsFields}
      }
    }
  `;

  const queryParamsAutoGraderResults = {
    operationName: 'AutoGraderResults',
    query: scenarioAutoGraderResultsQuery,
    variables: {
      rangeId: rangeId,
      scenarioId: scenarioId,
    },
  };

  const updateAutoGradersSubscription = useSubscription(
    queryParamsAutoGraderResults,
    {
      data: { autoGraderResults: {} },
    },
  );

  /** UE handles subscription update for VM */
  useEffect(() => {
    if (Object.keys(updateAutoGradersSubscription.data).length > 0) {
      if (updateAutoGradersSubscription?.data?.data?.autoGraderResults) {
        const message = updateAutoGradersSubscription.data.data
          .autoGraderResults as Partial<AutoGraderEvent>;
        // --------> object with result and autoGrader
        if (message?.autoGrader?.uuid) {
          setUpdate(
            scenarioId,
            {
              uuid: message?.autoGrader?.uuid,
              autograder: message.autoGrader,
              result: message.result,
            },
            Topic.ResourceAutoGrader,
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateAutoGradersSubscription.data]);

  return <div />;
}
