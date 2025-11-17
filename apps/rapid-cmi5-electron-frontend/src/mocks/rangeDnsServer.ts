/* Handlers for /range-dns-servers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    rangeIPs: {
      'Mock Range IP 1': '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
    rangeAutoIPs: {},
    type: 'authoritative',
    tags: ['tag-a'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-11-02T20:31:33.000Z',
    dateEdited: '2022-11-02T21:35:02.000Z',
    description: 'test description update',
    name: 'Mock DNS Server 1',
    author: 'michelle.gabele@bylight.com',
  },
  {
    rangeIPs: {
      'Mock Range IP 2': '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
    rangeAutoIPs: {},
    type: 'authoritative',
    tags: ['testtag2'],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-11-02T20:31:33.000Z',
    dateEdited: '2022-11-02T21:35:02.000Z',
    description: 'test description update',
    name: 'Mock DNS Server 2',
    author: 'michelle.gabele@bylight.com',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/range/range-dns-servers`;

export const rangeDnsServer = [
  // GET list
  http.get(baseUrl, ({ request, params, cookies }) => {
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
  }),

  // GET specific
  http.get(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
