/* Handlers for /backgroundJob graphql endpoints */
import { graphql, HttpResponse } from 'msw';
import { mockScenarioId } from './rangeResourceScenario';

const jobList = [
  {
    uuid: '05446ddd-50a4-4a72-b5f3-17ee14ef0fa4',
    jobId: '2569',
    attempts: 1,
    maxAttempts: 3,
    state: 'Completed',
    dateCreated: '2024-11-18T18:32:45.470Z',
    name: 'toggleRangeVM',
  },
  {
    uuid: 'e2f25b8b-120c-4bbe-b108-319a833a6574',
    jobId: '2558',
    attempts: 1,
    maxAttempts: 3,
    state: 'Completed',
    dateCreated: '2024-11-15T20:30:09.799Z',
    name: 'deployScenario',
  },
];

export const backgroundJobGraph = [
  // graph query
  graphql.query('BackgroundJobs', ({ query, variables }) => {
    const { scenarioId } = variables;
    if (scenarioId === mockScenarioId) {
      return HttpResponse.json({
        data: { backgroundJobs: jobList },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
    // #REF to test error response
    // return HttpResponse.json({
    //   errors: [{ message: 'Request failed' }],
    // });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)];
