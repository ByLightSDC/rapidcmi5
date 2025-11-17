/* Handlers for /range-specifications endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/infrastructure/range-specifications/aws`;

const recordsList = [
  {
    author: 'Michelle Gabele',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mocked Range Spec',
    environmentCredential: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    kubernetesVersion: 'v1.26.15+rke2r1',
    cni: 'canal',
    clusterCidr: '192.0.2.0/24',
    serviceCidr: '192.0.3.0/24',
    systemDefaultRegistry: 'system registry',
    disableCloudController: false,
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
    kubeletArg: ['--max-pods=110'],
    machinePools: [
      {
        controlPlaneRole: true,
        etcdRole: true,
        workerRole: true,
        labels: { additionalProp1: 'prop 1' },
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
          //required fields
          iamInstanceProfile: 'k8s-master-role',
          instanceType: 't2.large',
          region: 'us-east-1',
          rootSize: '128',
          securityGroup: ['default'],
          subnetId: 'subnet-1234',
          tags: 'poolname, pool1',
          zone: 'a',
          // optional fields
          accessKey: 'ABCDEF1234ABCDEF1234',
          ami: 'ami-09e3a617f9c98397d',
          apiVersion: 'v1.3a',
          blockDurationMinutes: '30',
          deviceName: 'root-device',
          encryptEbsVolume: true,
          endpoint: 'host.com',
          httpEndpoint: 'https://metahost.com',
          httpTokens: 'sample tokens',
          insecureTransport: true,
          keypairName: 'key-pair',
          kind: 'rest resource...',
          kmsKey:
            'arn:aws:kms:us-east-1:738718428379:key/12345661-6fb7-4997-8f3c-70f0a335d5a4',
          monitoring: true,
          openPort: ['23', '42'],
          privateAddressOnly: true,
          requestSpotInstance: true,
          retries: '3',
          secretKey: 'abcDEFghij1234567890abcDEFghij1234567890',
          sessionToken: 'sample token',
          spotPrice: '8.95',
          sshKeyContents: 'contents',
          sshUser: 'Joe',
          useEbsOptimizedInstance: true,
          usePrivateAddress: true,
          userdata: 'sample user data',
          volumeType: 'volume-x',
          vpcId: 'myVpc',
        },
      },
    ],
    uuid: '12345660-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'Marilyn Stuck',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.133Z',
    name: 'Mocked Range Spec 2',
    environmentCredential: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    kubernetesVersion: 'v1.26.15+rke2r1',
    cni: 'canal',
    clusterCidr: null,
    serviceCidr: null,
    systemDefaultRegistry: null,
    disableCloudController: false,
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
    kubeletArg: ['--max-pods=110'],
    machinePools: [
      {
        controlPlaneRole: true,
        etcdRole: true,
        workerRole: true,
        labels: { additionalProp1: 'prop 1' },
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
          //required fields
          iamInstanceProfile: 'k8s-master-role',
          instanceType: 't2.large',
          region: 'us-east-1',
          rootSize: '128',
          securityGroup: ['default'],
          subnetId: 'subnet-1234',
          tags: 'poolname: pool1',
          zone: 'a',
          //optional fields (not filled in)
        },
      },
    ],
    uuid: '12345661-6fb7-4997-8f3c-70f0a335d5a4',
  },
];

const updated = {
  ...recordsList[0],
  name: 'Mocked Range Spec Updated',
};
export const awsRangeSpec = [
  // GET LIST
  http.get(`${baseUrl}`, ({ request, params, cookies }) => {
    return HttpResponse.json(recordsList, { status: 200 });
  }),

  // GET Specific
  http.get(
    `${baseUrl}/12345660-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(recordsList[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/12345661-6fb7-4997-8f3c-70f0a335d5a4`,
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
