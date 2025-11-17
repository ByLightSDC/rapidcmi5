/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/design`;
const portMirrorTest = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

const listDrafts = [
  {
    uuid: portMirrorTest,
    dateCreated: '2024-09-24T15:47:20.697Z',
    dateEdited: '2024-11-12T21:56:15.160Z',
    description: 'ROS Core individual training labs',
    name: 'Mock Draft',
    author: 'gary.morton@bylight.com',
    metadata: {
      rangeOsUI: {},
    },
  },
  {
    uuid: 'b968c096-605d-4557-b129-23aedfa4c0da',
    dateCreated: '2024-09-24T15:52:27.840Z',
    dateEdited: '2024-11-12T21:55:49.660Z',
    description: 'ROS Core individual training labs',
    name: 'ROS Core Examining Website Vulnerabilities Lab',
    author: 'gary.morton@bylight.com',
    metadata: {
      rangeOsUI: {},
    },
  },
  {
    uuid: 'f002ba9d-a485-49c5-9a29-4e75d4053279',
    dateCreated: '2024-09-24T21:35:24.176Z',
    dateEdited: '2024-11-12T21:55:21.734Z',
    description: 'ROS Core individual training labs',
    name: 'ROS Core Enforcing Audit Policies Lab',
    author: 'gary.morton@bylight.com',
    metadata: {
      rangeOsUI: {},
    },
  },
  {
    uuid: 'baf589fd-96f4-473b-b852-d7129424fc8b',
    dateCreated: '2024-09-24T22:19:09.684Z',
    dateEdited: '2024-11-12T21:54:58.808Z',
    description: 'ROS Core individual training labs',
    name: 'ROS Core Cracking Passwords Lab',
    author: 'gary.morton@bylight.com',
    metadata: {
      rangeOsUI: {},
    },
  },
  {
    uuid: 'b084ff56-4ee0-45b3-97db-1fc243459499',
    dateCreated: '2024-09-24T22:22:45.732Z',
    dateEdited: '2024-11-12T21:54:32.904Z',
    description: 'ROS Core individual training labs',
    name: 'ROS Core Examining PKI Certificates Lab',
    author: 'gary.morton@bylight.com',
    metadata: {
      rangeOsUI: {},
    },
  },
];

const updated = {
  ...listDrafts[0],
  name: 'Mock Draft Updated',
};

export const draft = [
  // GET list
  http.get(`${baseUrl}/drafts`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listDrafts.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listDrafts.length,
          totalPages: totalPages,
          data: listDrafts,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listDrafts.length,
          totalPages: 1,
          data: listDrafts,
        },
        { status: 200 },
      );
    }
  }),

  // GET states
  http.get(
    `${baseUrl}/drafts/${portMirrorTest}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listDrafts[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/drafts/${portMirrorTest}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listDrafts[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/drafts`, ({ request, params, cookies }) => {
    return HttpResponse.json(listDrafts[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/drafts/${portMirrorTest}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/drafts/${portMirrorTest}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
