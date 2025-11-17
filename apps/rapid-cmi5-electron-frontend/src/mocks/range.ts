/* Handlers for /range endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    bootstrapType: 'aws',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    environment: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    message: '',
    name: 'Mock Range 1 Deployment Really Long Title - AWS',
    specification: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
    status: 'Ready',
    type: 'AWS',
    uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    bootstrapType: 'vsphere',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    message: 'Subresource has an error.',
    name: 'Mock Range 2 Deployment - Vsphere',
    specification: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
    status: 'Error',
    type: 'Vsphere',
    uuid: '22345679-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    bootstrapType: 'vsphere',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    message: 'Subresource has an error.',
    name: 'Mock Range 3 Deployment',
    specification: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
    status: 'Deleting',
    type: 'Vsphere',
    uuid: '32345679-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    bootstrapType: 'vsphere',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    message: '',
    name: 'Mock Range 4 Deployment',
    specification: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
    status: 'Ready',
    type: 'Vsphere',
    uuid: '42345679-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const single = {
  author: 'striar.yunis@bylight.com',
  bootstrapType: 'aws',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.000Z',
  environment: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  name: 'Mock Range 1 Deployment Really Long Title',
  specification: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
  ready: false,
  type: 'AWS',
  uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/manage/infrastructure`;

export const range = [
  // GET LIST
  http.get(`${baseUrl}/ranges`, ({ request, params, cookies }) => {
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
      return HttpResponse.json(
        { totalCount: list.length, data: list },
        { status: 200 },
      );
    }
  }),
  // GET specific
  http.get(
    `${baseUrl}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/ranges/22345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  // POST (create) new range
  http.post(`${baseUrl}/ranges`, ({ request, params, cookies }) => {
    return HttpResponse.json(single, { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.put(
    `${baseUrl}/ranges/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  http.delete(
    `${baseUrl}/ranges/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${baseUrl}/ranges/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${baseUrl}/ranges/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
