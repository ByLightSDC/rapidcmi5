/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

export const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockSecondRangeId = '22345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockFourthRangeId = '42345679-6fb7-4997-8f3c-70f0a335d5a3';
export const mockParentScenarioId = '12345678-6fb7-4997-8f3c-70f0a335d5a3';
export const mockScenarioId = '11145679-6fb7-4997-8f3c-70f0a335d5a3';
export const mockScenarioId2 = '22245679-6fb7-4997-8f3c-70f0a335d5a3';

const singleRangeScenario = {
  scenarioId: mockParentScenarioId,
  uuid: mockScenarioId,
  description: 'andrews test scenario',
  name: 'mock andrews test scenario',
  author: 'andrew.thigpen@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.133Z',
  status: 'Ready',
};

const listScenarios = [
  {
    scenarioId: mockParentScenarioId,
    uuid: mockScenarioId,
    description: 'mock andrews test scenario',
    name: 'mock andrews test scenario',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Ready',
  },
  {
    scenarioId: mockParentScenarioId,
    uuid: mockScenarioId2,
    description: 'mock michelles test scenario',
    name: 'mock michelles test scenario',
    author: 'michelle.gabele@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Ready',
  },
];

const listScenarios2 = [
  {
    scenarioId: mockParentScenarioId,
    uuid: '333',
    description: 'mock mares test scenario',
    name: 'mock mares test scenario',
    author: 'andrew.thigpen@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Ready',
  },
  {
    scenarioId: mockParentScenarioId,
    uuid: '444',
    description: 'mock mikes test scenario',
    name: 'mock mikes test scenario',
    author: 'michelle.gabele@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    status: 'Deleting',
  },
];

