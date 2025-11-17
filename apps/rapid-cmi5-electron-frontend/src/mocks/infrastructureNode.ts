/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockRange2Id = '22345679-6fb7-4997-8f3c-70f0a335d5a3';

const topic = 'nodes';

const list = [
  {
    name: 'MOCK ip-172-16-4-124.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK ip-172-16-4-159.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: true,
        deviceId: 'Device222',
      },
    ],
  },
  {
    name: 'MOCK ip-172-16-4-160.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK ip-172-16-4-174.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
        deviceId: 'Device2232',
      },
    ],
  },
  {
    name: 'MOCK ip-172-16-4-181.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
      },
    ],
  },
  {
    name: 'MOCK ip-172-16-4-186.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK ip-172-16-4-21.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
      },
    ],
  },
];

const list2 = [
  {
    name: 'MOCK r2-172-16-4-124.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK r2-172-16-4-159.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: true,
        deviceId: 'Device224',
      },
    ],
  },
  {
    name: 'MOCK r2-172-16-4-160.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK r2-172-16-4-174.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
        deviceId: 'Device225',
      },
    ],
  },
  {
    name: 'MOCK r2-172-16-4-181.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
      },
    ],
  },
  {
    name: 'MOCK r2-172-16-4-186.ec2.internal',
    interfaces: [],
  },
  {
    name: 'MOCK r2-172-16-4-21.ec2.internal',
    interfaces: [
      {
        name: 'eth0',
        inUse: false,
      },
    ],
  },
];

const baseUrl = `${config.DEVOPS_API_URL}/v1/manage/range`;

export const infrastructureNode = [
  // GET list
  http.get(
    `${baseUrl}/${mockRangeId}/${topic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);

      return HttpResponse.json(list, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockRange2Id}/${topic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);

      return HttpResponse.json(list2, { status: 200 });
    },
  ),
];
