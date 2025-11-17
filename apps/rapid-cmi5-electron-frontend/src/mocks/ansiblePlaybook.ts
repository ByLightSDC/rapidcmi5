/* Handlers for /vmImages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    roleDetails: [
      {
        roleVariables: {
          process_command: 'ps aux',
        },
        ansibleRole: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    ],
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'testing rangevm',
    name: 'Mock rangevm-playbook',
    author: 'andres.llausas@bylight.com',
  },
  {
    roleDetails: [
      {
        roleVariables: {
          process_command: 'ps aux',
        },
        ansibleRole: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    ],
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'testing range container',
    name: 'Mock rangecontainer-playbook',
    author: 'andres.llausas@bylight.com',
  },
];

const updated = {
  ...list[0],
  name: 'Mock 1 updated',
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/provisioning-service/ansible-playbook`;

export const ansiblePlaybook = [
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
  // also used for Ansible Playbook Test
  http.get(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(list[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
