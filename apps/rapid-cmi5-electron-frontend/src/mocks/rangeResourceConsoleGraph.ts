/* Handlers for /rangeResourceConsole graphql endpoints */
import { graphql, HttpResponse } from 'msw';

import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';

// enum for status: Unknown, Ready, NotReady, Creating, Error, Deleting, Stopped
const listRangeResourceConsoles = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    message: 'Container Not Ready',
    name: 'Mock andrews range console',
    protocol: 'vnc',
    status: 'NotReady',
    uuid: '222console',
    rangeVM: null,
    rangeContainer: '222container',
    url: 'http://www.google.com',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    message: 'Console Error',
    name: 'Mock andrews second range console',
    protocol: 'ssh',
    status: 'Error',
    uuid: '333console',
    rangeVM: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
    rangeContainer: null,
  },
];

export const rangeResourceConsoleGraph = [
  // graph query
  graphql.query('RangeConsoles', ({ query, variables }) => {
    const { rangeId, scenarioId } = variables;

    if (scenarioId === mockScenarioId) {
      return HttpResponse.json({
        data: { rangeConsoles: listRangeResourceConsoles },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    if (scenarioId === mockScenarioId2) {
      return HttpResponse.json({
        data: { rangeConsoles: listRangeResourceConsoles },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)
