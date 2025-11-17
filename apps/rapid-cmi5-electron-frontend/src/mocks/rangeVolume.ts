/* Handlers for /range-volumes endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 1',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Range Volume 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '77745678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Range Volume 2',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '77745678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Range Volume 3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '77745678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Mock Range Volume 4',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 5',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 6',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 7',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 8',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 9',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 10',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 11',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    storage: '1Gi',
    volume: '',
    name: 'Mock Range Volume 12',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const emptyList: string[] = [];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeVolume = [
  // GET list
  http.get(`${baseUrl}/range-volumes`, ({ request, params, cookies }) => {
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
      const volumeItems = list.slice(firstItem, lastItem + 1);

      return HttpResponse.json(
        {
          totalCount: list.length,
          totalPages: totalPages,
          data: volumeItems,
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
    `${baseUrl}/range-volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/range-volumes/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/range-volumes`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/range-volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/range-volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
