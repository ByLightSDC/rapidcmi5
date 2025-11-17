/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'range-dns-zones';
const zoneList = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'mock1.zone.com',
    description: 'mock description \non multiple lines',
    uuid: '222',
    ttl: 86400,
    masterNs: '',
    email: '',
    serial: undefined,
    refresh: 14400,
    retry: 900,
    expire: 28800,
    minimumTTL: 300,
    tagSelectors: [],
    ready: true,
    status: '',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'mock2.zone.com',
    uuid: '222',
    ttl: 86400,
    masterNs: '',
    email: '',
    serial: undefined,
    refresh: 14400,
    retry: 900,
    expire: 28800,
    minimumTTL: 300,
    tagSelectors: [],
    ready: true,
    status: 'reconcilesuccess',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'mock3.zone.com',
    uuid: '222',
    ttl: 86400,
    masterNs: '',
    email: '',
    serial: undefined,
    refresh: 14400,
    retry: 900,
    expire: 28800,
    minimumTTL: 300,
    tagSelectors: [],
    ready: false,
    status: 'Deleting',
  },
];

export const rangeResourceDnsZone = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(zoneList.length / +limit);
        return HttpResponse.json(
          {
            totalCount: zoneList.length,
            totalPages: totalPages,
            data: zoneList,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: zoneList.length,
            totalPages: 1,
            data: zoneList,
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
      return HttpResponse.json(zoneList[0], { status: 200 });
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
