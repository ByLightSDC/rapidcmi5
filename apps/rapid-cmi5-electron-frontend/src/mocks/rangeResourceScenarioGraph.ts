/* Handlers for /rangeResourceScenario graphql endpoints */
import { graphql, HttpResponse } from 'msw';

import {
  mockScenarioId,
  mockScenarioId2,
  mockParentScenarioId,
  mockRangeId,
} from './rangeResourceScenario';

const singleRangeScenario1 = {
  scenarioId: mockParentScenarioId,
  uuid: mockScenarioId,
  name: 'mock andrews test scenario',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  message: 'One or more packages not ready',
  status: 'NotReady',
  packages: [
    {
      name: 'Mock Package',
      uuid: '222p',
      status: 'NotReady',
    },
    {
      name: 'Mock Package 2',
      uuid: '333p',
      status: 'Ready',
    },
  ],
};

const singleRangeScenario2 = {
  uuid: mockScenarioId2,
  scenarioId: mockParentScenarioId,
  description: 'mock michelles test scenario',
  name: 'mock michelles test scenario',
  author: 'michelle.gabele@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  status: 'Ready',
  packages: [
    {
      name: 'Mock Package',
      uuid: '222p',
      status: 'NotReady',
    },
  ],
};

const listScenarios = [
  {
    scenarioId: mockParentScenarioId,
    uuid: mockScenarioId,
    description: 'mock andrews test scenario',
    name: 'mock andrews test scenario',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Ready',
  },
  {
    scenarioId: mockParentScenarioId,
    uuid: mockScenarioId2,
    description: 'mock michelles test scenario',
    name: 'mock michelles test scenario',
    author: 'michelle.gabele@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Ready',
  },
];

export const rangeResourceScenarioGraph = [
  // graph query - scenario list
  graphql.query('Scenarios', ({ query, variables }) => {
    const { rangeId } = variables;
    if (rangeId === mockRangeId) {
      return HttpResponse.json({
        data: { scenarios: listScenarios },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    return HttpResponse.json({
      data: {}, // not handling any other ranges yet
    });
  }),
  // graph query - individual scenario
  graphql.query('Scenario', ({ query, variables }) => {
    const { rangeId, uuid } = variables;
    if (uuid === mockScenarioId) {
      return HttpResponse.json({
        data: { scenario: singleRangeScenario1 },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    if (uuid === mockScenarioId2) {
      return HttpResponse.json({
        data: { scenario: singleRangeScenario2 },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)
