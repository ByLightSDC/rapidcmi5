/* Handlers for /range-specifications endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/infrastructure/range-specifications/vsphere`;

const recordsList = [
  {
    environmentCredential: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    kubernetesVersion: 'v1.26.15+rke2r1',
    cni: 'canal',
    clusterCidr: '192.0.2.0/24',
    serviceCidr: '192.0.3.0/24',
    systemDefaultRegistry: 'system registry',
    registries: {
      configs: {
        'docker-gitlab.perepsvcs.com': {
          caBundle: '',
          insecureSkipVerify: true,
        },
      },
      mirrors: {
        'docker-gitlab.perepsvcs.com': {
          endpoint: ['docker-gitlab.perepsvcs.com'],
          rewrite: { '^rancher/(.*)': 'metova/rancher/$1' },
        },
      },
    },
    kubeApiserverArg: [
      '--feature-gates=AnyVolumeDataSource=true,CrossNamespaceVolumeDataSource=true',
    ],
    kubeControllerManagerArg: [
      '--feature-gates=AnyVolumeDataSource=true,CrossNamespaceVolumeDataSource=true',
    ],
    machinePools: [
      {
        controlPlaneRole: true,
        etcdRole: true,
        workerRole: true,
        labels: { additionalProp1: 'prop 1' },
        machineOS: 'linux',
        name: 'pool1',
        quantity: 4,
        taints: [
          {
            key: 'taint',
            value: 'taint value',
            effect: 'NoSchedule',
          },
        ],
        unhealthyNodeTimeout: 300,
        machineConfig: {
          cfgparam: [' disk.enableUUID=TRUE'],
          cloneFrom: '/PCTE Dev/vm/ATT/jammy-server-cloudimg-amd64',
          cpuCount: 4,
          creationType: 'vm',
          datacenter: '/PCTE Dev',
          datastore: '/PCTE Dev/datastore/R840-DS',
          diskSize: 125000,
          folder: '/PCTE Dev/vm/ATT',
          memorySize: 8192,
          network: ['/PCTE Dev/network/Dev-Latest-EP'],
          os: 'linux',
          pool: '/PCTE Dev/host/Dev/Resources',
          tag: ['tag1:xxx'],
        },
      },
    ],
    uuid: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-06-08T18:24:14.000Z',
    dateEdited: '2023-06-08T18:54:40.000Z',
    description: 'an example vsphere cluster',
    name: 'mock example1',
    author: 'test.user@workplace.com',
  },
  {
    environmentCredential: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    kubernetesVersion: 'v1.26.15+rke2r1',
    cni: 'canal',
    clusterCidr: '192.0.2.0/24',
    serviceCidr: '192.0.3.0/24',
    systemDefaultRegistry: 'system registry',
    registries: {
      configs: {
        'docker-gitlab.perepsvcs.com': {
          caBundle: '',
          insecureSkipVerify: true,
        },
      },
      mirrors: {
        'docker-gitlab.perepsvcs.com': {
          endpoint: ['docker-gitlab.perepsvcs.com'],
          rewrite: { '^rancher/(.*)': 'metova/rancher/$1' },
        },
      },
    },
    kubeApiserverArg: [
      '--feature-gates=AnyVolumeDataSource=true,CrossNamespaceVolumeDataSource=true',
    ],
    kubeControllerManagerArg: [
      '--feature-gates=AnyVolumeDataSource=true,CrossNamespaceVolumeDataSource=true',
    ],
    machinePools: [
      {
        controlPlaneRole: true,
        etcdRole: true,
        workerRole: true,
        labels: {},
        machineOS: 'linux',
        name: 'pool1',
        quantity: 4,
        taints: [],
        unhealthyNodeTimeout: 300,
        machineConfig: {
          cfgparam: [' disk.enableUUID=TRUE'],
          cloneFrom: '/PCTE Dev/vm/ATT/jammy-server-cloudimg-amd64',
          cpuCount: 4,
          creationType: 'vm',
          datacenter: '/PCTE Dev',
          datastore: '/PCTE Dev/datastore/R840-DS',
          diskSize: 125000,
          folder: '/PCTE Dev/vm/ATT',
          memorySize: 8192,
          network: ['/PCTE Dev/network/Dev-Latest-EP'],
          os: 'linux',
          pool: '/PCTE Dev/host/Dev/Resources',
        },
      },
    ],
    uuid: '22345660-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-06-08T19:48:32.000Z',
    dateEdited: '2023-06-08T20:02:10.000Z',
    description: 'an example vsphere cluster',
    name: 'mock example2',
    author: 'test.user@workplace.com',
  },
];

const updated = {
  ...recordsList[0],
  name: 'Mocked Range Spec Updated',
};

export const vsphereRangeSpec = [
  // GET LIST
  http.get(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(recordsList, { status: 200 });
  }),

  // GET SPECIFIC
  http.get(
    `${baseUrl}/12345660-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(recordsList[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/22345660-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(recordsList[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(recordsList[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/12345660-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/12345660-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
