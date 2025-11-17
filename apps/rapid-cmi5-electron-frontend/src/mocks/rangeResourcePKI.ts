/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'range-pkis';
const list = [
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews range PKIer',
    description: 'mock description \non multiple lines',
    uuid: '222',
    certificates: {
      usages: ['string'],
      expiry: '720h',
    },
    intermediate: {
      expiry: '720h',
    },
    hosts: ['string.com'],
    names: [
      {
        c: 'US',
        sT: 'string',
        l: 'string',
        o: 'string',
        oU: 'string',
      },
    ],
    key: {
      algo: 'rsa',
      size: 2048,
    },
    cN: 'string',
    parentCAHost: '',
    keyPairData: {
      publicKey: 'string',
      privateKey: 'string',
    },
    bundleProfile: 'string',
    ready: true,
    status: 'reconcilesuccess',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews second range PKI',
    uuid: '222',
    ready: true,
    status: 'reconcilesuccess',
  },
  {
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-10-27T16:17:31.000Z',
    dateEdited: '2022-10-27T16:17:31.175Z',
    name: 'Mock andrews second range PKI',
    uuid: '333',
    ready: true,
    status: 'Deleting',
  },
];

export const rangeResourcePKI = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}`,
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
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
