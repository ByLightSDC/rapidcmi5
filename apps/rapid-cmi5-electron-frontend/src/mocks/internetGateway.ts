/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'internet-gateways';

const listInternetGateways = [
  {
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    description: 'TestDescr',
    labels: { 'bylight.com/networkType': 'internet' },
    rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Internet Gateway',
    author: 'michelle.gabele@bylight.com',
  },
  {
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    description: 'TestDescr',
    labels: { 'bylight.com/networkType': 'internet' },
    rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Internet Gateway 2',
    author: 'michelle.gabele@bylight.com',
  },
];

const updatedNetwork = {
  ...listInternetGateways[0],
  name: 'Mock Internet Gateway Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const internetGateway = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listInternetGateways.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listInternetGateways.length,
          totalPages: totalPages,
          data: listInternetGateways,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listInternetGateways.length,
          totalPages: 1,
          data: listInternetGateways,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listInternetGateways[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listInternetGateways[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(listInternetGateways[0], { status: 200 });
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
