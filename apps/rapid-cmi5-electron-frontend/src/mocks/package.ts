/* Handlers for /packages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Package 1',
    containerSpecifications: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeCerts: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeConsoles: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeDNSServers: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeDNSZones: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeDNSRecords: ['5af22713-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeIPs: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeNetworks: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeRouters: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    rangeVolumes: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    vmSpecifications: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '44345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mock Package 2',
    uuid: '66345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const single = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  name: 'Mock Package 1',
  containerSpecifications: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeBGPs: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeBGPLinks: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeCerts: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeConsoles: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeDNSServers: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeDNSZones: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeDNSRecords: ['5af22713-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeIPs: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeNetworks: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangePkis: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeRouters: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeTorNets: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeVolumes: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  vmSpecifications: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  uuid: '44345678-6fb7-4997-8f3c-70f0a335d5a3',
};

const scenarioValidationPackage = {
  name: 'test package',
  containerSpecifications: ['9200d396-a4eb-4191-b2b7-9c4b15425a4a'],
  rangeBGPs: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeBGPLinks: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeCerts: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeConsoles: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeDNSServers: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeDNSZones: ['8f877bb3-48e1-4ead-ac23-e25d988a42ab'],
  rangeDNSRecords: ['5af22713-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeIPs: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeNetworks: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangePkis: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeRouters: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeTorNets: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  rangeVolumes: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  vmSpecifications: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
  uuid: '4967555a-c932-4937-aa3b-83916d67041e',
};

export const packages = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages`,
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
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/44345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/66345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/4967555a-c932-4937-aa3b-83916d67041e`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationPackage, { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.133Z',
          name: 'Mock Package 3',
          uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
        },
        { status: 200 },
      );
    },
  ),

  // POST (deploy)
  http.post(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/44345678-6fb7-4997-8f3c-70f0a335d5a3/deploy`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          rangeContainers: ['string'],
        },
        { status: 200 },
      );
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/44345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          author: 'striar.yunis@bylight.com',
          dateCreated: '2022-11-29T19:39:45.000Z',
          dateEdited: '2022-11-29T19:39:45.133Z',
          name: 'My Package',
          uuid: '44345678-6fb7-4997-8f3c-70f0a335d5a3',
        },
        { status: 200 },
      );
    },
  ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range/packages/44345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
