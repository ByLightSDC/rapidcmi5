/* Handlers for /volumes endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    cpuCores: 1,
    memory: '1Gi',
    disks: [
      {
        vmImage: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        storageClass: 'efs-sc',
        storage: '1Gi',
      },
    ],
    bootImage: {
      imageID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      storage: '120Gi',
    },
    interfaces: [
      {
        defaultGateway: true,
        rangeNetwork: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeIP: null,
        autoRangeIP: null,
        vmNicModel: 'virtio',
        mirrorPorts: [
          {
            vmSpecification: null,
            containerSpecification: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
            interfaceIndex: 0,
          },
        ],
      },
    ],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-02-27T13:52:10.000Z',
    dateEdited: '2023-02-27T13:52:10.000Z',
    description: '',
    name: 'Mock VM Spec',
    author: 'michelle.gabele@bylight.com',
  },
  {
    cpuCores: 1,
    memory: '1Gi',
    disks: [
      {
        vmImage: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        storageClass: 'efs-sc',
        storage: '1Gi',
      },
    ],
    bootImage: {
      imageID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      storage: '120Gi',
    },
    interfaces: [
      {
        defaultGateway: false,
        rangeNetwork: null,
        rangeIP: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        rangeAutoIP: null,
        vmNicModel: 'virtio',
        mirrorPorts: [],
      },
    ],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-02-27T13:52:10.000Z',
    dateEdited: '2023-02-27T13:52:10.000Z',
    description: '',
    name: 'Mock VM Spec 2',
    author: 'michelle.gabele@bylight.com',
  },
];

const updated = {
  cpuCores: 1,
  memory: '64M',
  disks: [
    {
      vmImage: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      storageClass: '',
      storage: '64M',
    },
  ],
  bootImage: {
    imageID: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    storage: '120Gi',
  },
  interfaces: [],
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  dateCreated: '2023-02-27T13:52:10.000Z',
  dateEdited: '2023-02-27T13:52:10.000Z',
  description: '',
  name: 'Mock VM Spec Updated',
  author: 'michelle.gabele@bylight.com',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const rangeVmSpecification = [
  // GET list
  http.get(`${baseUrl}/vm-specifications`, ({ request, params, cookies }) => {
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
  }),

  // GET specific
  http.get(
    `${baseUrl}/vm-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/vm-specifications/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/vm-specifications`, ({ request, params, cookies }) => {
    return HttpResponse.json(
      {
        author: 'striar.yunis@bylight.com',
        description: 'Describe volume 1',
        dateCreated: '2022-08-31T17:45:33.017Z',
        dateEdited: '2022-08-31T17:45:33.017Z',
        size: 100,
        volumeType: 'ftp',
        name: 'Mock Volume 3',
        uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
      },
      { status: 200 },
    );
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/vm-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/vm-specifications/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
