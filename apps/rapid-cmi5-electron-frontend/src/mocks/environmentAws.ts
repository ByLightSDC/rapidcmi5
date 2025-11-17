/* Handlers for /environments/aws endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const environmentList = [
  {
    author: 'striar.yunis@bylight.com',
    environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-11-22T17:31:00.000Z',
    dateEdited: '2022-11-22T17:31:01.459Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 1',
    status: 'Ready',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    environmentSpec: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: 'Subresource has an error.',
    name: 'Mock Environment 2',
    status: 'Error',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-2b',
    awsRegion: 'us-east-2',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 3',
    environmentSpec: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 4',
    environmentSpec: '42345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '42345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 5',
    environmentSpec: '52345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '52345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 6',
    environmentSpec: '62345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '62345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 7',
    environmentSpec: '72345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '72345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 8',
    environmentSpec: '82345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '82345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 9',
    environmentSpec: '92345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '92345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 10',
    environmentSpec: '10345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '10345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 11',
    environmentSpec: '11345678-6fb7-4997-8f3c-70f0a335d5a3',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '11345678-6fb7-4997-8f3c-70f0a335d5a3',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 12',
    environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-09-02T22:00:18.000Z',
    dateEdited: '2022-09-02T22:00:18.290Z',
    description: 'Mock Description',
    message: '',
    name: 'Mock Environment 13',
    environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
    awsAvailabilityZone: 'us-east-1a',
    awsRegion: 'us-east-1',
  },
];

const baseUrl = `${config.DEVOPS_API_URL}/v1/manage/infrastructure`;

export const environmentAws = [
  // GET LIST
  http.get(`${baseUrl}/environments/aws`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(environmentList.length / +limit);
      //mock paging
      const firstItem = +offset;
      const lastItem = Math.min(
        firstItem + +limit - 1,
        environmentList.length ? environmentList.length - 1 : 0,
      );
      const environmentItems = environmentList.slice(firstItem, lastItem + 1);
      return HttpResponse.json(
        {
          totalCount: environmentList.length,
          totalPages: totalPages,
          data: environmentItems,
        },
        { status: 200 },
      );
    } else {
      // return full list
      return HttpResponse.json(environmentList, { status: 200 });
    }
  }),

  // GET specific environment
  http.get(
    `${baseUrl}/environments/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'Mock Environment 1',
          uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          awsAvailabilityZone: 'us-east-1a',
          awsRegion: 'us-east-1',
        },
        { status: 200 },
      );
    },
  ),
  http.get(
    `${baseUrl}/environments/aws/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          environmentSpec: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          environmentCredentials: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'Mock Environment 2',
          uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          awsAvailabilityZone: 'us-east-2b',
          awsRegion: 'us-east-2',
        },
        { status: 200 },
      );
    },
  ),
  http.get(
    `${baseUrl}/environments/aws/11345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'Mock Environment 11',
          environmentSpec: '11345678-6fb7-4997-8f3c-70f0a335d5a3',
          environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          uuid: '11345678-6fb7-4997-8f3c-70f0a335d5a3',
          awsAvailabilityZone: 'us-east-1a',
          awsRegion: 'us-east-1',
        },
        { status: 200 },
      );
    },
  ),
  http.get(
    `${baseUrl}/environments/aws/12345678-6fb7-4997-8f3c-70f0a335d5a4`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'Mock Environment 12',
          environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
          environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a4',
          awsAvailabilityZone: 'us-east-1a',
          awsRegion: 'us-east-1',
        },
        { status: 200 },
      );
    },
  ),

  // POST (create) new environment
  http.post(`${baseUrl}/environments/aws`, ({ request, params, cookies }) => {
    return HttpResponse.json(
      {
        author: 'striar.yunis@bylight.com',
        environmentSpec: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
        environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        dateCreated: '2022-09-02T22:00:18.000Z',
        dateEdited: '2022-09-02T22:00:18.000Z',
        name: 'Mock Environment 1 deployment',
        uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
        awsAvailabilityZone: 'us-east-1a',
        awsRegion: 'us-east-1',
      },
      { status: 200 },
    );
  }),

  // PUT (update) specific environment
  http.put(
    `${baseUrl}/environments/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          environmentSpec: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'My Environment',
          uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          awsAvailabilityZone: 'us-east-1a',
          awsRegion: 'us-east-1',
        },
        { status: 200 },
      );
    },
  ),
  http.put(
    `${baseUrl}/environments/aws/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          environmentSpec: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          environmentCredentials: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          dateCreated: '2022-09-02T22:00:18.000Z',
          dateEdited: '2022-09-02T22:00:18.000Z',
          name: 'Mock Environment 2',
          uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
          awsAvailabilityZone: 'us-east-2b',
          awsRegion: 'us-east-2',
        },
        { status: 200 },
      );
    },
  ),

  // DELETE specific environment
  http.delete(
    `${baseUrl}/environments/aws/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${baseUrl}/environments/aws/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
