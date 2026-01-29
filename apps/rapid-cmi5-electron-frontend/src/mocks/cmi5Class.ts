/* Handlers for /vmImages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rapid-cmi5/ui';

const list = [
  {
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Class 1',
    author: 'andres.llausas@bylight.com',
  },
  {
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Class 2',
    author: 'andres.llausas@bylight.com',
  },
  {
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Class 3',
    author: 'andres.llausas@bylight.com',
  },
  {
    uuid: '42345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Class 4',
    author: 'andres.llausas@bylight.com',
  },
  {
    uuid: '52345678-6fb7-4997-8f3c-70f0a335d5a3',
    name: 'Class 5',
    author: 'andres.llausas@bylight.com',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CMI_VERSION}`;

export const cmi5Class = [
  // GET list
  http.get(`${baseUrl}/classes`, ({ request, params, cookies }) => {
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

  // DELETE
  http.delete(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
