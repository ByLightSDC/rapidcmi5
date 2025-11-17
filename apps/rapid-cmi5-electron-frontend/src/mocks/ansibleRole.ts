/* Handlers for /vmImages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    systemCpeUuids: [
      '12345679-6fb7-4997-8f3c-70f0a335d5a3',
      '78c484f6-cd29-4da4-a1c4-c6cbf0766898',
    ],
    filename: 'temp-pod.tar',
    size: 10240,
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-19T15:15:22.149Z',
    dateEdited: '2024-03-19T15:15:22.149Z',
    description: 'testing',
    roleVariablesSchema: {
      $schema: 'http://json-schema.org/schema#',
      type: 'object',
      properties: { process_command: { type: 'string' } },
      required: ['process_command'],
    },
    name: 'MS Office (Mock 1)',
    author: 'andres.llausas@bylight.com',
  },
  {
    systemCpeUuids: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    filename: 'temp-pod.tar',
    size: 10240,
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-19T15:15:22.149Z',
    dateEdited: '2024-03-19T15:15:22.149Z',
    description: 'testing',
    roleVariablesSchema: {},
    name: 'Join AS (Mock 2)',
    author: 'andres.llausas@bylight.com',
  },
  {
    systemCpeUuids: [
      '12345679-6fb7-4997-8f3c-70f0a335d5a3',
      '78c484f6-cd29-4da4-a1c4-c6cbf0766898',
    ],
    filename: 'temp-pod.tar',
    size: 10240,
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-03-19T15:15:22.149Z',
    dateEdited: '2024-03-19T15:15:22.149Z',
    description: 'testing',
    roleVariablesSchema: {
      $schema: 'http://json-schema.org/schema#',
      type: 'object',
      properties: { process_command: { type: 'string' } },
    },
    name: 'Mock 3 - Variables Not Required',
    author: 'andres.llausas@bylight.com',
  },
];

const updated = {
  ...list[0],
  name: 'Mock 1 updated',
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/provisioning-service/ansible-role`;

export const ansibleRole = [
  // GET list
  http.get(`${baseUrl}`, ({ request, params, cookies }) => {
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
  // also used for Ansible Role Test
  http.get(`${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`, () => {
    return HttpResponse.json(list[0], { status: 200 });
  }),
  http.get(`${baseUrl}/22345678-6fb7-4997-8f3c-70f0a335d5a3`, () => {
    return HttpResponse.json(list[1], { status: 200 });
  }),
  http.get(`${baseUrl}/32345678-6fb7-4997-8f3c-70f0a335d5a3`, () => {
    return HttpResponse.json(list[2], { status: 200 });
  }),

  // POST (create)
  http.post(`${baseUrl}`, () => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(`${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`, () => {
    return HttpResponse.json(updated, { status: 200 });
  }),

  // DELETE
  http.delete(`${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];
