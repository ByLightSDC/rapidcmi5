/* CLONE */

import { useEffect, useRef, useState } from 'react';
import { gql } from 'graphql-request';

import {
  AutoGraderEvent,
  graphqlAutoGraderResultsFields,
  useSubscription,
} from '@rangeos-nx/ui/api/hooks';

/**
 * Queries graph for AutoGrader updates
 * @param param0
 * @returns
 */

export default function AutoGraderSubscription({
  rangeId,
  scenarioId,
  onUpdate,
}: {
  rangeId: string;
  scenarioId: string;
  onUpdate: (results: AutoGraderEvent[]) => void;
}) {
  const seenUUIDs = useRef<Set<string>>(new Set());
  const [events, setEvents] = useState<AutoGraderEvent[]>([]);

  /**
   * Listen for realtime range scenario updates
   * Fires when status of the scenario changes
   */
  const autoGraderResults = gql`
    subscription AutoGraderResults($rangeId: String!, $scenarioId: String!) {
      autoGraderResults(rangeId: $rangeId, scenarioId: $scenarioId) {
         ${graphqlAutoGraderResultsFields}
      }
    }
  `;

  const queryParamsAutoGradersUpdates = {
    operationName: 'AutoGraderResults',
    query: autoGraderResults,
    variables: {
      rangeId: rangeId,
      scenarioId: scenarioId,
    },
  };

  const autoGraderResultsSubscription = useSubscription(
    queryParamsAutoGradersUpdates,
    {
      data: { autoGraderResults: {} },
    },
  );

  /** UE handles subscription update for Scenario */
  useEffect(() => {
    const newEvent: AutoGraderEvent =
      autoGraderResultsSubscription?.data?.data?.autoGraderResults;
    if (!newEvent) return;

    const uuid = newEvent?.autoGrader?.uuid;
    if (!uuid || seenUUIDs.current.has(uuid)) return;

    seenUUIDs.current.add(uuid);

    setEvents((prev) => {
      const updated = [...prev, newEvent];
      onUpdate(updated);
      return updated;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGraderResultsSubscription.data]);

  return <div />;
}
