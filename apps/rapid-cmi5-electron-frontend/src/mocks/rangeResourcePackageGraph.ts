/* Handlers for /resourcePackage graphql endpoints */
import { graphql, HttpResponse } from 'msw';
import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';

const packageList = [
  {
    name: 'Mock Package',
    uuid: '222p',
    message: 'One or mor VMs not ready',
    status: 'NotReady',
    containerSpecifications: [
      { uuid: '222container' },
      { uuid: '333container' },
    ],
    rangeL3Networks: [],
    rangeRouters: [],
    vmSpecifications: [
      { uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3' },
      { uuid: '222v' },
    ],
  },
  {
    name: 'Mock Package 2',
    uuid: '333p',
    message: '',
    status: 'Ready',
    containerSpecifications: [],
    rangeL3Networks: [],
    rangeRouters: [],
    vmSpecifications: [],
  },
];

export const rangeResourcePackageGraph = [
  // graph query
  graphql.query('Packages', ({ query, variables }) => {
    const { rangeId, scenarioId } = variables;
    if (scenarioId === mockScenarioId) {
      return HttpResponse.json({
        data: { packages: packageList },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    if (scenarioId === mockScenarioId2) {
      return HttpResponse.json({
        data: { packages: packageList },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)];
