/* Handlers for /rangeHostNetwork endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'range-host-networks';

const listHostNetworks = [
  {
    deviceId: 'device-1',
    scenarioGroups: [],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-12-09T20:16:07.508Z',
    dateEdited: '2024-12-09T22:37:51.655Z',
    description: '',
    name: 'Mock Host Network1',
    author: 'test.user@testing.com',
    metadata: {},
  },
  {
    deviceId: 'device-2',
    scenarioGroups: [],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-12-09T20:16:07.508Z',
    dateEdited: '2024-12-09T22:37:51.655Z',
    description: '',
    name: 'Mock Host Network2',
    author: 'test.user@testing.com',
    metadata: {},
  },
];

const updatedNetwork = {
  ...listHostNetworks[0],
  name: 'Mock Host Network1 Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeHostNetwork = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listHostNetworks.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listHostNetworks.length,
          totalPages: totalPages,
          data: listHostNetworks,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listHostNetworks.length,
          totalPages: 1,
          data: listHostNetworks,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listHostNetworks[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listHostNetworks[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(listHostNetworks[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updatedNetwork, { status: 200 });
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
