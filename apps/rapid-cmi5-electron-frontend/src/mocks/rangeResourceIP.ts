/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'range-ips';
const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 1',
    uuid: '222',
    description: 'mock description \non multiple lines',
    address: '10.10.10.10',
    latitude: '21.3099',
    longitude: '-157.8581',
    rangeL3Network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    controlNet: false,
    ready: true,
    status: 'ReconcileSuccess',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 2',
    uuid: '333',
    description: 'my description',
    address: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2222/24',
    latitude: null,
    longitude: null,
    countryCode: null,
    controlNet: false,
    ready: true,
    status: 'ReconcileSuccess',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 4',
    uuid: '444',
    description: 'my description',
    address: '192.0.2.146/10',
    latitude: null,
    longitude: null,
    countryCode: null,
    controlNet: false,
    ready: true,
    status: 'ReconcileSuccess',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 5',
    uuid: '555',
    description: 'my description',
    address: null,
    latitude: null,
    longitude: null,
    countryCode: 'US',
    controlNet: false,
    ready: true,
    status: 'ReconcileSuccess',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 6',
    uuid: '666',
    description: 'my description',
    address: null,
    latitude: null,
    longitude: null,
    countryCode: null,
    controlNet: false,
    ready: true,
    status: 'ReconcileSuccess',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range Deleted IP 7',
    uuid: '666',
    description: 'my description',
    address: null,
    latitude: null,
    longitude: null,
    countryCode: null,
    controlNet: false,
    ready: true,
    status: 'Deleting',
  },
];

export const rangeResourceIP = [
  // GET list
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

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/333`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/444`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[2], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/555`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[3], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/666`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[4], { status: 200 });
    },
  ),
  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
