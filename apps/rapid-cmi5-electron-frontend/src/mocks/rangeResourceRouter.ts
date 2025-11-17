/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

const listRangeResourceRouters = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews range router',
    description: 'mock description \non multiple lines',
    interfaces: [
      {
        interfaceType: 'service',
        rangeIPs: [
          '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          '22345678-6fb7-4997-8f3c-70f0a335d5a3',
        ],
      },
    ],
    uuid: '222',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews second range router',
    interfaces: [{ rangeIPs: ['32345678-6fb7-4997-8f3c-70f0a335d5a3'] }],
    uuid: '333',
  },
];

export const rangeResourceRouter = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-routers`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listRangeResourceRouters.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listRangeResourceRouters.length,
            totalPages: totalPages,
            data: listRangeResourceRouters,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listRangeResourceRouters.length,
            totalPages: 1,
            data: listRangeResourceRouters,
          },
          { status: 200 },
        );
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-routers/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listRangeResourceRouters[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-routers/333`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listRangeResourceRouters[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-routers/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