const scenarioOverrides = {
  containerSpecifications: {
    '222': {
      values: {
        Devdocs: {
          ssl: 'aaa',
          port: 'bbb',
        },
      },
      chart: 'mychartname',
      chartVersion: 'mock version2',
      ips: {
        ip1: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      dns: {
        'dns record 1': '5af22713-6fb7-4997-8f3c-70f0a335d5a3',
        'dns record 2': '4af22713-6fb7-4997-8f3c-70f0a335d5a3',
      },
      certs: {
        cert1: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
    },
  },
  rangeBGPs: {
    '222': {
      asn: 5,
      rangeRouters: ['12345678-6fb7-4997-8f3c-70f0a335d5a3'],
    },
  },
  rangeBGPLinks: {
    '111': { node1ASN: 1234, node2ASN: 4321 },
    '222': {},
  },
  rangeCerts: {
    '222': {
      key: {
        algo: 'ecdsa',
        size: 256,
      },
      cn: 'dd',
      hosts: ['mico.com'],
      certSubjects: [
        {
          c: 'US',
          sT: 'NC',
          l: 'a',
          o: 'a',
          oU: 'a',
        },
      ],
      profile: 'intermediate_ca',
      rangePki: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
  },
  rangePkis: {
    '222': {
      certificates: {
        usages: ['test'],
        expiry: '800h',
      },
      intermediate: {
        expiry: '800h',
      },
      hosts: ['test.com'],
      names: [
        {
          c: 'US',
          sT: 'test',
          l: 'test',
          o: 'test',
          oU: 'test',
        },
      ],
      key: {
        algo: 'rsa',
        size: 2048,
      },
      cN: 'test',
      parentCAHost: '',
      keyPairData: {
        publicKey: 'test',
        privateKey: 'test',
      },
      bundleProfile: 'test',
      ready: true,
      status: 'Error',
    },
  },
  rangeConsoles: {
    '222': {
      groups: ['mico'],
      usernames: ['mico'],
      protocol: 'rdp',
      parameters: {
        username: 'mico',
        password: 'micospassword',
      },
    },
  },
  rangeDNSServers: {
    '222': {
      rangeIPs: {
        'Mock Range IP 1': '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      tags: ['mico'],
      type: 'recursive',
    },
  },
  rangeDNSZones: {
    '222': {
      ttl: 86500,
      masterNs: 'mico',
      email: 'mico@gmail.com',
      serial: 123,
      tagSelectors: ['mico'],
    },
  },
  rangeDNSRecords: {
    '222': {
      recordClass: 's',
      ttl: 0,
      type: 'A',
      data: '192.0.2.146',
      rangeDNSZone: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    },
  },
  rangeAutoIPs: {
    '111': {
      address: '10.10.10.20',
      latitude: '56.325374',
      longitude: '-106.516878',
    },
  },
  rangeIPs: {
    '222': {
      address: '10.10.10.10/8',
      controlNet: true,
      latitude: '56.325374',
      longitude: '-106.516878',
    },
  },
  rangeAutoL3Networks: {
    '222': {
      cidr: '10.10.10.10/24',
      latitude: '56.325374',
      longitude: '-106.516878',
      defaultGateway: '10.10.10.20',
    },
  },
  rangeRouters: {
    '222': {
      countryCode: 'CR',
      hostname: 'mico',
      latitude: '42.293758',
      longitude: '-91.678856',
      protocols: ['ospf'],
    },
  },
  rangeTorNets: {
    '222': {
      version: '0.4.7.11',
      //REF
      // directoryAuthorities: [
      //   {
      //     name: 'E1KWAjDgt2qSZWO7Gg',
      //     rangeIP: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      //     dnsRangeIP: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
      //   },
      // ],
      // relays: [],
      // exitNodes: [],
    },
  },
  rangeVolumes: {
    '222': {
      volume: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      storage: '3Gi',
      storageClass: 'd',
    },
  },
  vmSpecifications: {
    '222': {
      cpuCores: '6',
      memory: '768M',
      bootImage: {
        imageID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        storage: '5Gi',
        accessMode: 'ReadWriteOnce',
        vmDiskDriver: 'scsi',
      },
      disks: [
        {
          vmImage: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          storageClass: 'efs-sc',
          storage: '1024M',
        },
      ],
    },
  },
};

export const rangeResourceScenario = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listScenarios.length / +limit);
        //mock paging
        const firstItem = +offset;
        const lastItem = Math.min(
          firstItem + +limit - 1,
          listScenarios.length ? listScenarios.length - 1 : 0,
        );
        const scenarioPageItems = listScenarios.slice(firstItem, lastItem + 1);
        return HttpResponse.json(
          {
            totalCount: listScenarios.length,
            totalPages: totalPages,
            data: scenarioPageItems,
          },
          { status: 200 },
        );
      } else {
        // return full list
        return HttpResponse.json(
          {
            totalCount: listScenarios.length,
            totalPages: 1,
            data: listScenarios,
          },
          { status: 200 },
        );
      }
    },
  ),
  //GET list with a deleted scenario
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockFourthRangeId}/scenarios`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        const totalPages = Math.ceil(listScenarios.length / +limit);
        //mock paging
        const firstItem = +offset;
        const lastItem = Math.min(
          firstItem + +limit - 1,
          listScenarios.length ? listScenarios.length - 1 : 0,
        );
        const scenarioPageItems = listScenarios2.slice(firstItem, lastItem + 1);
        return HttpResponse.json(
          {
            totalCount: listScenarios2.length,
            totalPages: totalPages,
            data: scenarioPageItems,
          },
          { status: 200 },
        );
      } else {
        // return full list
        return HttpResponse.json(
          {
            totalCount: listScenarios2.length,
            totalPages: 1,
            data: listScenarios2,
          },
          { status: 200 },
        );
      }
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockSecondRangeId}/scenarios`,
    ({ request, params, cookies }) => {
      const url = new URL(request.url);
      const offset = url.searchParams.get('offset');
      const limit = url.searchParams.get('limit');
      if (offset && limit) {
        return HttpResponse.json(
          {
            totalCount: 0,
            totalPages: 1,
            data: [],
          },
          { status: 200 },
        );
      } else {
        // return empty list
        return HttpResponse.json([], { status: 200 });
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(singleRangeScenario, { status: 200 });
    },
  ),

  // GET overrides
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/overrides`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioOverrides, { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(singleRangeScenario, { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(singleRangeScenario, { status: 200 });
    },
  ),
  http.put(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/222`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(singleRangeScenario, { status: 200 });
    },
  ),

  //REF Mock Synch Error
  // http.put(
  //   `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}`,
  //   ({ request, params, cookies }) => {
  //     return HttpResponse.json({
  //         errorMessage: 'Error occurred',
  //       }, { status: 404 });

  //   }
  // ),

  // DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
