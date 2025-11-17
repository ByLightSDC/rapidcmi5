/* Handlers for traffic-tracker endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'traffic-trackers';

const list = [
  {
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Traffic Tracker',
    description: 'Mock Description',
    networkOverrides: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    captures: [],
    streams: [
      {
        streamName: 'stream1',
        streamDescription: '',
        captures: [
          '12345660-6fb7-4997-8f3c-70f0a335d5a3',
          '22345660-6fb7-4997-8f3c-70f0a335d5a3',
        ],
      },
    ],
    scenarioGroups: [],
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    author: 'sample.user@bylight.com',
  },
  {
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Traffic Tracker 2',
    description: 'Mock Description',
    networkOverrides: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    captures: [],
    streams: [
      {
        streamName: 'stream a',
        streamDescription: '',
        captures: ['12345660-6fb7-4997-8f3c-70f0a335d5a3'],
      },
    ],
    scenarioGroups: [],
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    author: 'sample.user@bylight.com',
  },
];

const updated = {
  ...list[0],
  name: 'Mock Traffic Tracker Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const trafficTracker = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
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
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
