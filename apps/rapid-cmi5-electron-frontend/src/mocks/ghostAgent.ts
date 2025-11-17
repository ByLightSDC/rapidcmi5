/* Handlers for /ghost-c2-servers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    c2Server: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    profile: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    ghostUser: 'tester',
    ghostPassword: 'password',
    scenarioGroups: [],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2025-01-24T22:43:50.208Z',
    dateEdited: '2025-01-24T22:51:10.196Z',
    description: '',
    name: 'Mock Ghost Agent1',
    author: 'test.user@bylight.com',
    metadata: {
      rangeOsUI: {
        tags: ['test'],
        tagValues: {
          test: 0,
        },
      },
    },
  },
  {
    c2Server: null,
    profile: null,
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    ghostUser: 'tester',
    ghostPassword: 'password',
    scenarioGroups: [],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2025-01-24T22:43:50.208Z',
    dateEdited: '2025-01-24T22:51:10.196Z',
    description: '',
    name: 'Mock Ghost Agent2',
    author: 'test.user@bylight.com',
    metadata: {},
  },
];
const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const ghostAgent = [
  // GET list
  http.get(`${baseUrl}/ghost-agents`, ({ request, params, cookies }) => {
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
    `${baseUrl}/ghost-agents/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/ghost-agents/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/ghost-agents`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/ghost-agents/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/ghost-agents/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
