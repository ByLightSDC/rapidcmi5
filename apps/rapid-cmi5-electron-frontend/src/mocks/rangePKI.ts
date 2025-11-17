/* Handlers for range-pki endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'range-pkis';

const list = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock PKI',
    description: 'Mock Description',
    certificates: { usages: ['oneusage'], expiry: '720h' },
    intermediate: { expiry: '1440h' },
    hosts: ['host.com'],
    names: [{ c: 'US', l: 'aL', o: 'aO', oU: 'aOU', sT: 'aST' }],
    key: { algo: 'rsa', size: 2048 },
    cN: '',
    parentCAHost: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    keyPairData: { publicKey: 'aKey', privateKey: 'anotherKey' },
    bundleProfile: 'aBundleProfile',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock PKI 2',
    description: 'Mock Description',
    certificates: { usages: ['oneusage'], expiry: '720h' },
    intermediate: { expiry: '1440h' },
    hosts: ['host.com'],
    names: [{ c: 'US', l: 'aL', o: 'aO', oU: 'aOU', sT: 'aST' }],
    key: { algo: 'rsa', size: 2048 },
    cN: '',
    parentCAHost: '',
    keyPairData: { publicKey: 'aKey', privateKey: 'anotherKey' },
    bundleProfile: 'aBundleProfile',
  },
];

const updated = {
  ...list[0],
  name: 'Mock PKI Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangePKI = [
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
  http.get(
    `${baseUrl}/${mockTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
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
