/* Handlers for /DNS Zone tags endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/range`;

const tagsList = ['tag-a', 'tag-b'];

export const rangeDnsZoneTag = [
  // GET specific
  http.get(
    `${baseUrl}/range-dns-zones/tag-selectors`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(tagsList, { status: 200 });
    },
  ),
];
