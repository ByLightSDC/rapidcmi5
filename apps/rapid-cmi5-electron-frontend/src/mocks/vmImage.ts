/* Handlers for /vmImages endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    bootDetails: {
      cloudInit: null,
      credentials: {
        adminUsername: 'kali',
        adminPassword: 'P@55w0rd!',
      },
      firmware: {
        efi: false,
        secureBoot: false,
      },
      drivers: {
        disk: 'virtio',
        network: 'virtio',
      },
      hardware: {
        minimumCpuCores: 1,
        minimumMemory: '1G',
        minimumStorage: '10G',
      },
      meta: {
        cpe: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
        iconType: 'Workstation',
        supportsCloudInit: false,
      },
      machineType: 'q35',
    },
    filename: 'kali-image.qcow',
    size: 4634392576,
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-02T15:50:53.000Z',
    dateEdited: '2023-03-02T15:50:56.000Z',
    description: 'Kali 2021 from ansdev SLAMR instance',
    name: 'Mock Kali 2021',
    author: 'andrew.thigpen@bylight.com',
  },
  {
    bootDetails: {
      cloudInit: null,
      credentials: {
        adminUsername: 'cents',
        adminPassword: 'P@55w0rd!',
      },
      firmware: {
        efi: false,
        secureBoot: false,
      },
      drivers: {
        disk: 'virtio',
        network: 'e1000',
      },
      hardware: {
        minimumCpuCores: 2,
        minimumMemory: '1G',
        minimumStorage: '50G',
      },
      meta: {
        cpe: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
        iconType: 'Workstation',
        supportsCloudInit: false,
      },
      machineType: 'q35',
    },
    filename: 'cents-image.qcow',
    size: 11232935936,
    uuid: '0b999c38-1396-4650-81b2-34653e2207a2',
    dateCreated: '2023-03-02T15:46:48.000Z',
    dateEdited: '2023-03-02T15:46:50.000Z',
    description: 'Win 10 VM',
    name: 'Win 10',
    author: 'andrew.thigpen@bylight.com',
  },
];

const updated = {
  bootDetails: {
    cloudInit: null,
    credentials: {
      adminUsername: 'kali',
      adminPassword: 'P@55w0rd!',
    },
    firmware: {
      efi: false,
      secureBoot: false,
    },
    drivers: {
      disk: 'virtio',
      network: 'virtio',
    },
    hardware: {
      minimumCpuCores: 1,
      minimumMemory: '1G',
      minimumStorage: '10G',
    },
    meta: {
      cpe: '78c484f6-cd29-4da4-a1c4-c6cbf0766898',
      iconType: 'Workstation',
      supportsCloudInit: false,
    },
    machineType: 'q35',
  },
  filename: 'kali-image.qcow',
  size: 4634392576,
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  dateCreated: '2023-03-02T15:50:53.000Z',
  dateEdited: '2023-03-02T15:50:56.000Z',
  description: 'Kali 2021 from ansdev SLAMR instance',
  name: 'Kali 2021 Updated',
  author: 'andrew.thigpen@bylight.com',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/assets/virtual-machine`;

export const vmImage = [
  // GET list
  http.get(`${baseUrl}/images`, ({ request, params, cookies }) => {
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
  }),

  // GET specific
  // also used for Range Vm Spec Test
  http.get(
    `${baseUrl}/images/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/images/0b999c38-1396-4650-81b2-34653e2207a2`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/images`, ({ request, params, cookies }) => {
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
    `${baseUrl}/images/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/images/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
