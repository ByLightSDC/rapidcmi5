/* Handlers for /container-specifications endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    description: 'a description',
    name: 'Mock Container 1',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    rangeCerts: {
      'Mock Range Cert': '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
    rangeDNSRecords: {
      dnsRecordOne: '5af22713-6fb7-4997-8f3c-70f0a335d5a3',
    },
    rangeIPs: {
      'Mock Range IP 1': '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
    rangeVolumes: { certs: '12345678-6fb7-4997-8f3c-70f0a335d5a3' },
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {
      myBoolean: true,
      myInteger: 5,
      myNumber: 6.2,
      myString: 'abc',
      myEnum: 'orange',
      mySimpleArray: ['blue', 'red', 'yellow'],
    },
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 2',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 3',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 4',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 5',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 6',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 7',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 8',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 9',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Container 10',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    chart: 'mychartname',
    chartVersion: 'myversion',
    values: {},
  },
];

const scenarioValidationContainerSpec = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  description: 'a description',
  name: 'tor browser',
  uuid: '9200d396-a4eb-4191-b2b7-9c4b15425a4a',
  rangeDNSRecords: {
    mx: 'c89b9f2e-3680-4fbc-920d-cd3e097ba185',
    www: 'f150c47d-f124-4e50-8f7b-dd3d52e8b60f',
  },
  chart: 'netshoot',
  chartVersion: 'myversion',
};

export const containerSpec = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications`,
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

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/9200d396-a4eb-4191-b2b7-9c4b15425a4a`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationContainerSpec, {
        status: 200,
      });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.133Z',
          name: 'Mock Container 3',
          uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
          values: {},
        },
        { status: 200 },
      );
    },
  ),

  // POST (deploy)
  http.post(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3/deploy`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          rangeContainer: 'string',
        },
        { status: 200 },
      );
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.000Z',
          name: 'My Container Spec',
          uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          values: {},
        },
        { status: 200 },
      );
    },
  ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/container-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
