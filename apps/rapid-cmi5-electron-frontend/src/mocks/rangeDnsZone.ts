/* Handlers for /range-dns-zones endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'mock1.com',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'my description',
    ttl: 86400,
    masterNs: 'ns.icann.org',
    email: 'john.doe@example.com',
    serial: 2020080302,
    refresh: 0,
    retry: 0,
    expire: 0,
    minimumTTL: 0,
    tagSelectors: ['tag-a', 'tag-b'],
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'mock2.com',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'my description',
    ttl: 86400,
    masterNs: 'ns.icann.org',
    email: 'john.doe@example.com',
    serial: 2020080302,
    refresh: 0,
    retry: 0,
    expire: 0,
    minimumTTL: 0,
    tagSelectors: [],
  },
];

const single = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  name: 'mock1.com',
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  description: 'my description',
  ttl: 86400,
  masterNs: 'ns.icann.org',
  email: 'john.doe@example.com',
  serial: 2020080302,
  refresh: 0,
  retry: 0,
  expire: 0,
  minimumTTL: 0,
  tagSelectors: ['tag-a', 'tag-b'],
};

const scenarioValidationZones = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'test-dns-zone1',
    uuid: 'f2ff12b2-968b-4686-b477-af8a392e305d',
    description: 'my description',
    ttl: 86400,
    masterNs: 'ns.icann.org',
    email: 'john.doe@example.com',
    serial: 2020080302,
    refresh: 0,
    retry: 0,
    expire: 0,
    minimumTTL: 0,
    tagSelectors: [],
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'test-dns-zone2',
    uuid: '8f877bb3-48e1-4ead-ac23-e25d988a42ab',
    description: 'my description',
    ttl: 86400,
    masterNs: 'ns.icann.org',
    email: 'john.doe@example.com',
    serial: 2020080302,
    refresh: 0,
    retry: 0,
    expire: 0,
    minimumTTL: 0,
    tagSelectors: ['tag-z'],
  },
];

const rangeDnsZonePath = '/v1/content/range/range-dns-zones';
export const rangeDnsZone = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}`,
    ({ request, params, cookies }) => {
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
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.133Z',
          name: 'mock2.com',
          uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          description: 'my description',
          ttl: 86400,
          masterNs: 'ns.icann.org',
          email: 'john.doe@example.com',
          serial: 2020080302,
          refresh: 0,
          retry: 0,
          expire: 0,
          minimumTTL: 0,
          tagSelectors: [],
        },
        { status: 200 },
      );
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/f2ff12b2-968b-4686-b477-af8a392e305d`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationZones[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/8f877bb3-48e1-4ead-ac23-e25d988a42ab`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationZones[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}${rangeDnsZonePath}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
