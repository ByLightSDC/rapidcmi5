/* Handlers for /volumes endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 1',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    filename: 'volume-1.tar',
    size: 100,
    volumeType: 'static_web',
    name: 'Mock Volume 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    description: 'Describe volume 2',
    dateCreated: '2022-08-31T17:45:33.017Z',
    dateEdited: '2022-08-31T17:45:33.017Z',
    filename: 'volume-2.tar',
    size: 100,
    volumeType: 'ssh',
    name: 'Mock Volume 2',
    uuid: '77745678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/assets`;

export const volume = [
  // GET list
  http.get(`${baseUrl}/volumes`, ({ request, params, cookies }) => {
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
    `${baseUrl}/volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/volumes/77745678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/volumes`, ({ request, params, cookies }) => {
    return HttpResponse.json(
      {
        author: 'striar.yunis@bylight.com',
        description: 'Describe volume 1',
        dateCreated: '2022-08-31T17:45:33.017Z',
        dateEdited: '2022-08-31T17:45:33.017Z',
        size: 100,
        volumeType: 'ftp',
        name: 'Mock Volume 3',
        uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      { status: 200 },
    );
    // ctx.json({
    //   status: 400,
    //   statusText: '',
    //   message: 'Some Error Detail',
    // })
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          description: 'Describe volume 1',
          dateCreated: '2022-08-31T17:45:33.017Z',
          dateEdited: '2022-08-31T17:45:33.017Z',
          size: 100,
          volumeType: 'static_web',
          name: 'My Volume',
          uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        },
        { status: 200 },
      );
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/volumes/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
