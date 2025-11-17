/* Handlers for /rangeResourceClusterNetwork endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

const list = [
  {
    status: 'Ready',
    message: '',
    persist: false,
    uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2025-04-07T19:43:37.000Z',
    dateEdited: '2025-04-07T19:43:59.000Z',
    description:
      'Auto generated for RangeNetwork 6853ffd2-5107-4bad-a3db-86ccaf37d966',
    name: 'Auto generated ClusterRangeNetwork',
    author: '',
  },
  {
    status: 'Ready',
    message: '',
    persist: false,
    uuid: '22345679-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2025-03-12T15:40:25.000Z',
    dateEdited: '2025-03-12T15:40:25.000Z',
    description:
      'Auto generated for RangeNetwork 1d31d662-564a-4567-bd89-aab645102151',
    name: 'Auto generated ClusterRangeNetwork',
    author: '',
  },
];
const topic = 'cluster-range-networks';

export const rangeResourceClusterNetwork = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${topic}`,
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
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${topic}/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${topic}/22345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${topic}/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${topic}/22345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
