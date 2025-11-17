/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockRange2Id = '22345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'hardware-devices/network';
const list = [
  {
    uuid: '222',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    description: '',
    metadata: {},
    deviceId: 'Device222',
    nodeName: 'MOCK ip-172-16-4-159.ec2.internal',
    interfaceName: 'eth0',
  },
  {
    uuid: '223',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    description: '',
    metadata: {},
    deviceId: 'Device223',
    nodeName: 'MOCK ip-172-16-4-174.ec2.internal',
    interfaceName: 'eth0',
  },
];

const list2 = [
  {
    uuid: '224',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    description: '',
    metadata: {},
    deviceId: 'Device224',
    nodeName: 'MOCK r2-172-16-4-159.ec2.internal',
    interfaceName: 'eth0',
  },
  {
    uuid: '225',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    description: '',
    metadata: {},
    deviceId: 'Device225',
    nodeName: 'MOCK r2-172-16-4-174.ec2.internal',
    interfaceName: 'eth0',
  },
];

export const hardwareDevice = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${apiTopic}`,
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
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRange2Id}/${apiTopic}`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(list.length / +limit);
        return HttpResponse.json(
          {
            totalCount: list2.length,
            totalPages: totalPages,
            data: list2,
          },
          { status: 200 },
        );
      } else {
        return HttpResponse.json(
          {
            totalCount: list2.length,
            totalPages: 1,
            data: list2,
          },
          { status: 200 },
        );
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${apiTopic}/223`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
