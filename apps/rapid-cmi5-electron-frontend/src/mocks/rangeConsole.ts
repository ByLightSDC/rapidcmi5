/* Handlers for /range-console endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const listConsoles = [
  {
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    containerSpecification: null,
    scenarioGroups: ['redCell'],
    usernames: [],
    name: 'Mock ubuntu',
    protocol: 'vnc',
    parameters: {
      consoleAudio: 'false',
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-08T17:36:52.000Z',
    dateEdited: '2023-03-09T15:51:27.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: null,
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '5ec51e2c-8f7a-4d22-b1b0-165d5b799853',
    dateCreated: '2023-03-08T19:55:14.000Z',
    dateEdited: '2023-03-08T19:55:14.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: null,
    containerSpecification: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '7338f288-e430-404c-a917-6d800040e692',
    dateCreated: '2023-03-08T19:39:50.000Z',
    dateEdited: '2023-03-08T19:39:50.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    containerSpecification: null,
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '87b354f0-223b-4a0b-a2a6-7eda979ce31d',
    dateCreated: '2023-03-08T18:00:17.000Z',
    dateEdited: '2023-03-08T18:00:17.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    containerSpecification: null,
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '539c3983-ed52-4e0c-8840-b02365d6f600',
    dateCreated: '2023-03-08T15:41:06.000Z',
    dateEdited: '2023-03-08T15:41:06.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: null,
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: 'e60cdbd0-1233-4cf4-91ab-270cdbd04a29',
    dateCreated: '2023-03-08T15:24:42.000Z',
    dateEdited: '2023-03-08T15:24:42.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: null,
    containerSpecification: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'P@55w0rd!',
      port: '5900',
      username: 'ubuntu',
    },
    uuid: '95ac5191-e01b-41b9-a12b-02a0e60ac1ac',
    dateCreated: '2023-03-08T15:20:16.000Z',
    dateEdited: '2023-03-08T15:20:16.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    containerSpecification: null,
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'admin',
      port: '5900',
      username: 'admin',
    },
    uuid: '2da9c88d-a0e6-4978-b260-ec14ac5e9641',
    dateCreated: '2023-03-08T15:14:18.000Z',
    dateEdited: '2023-03-08T15:14:18.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    containerSpecification: null,
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'admin',
      port: '5900',
      username: 'admin',
    },
    uuid: '06af4a89-9783-431f-b742-88de3d7337d5',
    dateCreated: '2023-03-08T15:13:42.000Z',
    dateEdited: '2023-03-08T15:13:42.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
  {
    vmSpecification: null,
    containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    groups: [],
    usernames: [],
    name: 'ubuntu',
    protocol: 'vnc',
    parameters: {
      password: 'admin',
      port: '5900',
      username: 'admin',
    },
    uuid: '8c73853b-5584-4291-abfd-87384d09181f',
    dateCreated: '2023-03-08T15:12:51.000Z',
    dateEdited: '2023-03-08T15:12:51.000Z',
    description: 'ubuntu',
    author: 'system@pcte.dev',
  },
];

const updatedConsole = {
  ...listConsoles[0],
  name: 'Mock Console Updated',
};
const mockTopic = 'range-consoles';
const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeConsole = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listConsoles.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listConsoles.length,
          totalPages: totalPages,
          data: listConsoles,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listConsoles.length,
          totalPages: 1,
          data: listConsoles,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listConsoles[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockTopic}/5ec51e2c-8f7a-4d22-b1b0-165d5b799853`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listConsoles[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(listConsoles[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updatedConsole, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
