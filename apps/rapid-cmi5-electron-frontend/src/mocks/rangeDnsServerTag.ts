/* Handlers for /DNS Zone tags endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/range`;

const tagsList = ['tag-a', 'tag-b', 'tag-c'];

export const rangeDnsServerTag = [
  // GET specific
  http.get(
    `${baseUrl}/range-dns-servers/tags`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(tagsList, { status: 200 });
    },
  ),
];
