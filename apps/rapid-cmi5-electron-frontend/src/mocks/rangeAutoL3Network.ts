/* Handlers for /range-auto-l3-networks endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'range-auto-l3-networks';

const listAutoL3Networks = [
  {
    cidr: '192.0.2.146/24',
    latitude: '5',
    longitude: '5',
    defaultGateway: '192.0.2.140',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    description: 'TestDescr',
    name: 'Mock Auto IP Subnet',
    author: 'michelle.gabele@bylight.com',
  },
  {
    cidr: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2222/64',
    latitude: '5',
    longitude: '5',
    defaultGateway: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2223',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    description: 'TestDescr',
    name: 'Mock Auto IP Subnet',
    author: 'michelle.gabele@bylight.com',
  },
];

const updatedAutoL3Network = {
  ...listAutoL3Networks[0],
  name: 'Mock Auto IP Subnet Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeAutoL3Network = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listAutoL3Networks.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listAutoL3Networks.length,
          totalPages: totalPages,
          data: listAutoL3Networks,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listAutoL3Networks.length,
          totalPages: 1,
          data: listAutoL3Networks,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listAutoL3Networks[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listAutoL3Networks[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(listAutoL3Networks[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updatedAutoL3Network, { status: 200 });
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
