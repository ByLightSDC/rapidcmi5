/* Handlers for /rangeResourceConsole graphql endpoints */
import { graphql, HttpResponse } from 'msw';

import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';

const listRangeResourcContainers = [
  {
    author: 'andrew.thigpen@bylight.com',
    chart: 'chart',
    chartVersion: '1.0',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock michelles range container',
    description: 'mock description \non multiple lines',
    uuid: '222container',
    interfaces: [],
    ready: false,
    running: false,
    status: 'Stopped',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    chart: 'chart',
    chartVersion: '1.0',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews second range container',
    uuid: '333container',
    interfaces: [],
    ready: true,
    running: true,
    status: 'Ready',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

export const rangeResourceContainerGraph = [
  // graph query
  graphql.query('RangeContainers', ({ query, variables }) => {
    const { rangeId, scenarioId } = variables;

    if (scenarioId === mockScenarioId) {
      return HttpResponse.json({
        data: { rangeContainers: listRangeResourcContainers },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    if (scenarioId === mockScenarioId2) {
      return HttpResponse.json({
        data: { rangeContainers: listRangeResourcContainers },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)
