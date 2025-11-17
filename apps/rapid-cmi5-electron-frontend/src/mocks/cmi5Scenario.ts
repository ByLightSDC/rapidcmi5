/* Handlers for /vmImages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

export const mockClassId = '12345678-6fb7-4997-8f3c-70f0a335d5a3';

const list = [
  {
    author: 'andres.llausas@bylight.com',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    name: 'Scenario 1',
    scenarioGroups: ['blueCell'],
    status: 'Error',
    studentId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    studentUsername: 'Mico',
    assigned: true,
    classId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'andres.llausas@bylight.com',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    name: 'Scenario 2',
    scenarioGroups: ['blueCell'],
    status: 'Ready',
    studentId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    studentUsername: 'Mare',
    assigned: true,
    classId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'andres.llausas@bylight.com',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    name: 'Scenario 3',
    scenarioGroups: ['blueCell'],
    status: 'Ready',
    studentId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    studentUsername: 'Andrew',
    assigned: true,
    classId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'andres.llausas@bylight.com',
    dateCreated: '2023-03-13T20:53:01.000Z',
    dateEdited: '2023-03-13T20:53:01.000Z',
    name: 'Scenario 4',
    scenarioGroups: ['blueCell'],
    status: 'Ready',
    studentId: '',
    studentUsername: '',
    assigned: false,
    classId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CMI_VERSION}`;

export const cmi5Scenario = [
  // GET list
  http.get(
    `${baseUrl}/${mockClassId}/scenarios`,
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

  // DELETE
  http.delete(
    `${baseUrl}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
