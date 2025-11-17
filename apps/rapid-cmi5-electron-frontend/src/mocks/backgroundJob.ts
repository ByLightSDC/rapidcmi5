/* Handlers for /backgroundJob endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/background-jobs`;

const jobList = [
  {
    history: [
      {
        status: 'Queued',
        message: 'Job Added to Queue',
        timestamp: '2024-11-18T18:32:45.470Z',
      },
      {
        status: 'Running',
        message: 'Starting - stop range VM',
        timestamp: '2024-11-18T18:32:47.009Z',
      },
      {
        status: 'Completed',
        message: 'Completed - stop range VM',
        timestamp: '2024-11-18T18:32:48.059Z',
      },
    ],
    uuid: '05446ddd-50a4-4a72-b5f3-17ee14ef0fa4',
    jobId: '2569',
    jobQueue: 'a63a6d46-bdf6-43e3-be23-833e050fdebb',
    attempts: 1,
    maxAttempts: 3,
    state: 'Completed',
    dateCreated: '2024-11-18T18:32:45.470Z',
    dateEdited: '2024-11-18T18:32:48.061Z',
    description: 'Toggle the running state of a range VM',
    name: 'toggleRangeVM',
    author: 'test.user@bylight.com',
    metadata: {},
  },
  {
    history: [
      {
        status: 'Queued',
        message: 'Job Added to Queue',
        timestamp: '2024-11-15T20:30:09.799Z',
      },
      {
        status: 'Running',
        message: 'Starting - deploy scenario',
        timestamp: '2024-11-15T20:30:09.887Z',
      },
      {
        status: 'Completed',
        message: 'Completed - deploy scenario',
        timestamp: '2024-11-15T20:30:11.961Z',
      },
    ],
    uuid: 'e2f25b8b-120c-4bbe-b108-319a833a6574',
    jobId: '2558',
    jobQueue: 'a63a6d46-bdf6-43e3-be23-833e050fdebb',
    attempts: 1,
    maxAttempts: 3,
    state: 'Completed',
    dateCreated: '2024-11-15T20:30:09.799Z',
    dateEdited: '2024-11-15T20:30:11.964Z',
    description: 'Deploy a scenario',
    name: 'deployScenario',
    author: 'test.user@bylight.com',
    metadata: {},
  },
];

export const backgroundJob = [
  // GET LIST
  http.get(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(jobList, { status: 200 });
  }),
];
