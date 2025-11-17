/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const topic = 'range-tor-nets';

const list = [
  {
    uuid: '222',
    name: 'Mock Tor Net',
    description: 'mock description \non multiple lines',
    version: '0.4.7.11',
    directoryAuthorities: [
      {
        name: 'authority 1',
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      {
        name: 'authority 2',
        rangeIP: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      {
        name: 'authority 3',
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      {
        name: 'authority 4',
        rangeIP: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      {
        name: 'authority 5',
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    ],
    relays: [
      {
        name: 'relay 1',
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        dnsRangeIP: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    ],
    exitNodes: [
      {
        name: 'exit 1',
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    ],
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    author: 'sample.user@bylight.com',
  },
  {
    uuid: '222',
    name: 'Mock Tor Net 2',
    description: 'Mock Description',
    directoryAuthorities: [],
    relays: [],
    exitNodes: [],
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    author: 'sample.user@bylight.com',
  },
];

export const rangeResourceTorNetwork = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}`,
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
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
