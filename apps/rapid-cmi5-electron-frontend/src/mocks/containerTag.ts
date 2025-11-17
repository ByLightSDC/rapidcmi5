/* Handlers for /containers-tags endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockContainerTags = ['1.23.1', 'latest'];

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;

export const containerTag = [
  // GET Tags
  // NOTE: data mocked for when name is "mocked"
  //       otherwise just pass back empty list
  http.get(
    `${baseUrl}/containers/mocked/tags`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(mockContainerTags, { status: 200 });
    },
  ),
  http.get(`${baseUrl}/containers/*/tags`, ({ request, params, cookies }) => {
    return HttpResponse.json([], { status: 200 });
  }),

  // DELETE
  http.delete(
    `${baseUrl}/containers/*/tags/1.23.1`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
