/* Handlers for /rangeResourceConsole endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId, mockScenarioId2 } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

// enum for status: Unknown, Ready, NotReady, Creating, Error, Deleting, Stopped
const listRangeResourceConsoles = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    message: '',
    name: 'Mock andrews range console',
    description: 'mock description \non multiple lines',
    protocol: 'vnc',
    status: 'Ready',
    uuid: '222console',
    rangeVM: null,
    rangeContainer: '222container',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    message: 'Console Error',
    name: 'Mock andrews second range console',
    protocol: 'ssh',
    status: 'Error',
    uuid: '333console',
    rangeVM: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
    rangeContainer: null,
  },
];
const listRangeResourceConsoles2 = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    message: '',
    name: 'Mock added range console',
    protocol: 'hypervisor',
    status: 'Ready',
    uuid: '444console',
    rangeVM: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    rangeContainer: null,
    url: 'http://www.google.com',
  },
  ...listRangeResourceConsoles,
];

export const rangeResourceConsole = [
  // GET list
  //   mockScenarioId
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-consoles`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listRangeResourceConsoles.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles.length,
            totalPages: totalPages,
            data: listRangeResourceConsoles,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles.length,
            totalPages: 1,
            data: listRangeResourceConsoles,
          },
          { status: 200 },
        );
      }
    },
  ),
  // mockScenarioId2 -- to test add console
  // locally it reads it on mounting
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/range-consoles`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listRangeResourceConsoles.length / +limit);
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles.length,
            totalPages: totalPages,
            data: listRangeResourceConsoles,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles.length,
            totalPages: 1,
            data: listRangeResourceConsoles,
          },
          { status: 200 },
        );
      }
    },
    { once: true },
  ),
  // now add a console -- this should get kicked off when click test add console...
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId2}/range-consoles`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(
          listRangeResourceConsoles2.length / +limit,
        );
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles2.length,
            totalPages: totalPages,
            data: listRangeResourceConsoles2,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: listRangeResourceConsoles2.length,
            totalPages: 1,
            data: listRangeResourceConsoles2,
          },
          { status: 200 },
        );
      }
    },
  ),
  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-consoles/222console`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listRangeResourceConsoles[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/range-consoles/333console`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listRangeResourceConsoles[1], { status: 200 });
    },
  ),
];
