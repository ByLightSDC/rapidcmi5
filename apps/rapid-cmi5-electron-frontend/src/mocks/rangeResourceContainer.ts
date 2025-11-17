/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

const listContainers = [
  {
    author: 'andrew.thigpen@bylight.com',
    chart: 'chart',
    chartVersion: '1.0',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock michelles range container',
    description: 'mock description \non multiple lines',
    uuid: '222container',
    // interfaces: [],
    interfaces: [
      {
        // rangeNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeHostNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeIP: null,
        rangeAutoIP: null,
        defaultGateway: false,
        id: '',
        interfaceName: '',
        macAddress: null,
        portMirrors: [],
      },
    ],
    rangeVolumes: { certs: '12345678-6fb7-4997-8f3c-70f0a335d5a3' },
    values: {},
    message: '',
    ready: true,
    running: false,
    status: 'Ready',
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
    rangeVolumes: { certs: '12345678-6fb7-4997-8f3c-70f0a335d5a3' },
    values: {},
    message: '',
    ready: true,
    running: false,
    status: 'Ready',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const listContainers2 = [
  {
    author: 'andrew.thigpen@bylight.com',
    chart: 'chart',
    chartVersion: '1.0',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock added range container',
    uuid: '999container',
    interfaces: [],
    rangeVolumes: { certs: '12345678-6fb7-4997-8f3c-70f0a335d5a3' },
    values: {},
    message: '',
    ready: false,
    running: false,
    status: 'NotReady',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  ...listContainers,
];

export const rangeResourceContainer = [
  // GET list
  //   mockScenarioId
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listContainers.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listContainers.length,
            totalPages: totalPages,
            data: listContainers,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listContainers.length,
            totalPages: 1,
            data: listContainers,
          },
          { status: 200 },
        );
      }
    },
  ),
  // mockScenarioId2 -- to test add container
  // locally it reads it on mounting
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/range-containers`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listContainers.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listContainers.length,
            totalPages: totalPages,
            data: listContainers,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listContainers.length,
            totalPages: 1,
            data: listContainers,
          },
          { status: 200 },
        );
      }
    },
    { once: true },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/range-containers`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listContainers2.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listContainers2.length,
            totalPages: totalPages,
            data: listContainers2,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listContainers2.length,
            totalPages: 1,
            data: listContainers2,
          },
          { status: 200 },
        );
      }
    },
  ),
  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers/222container`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listContainers[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers/333container`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listContainers[1], { status: 200 });
    },
  ),

  // POST (pause)
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers/222container/stop`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(null, { status: 204 });
    },
  ),

  // POST (resume)
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers/222container/start`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(null, { status: 204 });
    },
  ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-containers/222container`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
