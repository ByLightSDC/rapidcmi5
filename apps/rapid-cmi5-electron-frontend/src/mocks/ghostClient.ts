/* Handlers for /ghost-clients endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    c2Server: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    rangeAutoIP: null,
    profile: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    nameservers: ['176.137.243.5'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.759Z',
    dateEdited: '2024-03-13T18:13:24.759Z',
    description: '',
    name: 'Mock Ghost Client-1',
    author: 'andrew.thigpen@bylight.com',
  },
  {
    c2Server: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    rangeIP: null,
    rangeAutoIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    profile: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    nameservers: ['176.137.243.5'],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.759Z',
    dateEdited: '2024-03-13T18:13:24.759Z',
    description: '',
    name: 'Mock Ghost Client-2',
    author: 'andrew.thigpen@bylight.com',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const ghostClient = [
  // GET list
  http.get(`${baseUrl}/ghost-clients`, ({ request, params, cookies }) => {
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
      // return full list
      return HttpResponse.json(list, { status: 200 });
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/ghost-clients/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/ghost-clients/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/ghost-clients`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/ghost-clients/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/ghost-clients/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
