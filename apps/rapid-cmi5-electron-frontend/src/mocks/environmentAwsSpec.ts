/* Handlers for /environment-specifications/aws endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    description: 'Mock Description',
    name: 'Mock Environment 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    description: 'Mock Description',
    name: 'Mock Environment 2',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-2b',
    awsRegion: 'us-east-2',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 3',
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 4',
    uuid: '42345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 5',
    uuid: '52345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
    ami: 'ami-09e3a617f9c98397d',
    dnsZoneID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 6',
    uuid: '62345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 7',
    uuid: '72345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 8',
    uuid: '82345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.000Z',
    name: 'Mock Environment 9',
    uuid: '92345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 10',
    uuid: '10345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 11',
    uuid: '11345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 12',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Environment 13',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
];

const updated = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  name: 'My Environment',
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  awsAvailabilityZone: 'us-east-1a',
  awsRegion: 'us-east-1',
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/infrastructure`;

export const environmentAwsSpec = [
  // GET LIST
  http.get(
    `${baseUrl}/environment-specifications/aws`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(list.length / +limit);
        //mock paging
        const firstItem = +offset;
        const lastItem = Math.min(
          firstItem + +limit - 1,
          list.length ? list.length - 1 : 0,
        );
        const environmentItems = list.slice(firstItem, lastItem + 1);
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: totalPages,
            data: environmentItems,
          },
          { status: 200 },
        );
      } else {
        // return full list
        return HttpResponse.json(list, { status: 200 });
      }
    },
  ),

  // GET specific environment spec
  http.get(
    `${baseUrl}/environment-specifications/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/environment-specifications/aws/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/environment-specifications/aws/11345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[10], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/environment-specifications/aws/12345678-6fb7-4997-8f3c-70f0a335d5a4`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[11], { status: 200 });
    },
  ),

  // POST (create) new environment spec
  http.post(
    `${baseUrl}/environment-specifications/aws`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[2], { status: 200 });
    },
  ),

  // PUT (update) specific environment spec
  http.put(
    `${baseUrl}/environment-specifications/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),
  http.put(
    `${baseUrl}/environment-specifications/aws/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE specific environment spec
  http.delete(
    `${baseUrl}/environment-specifications/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
