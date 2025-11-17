/* Handlers for /environment-credentials/rancher endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    accessKey: 'accessKey',
    author: 'test.user@workplace.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    description: 'Mock Description',
    name: 'Mock Rancher Environment Credential 1',
    secretKey: 'secretKey',
    tokenKey: 'tokenKey',
    url: 'https://rancher.dev.local',
    timeout: 100,
    insecureTls: true,
    caCerts: 'rancher CA certificates',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    accessKey: 'accessKey',
    author: 'test.user@workplace.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    description: 'Mock Description - optional fields not defined',
    name: 'Mock Environment Credential 2',
    secretKey: 'secretKey',
    url: 'https://rancher.dev.local',
    insecureTls: false,
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const updated = {
  accessKey: 'accessKey',
  author: 'test.user@workplace.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  description: 'Mock Description',
  name: 'Mock Rancher Environment Credential Updated',
  secretKey: 'secretKey',
  tokenKey: 'tokenKey',
  url: 'https://rancher.dev.local',
  timeout: 100,
  insecureTls: true,
  caCerts: 'rancher CA certificates',
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/infrastructure`;

export const environmentRancherCredential = [
  // GET LIST
  http.get(
    `${baseUrl}/environment-credentials/rancher`,
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

  // GET specific environment credential
  http.get(
    `${baseUrl}/environment-credentials/rancher/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/environment-credentials/rancher/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create) new environment credential
  http.post(
    `${baseUrl}/environment-credentials/rancher`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          accessKey: 'accessKey',
          author: 'test.user@workplace.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.133Z',
          description: 'Mock Description',
          name: 'Mock Rancher Environment Credential 3',
          secretKey: 'secretKey',
          tokenKey: 'tokenKey',
          url: 'https://rancher.dev.local',
          timeout: 100,
          insecureTls: true,
          caCerts: 'rancher CA certificates',
          uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
        },
        { status: 200 },
      );
    },
  ),

  // PUT (update) specific environment credential
  http.put(
    `${baseUrl}/environment-credentials/rancher/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE specific environment credential
  http.delete(
    `${baseUrl}/environment-credentials/rancher/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
