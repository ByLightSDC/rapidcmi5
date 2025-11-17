/* Handlers for /ghost-traffic-profile endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    traffic: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.606Z',
    dateEdited: '2024-03-13T18:13:24.606Z',
    description: '',
    name: 'Mock ghost-profile-1',
    author: 'andrew.thigpen@bylight.com',
  },
  {
    traffic: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-13T18:13:24.606Z',
    dateEdited: '2024-03-13T18:13:24.606Z',
    description: '',
    name: 'Mock ghost-profile-2',
    author: 'andrew.thigpen@bylight.com',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const ghostTrafficProfile = [
  // GET list
  http.get(
    `${baseUrl}/ghost-traffic-profile`,
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
    `${baseUrl}/ghost-traffic-profile/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/ghost-traffic-profile/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${baseUrl}/ghost-traffic-profile`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${baseUrl}/ghost-traffic-profile/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/ghost-traffic-profile/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
