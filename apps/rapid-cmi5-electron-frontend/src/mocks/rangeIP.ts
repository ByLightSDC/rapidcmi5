/* Handlers for /range-ips endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'my description',
    address: '192.0.2.148',
    latitude: null,
    longitude: null,
    countryCode: null,
    dnsServers: [],
    rangeL3Network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    controlNet: false,
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 2',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'my description',
    address: 'AAAA:BBBB:CCCC:DDDD:EEEE:FFFF:1111:2224',
    latitude: null,
    longitude: null,
    countryCode: null,
    dnsServers: [],
    rangeL3Network: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    controlNet: false,
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 3',
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'my description',
    address: null,
    latitude: null,
    longitude: null,
    countryCode: 'US',
    dnsServers: [],
    rangeL3Network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    controlNet: false,
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Range IP 4',
    uuid: '444',
    description: 'my description',
    address: null,
    latitude: null,
    longitude: null,
    countryCode: null,
    controlNet: false,
    dnsServers: [],
    rangeL3Network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeIP = [
  // GET list
  http.get(`${baseUrl}/range-ips`, ({ request, params, cookies }) => {
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
    `${baseUrl}/range-ips/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/range-ips/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/range-ips/32345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[2], { status: 200 });
    },
  ),
  http.get(`${baseUrl}/range-ips/444`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[3], { status: 200 });
  }),

  // POST (create)
  http.post(`${baseUrl}/range-ips`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/range-ips/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/range-ips/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
