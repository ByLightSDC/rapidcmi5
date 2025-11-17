/* Handlers for /range-resource-ansible-playbook endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';

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
    dateCreated: '2024-07-12T19:02:00.230Z',
    dateEdited: '2024-07-12T19:02:00.230Z',
    name: 'Mock rangevm-playbook',
    author: 'andres.llausas@bylight.com',
    ready: true,
    status: 'string',
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
    dateCreated: '2024-07-12T19:02:00.230Z',
    dateEdited: '2024-07-12T19:02:00.230Z',
    name: 'Mock rangecontainer-playbook',
    author: 'andres.llausas@bylight.com',
    ready: true,
    status: 'string',
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
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    description: 'testing range container',
    dateCreated: '2024-07-12T19:02:00.230Z',
    dateEdited: '2024-07-12T19:02:00.230Z',
    name: 'Mock deleted playbook',
    author: 'andres.llausas@bylight.com',
    ready: true,
    status: 'Deleting',
  },
];

const topic = 'ansible-playbook';

export const rangeResourceAnsiblePlaybook = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}`,
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
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: 1,
            data: list,
          },
          { status: 200 },
        );
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${topic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
