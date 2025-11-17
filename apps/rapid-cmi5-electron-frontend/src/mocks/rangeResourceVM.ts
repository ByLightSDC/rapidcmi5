/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'range-vms';
const list = [
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
        // rangeNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeHostNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeIP: null,
        rangeAutoIP: null,
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

const vmList2 = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock VM Add',
    uuid: '999v',
    disks: [],
    interfaces: [],
    running: false,
    status: 'Creating',
    kubevirtVmMessage: 'Starting',
    kubevirtVmStatus: 'Starting',
    metadata: {},
  },
  ...list,
];

const vmRunning1 = {
  ...list[0],
  running: true,
  status: 'Ready',
  kubevirtVmMessage: '',
  kubevirtVmStatus: 'Running',
};
const vmRunning2 = {
  ...list[1],
  running: true,
  status: 'Ready',
  kubevirtVmMessage: '',
  kubevirtVmStatus: 'Running',
};
const vmPause1 = {
  ...list[0],
  running: false,
  status: 'Stopping',
  kubevirtVmMessage: 'stopping',
  kubevirtVmStatus: 'Stopping',
};
const vmPause2 = {
  ...list[1],
  running: false,
  status: 'Stopping',
  kubevirtVmMessage: 'stopping',
  kubevirtVmStatus: 'Stopping',
};

export const rangeResourceVM = [
  // GET list
  //   mockScenarioId
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(list.length / +limit);
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: totalPages,
            data: list,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: 1,
            data: list,
          },
          { status: 200 },
        );
      }
    },
  ),
  // mockScenarioId2 -- to test add vm
  // locally it reads it on mounting
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/${apiTopic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(list.length / +limit);
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: totalPages,
            data: list,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: 1,
            data: list,
          },
          { status: 200 },
        );
      }
    },
    { once: true },
  ),
  // now add a VM -- this should get kicked off when click test add vm...
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/${apiTopic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(vmList2.length / +limit);
        return HttpResponse.json(
          {
            totalCount: vmList2.length,
            totalPages: totalPages,
            data: vmList2,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: vmList2.length,
            totalPages: 1,
            data: vmList2,
          },
          { status: 200 },
        );
      }
    },
  ),
  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // POST (stop)
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345679-6fb7-4997-8f3c-70f0a335d5a3/stop`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(vmPause1, { status: 200 });
    },
  ),
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222/stop`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(vmPause2, { status: 200 });
    },
  ),

  // POST (start)
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345679-6fb7-4997-8f3c-70f0a335d5a3/start`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(vmRunning1, { status: 200 });
    },
  ),
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222/start`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(vmRunning2, { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
