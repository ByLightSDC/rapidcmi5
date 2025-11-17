/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range OS Container 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'chart-name',
    chartVersion: 'chart-version-name',
    values: {},
    ready: true,
    status: 'Running',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    resources: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range OS Container 2',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'chart-name',
    chartVersion: 'chart-version-name',
    values: {},
    ready: true,
    status: 'Running',
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    resources: {},
  },
];

const emptyList: string[] = [];

const single = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  name: 'Mock Range OS Container 1',
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  chart: 'chart-name',
  chartVersion: 'chart-version-name',
  values: {},
  ready: true,
  status: 'running',
  containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  resources: {},
};

const singlePaused = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  name: 'Mock Range OS Container 1',
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  chart: 'chart-name',
  chartVersion: 'chart-version-name',
  values: {},
  ready: true,
  status: 'paused',
  containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  resources: {},
};

export const rangeOSContainer = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers`,
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
        return HttpResponse.json(list, { status: 200 });
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // POST (pause)
  http.post(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers/12345678-6fb7-4997-8f3c-70f0a335d5a3/pause`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(singlePaused, { status: 200 });
    },
  ),

  // POST (resume)
  http.post(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers/12345678-6fb7-4997-8f3c-70f0a335d5a3/resume`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3/rangecontainers/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
