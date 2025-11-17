/* Handlers for /rangeResourceConsole graphql endpoints */
import { graphql, HttpResponse } from 'msw';

import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';

const listRangeResourceVMs = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock VM',
    description: 'mock description \non multiple lines',
    uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
    cpuCores: 1,
    memory: '1Gi',
    disks: [
      {
        vmImage: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        storageClass: 'efs-sc',
        storage: '1Gi',
      },
    ],
    bootImage: {
      imageID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      storage: '120Gi',
      accessMode: 'ReadWriteOnce',
      vmDiskDriver: 'virtio',
    },
    firmware: {
      efi: true,
      secureBoot: true,
    },
    interfaces: [
      {
        rangeNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeIP: null,
        vmNicModel: 'virtio',
      },
    ],
    running: false,
    status: 'Stopped',
    kubevirtVmMessage: '',
    kubevirtVmStatus: 'Stopped',
    metadata: {},
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock VM 2',
    uuid: '222v',
    disks: [],
    interfaces: [],
    running: true,
    status: 'Ready',
    kubevirtVmMessage: '',
    kubevirtVmStatus: 'Running',
    metadata: {},
  },
];

export const rangeResourceVMGraph = [
  // graph query
  graphql.query('RangeVMs', ({ query, variables }) => {
    const { rangeId, scenarioId } = variables;

    if (scenarioId === mockScenarioId) {
      return HttpResponse.json({
        data: { rangeVMs: listRangeResourceVMs },
      });
      // #REF to test error response
      // return HttpResponse.json({
      //   errors: [{ message: 'Request failed' }],
      // });
    }
    if (scenarioId === mockScenarioId2) {
      return HttpResponse.json({
        data: { rangeVMs: listRangeResourceVMs },
      });
    }
    return HttpResponse.json({
      data: {}, // not handling any other scenarios yet
    });
  }),
];
//NOTE MSW does NOT support graphql subscriptions (yet)
