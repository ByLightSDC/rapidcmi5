/* Handlers for /ghost-traffic endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.436Z',
    dateEdited: '2024-03-13T18:13:24.436Z',
    description: '',
    name: 'mock-ghost-traffic-browser',
    author: 'andrew.thigpen@bylight.com',
    type: {
      browserType: 'chrome',
      events: [
        {
          sites: [
            'example.com',
            'www.example.com',
            'bylight.com',
            'www.bylight.com',
          ],
          type: 'random',
          delayAfter: 10000,
        },
      ],
      handler: 'browser',
      timeStart: '00:00:00',
      timeEnd: '23:59:59',
      loop: true,
    },
  },
  {
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.436Z',
    dateEdited: '2024-03-13T18:13:24.436Z',
    description: '',
    name: 'mock-ghost-traffic-curl',
    author: 'andrew.thigpen@bylight.com',
    type: {
      commands: [
        {
          delayBefore: 0,
          delayAfter: 2000,
          command: 'curl https://example.com --insecure',
        },
      ],
      handler: 'curl',
      timeStart: '00:00:00',
      timeEnd: '02:30:00',
      loop: false,
    },
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const ghostTraffic = [
  // GET list
  http.get(`${baseUrl}/ghost-traffic`, ({ request, params, cookies }) => {
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
    `${baseUrl}/ghost-traffic/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/ghost-traffic/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/ghost-traffic`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/ghost-traffic/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/ghost-traffic/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
