/* Handlers for /rangeResourceBgpLink endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

const list = [
  {
    node1: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    node2: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    node1ASN: 3,
    node2ASN: 2,
    uuid: '111',
    dateCreated: '2023-09-19T16:08:27.000Z',
    dateEdited: '2023-09-19T16:08:25.920Z',
    description:
      'Use the redundant CLI bandwidth, \nthen you can override the 1080p interface!',
    name: 'tor-1-workstation-1',
    author: 'Everette91@example.com',
  },
  {
    node1: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    node2: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    node1ASN: 2,
    node2ASN: 1,
    uuid: '222',
    dateCreated: '2023-09-19T16:08:27.000Z',
    dateEdited: '2023-09-19T16:08:25.884Z',
    description:
      'The OCR transmitter is down, synthesize the wireless application so we can input the SAS port!',
    name: 'workstation-1-web-2',
    author: 'Emil51@example.com',
  },
];

const topic = 'range-bgp-links';

export const rangeResourceBgpLink = [
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
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/111`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/111`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
