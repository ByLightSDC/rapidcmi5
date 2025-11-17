/* Handlers for /pcte-standard-netspec endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    netspec: {
      id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      name: 'andres-test',
      hosts: [
        {
          id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          os: 'cpe:2.3:*:Microsoft:Windows:10:*:*:*:*:*:amd64:gold ribbon',
          metadata: {
            labels: {},
            annotations: {
              display_name: 'annotation1',
              display_description: 'annotation1 description',
            },
          },
          services: [],
          resources: {
            cpu: 23,
            disks: [
              {
                id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                size: '5GB',
                metadata: {
                  labels: {},
                  annotations: {
                    display_name: 'annotation1',
                    display_description: 'annotation1 description',
                  },
                },
              },
            ],
            memory: '25GB',
            networks: [
              {
                id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                mask: '4',
                network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                metadata: {
                  labels: {},
                  annotations: {
                    display_name: 'annotation1',
                    display_description: 'annotation1 description',
                  },
                },
                ipv4Addresses: [],
                ipv6Addresses: [],
              },
            ],
          },
          credentials: [],
        },
      ],
      schema: '1',
      net_info: {
        name: 'mock-netspec',
      },
      networks: [
        {
          id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          subnets: ['23'],
          metadata: {
            labels: {},
            annotations: {
              display_name: 'annotation1',
              display_description: 'annotation1 description',
            },
          },
        },
      ],
      services: [],
      credentials: [],
      description: 'this is only a test',
    },
    scenario: 'abfb6403-08a4-4c55-abe4-f7061ef44125',
    package: '67f95dce-0c6e-4cac-8288-8d94707b52e8',
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-04-08T15:42:32.389Z',
    dateEdited: '2024-04-08T15:42:32.389Z',
    description: '',
    name: 'mock-netspec-1',
    author: 'andres.llausas@bylight.com',
  },
  {
    netspec: {
      id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      name: 'andres-test-2',
      hosts: [
        {
          id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          os: 'cpe:2.3:*:Microsoft:Windows:10:*:*:*:*:*:amd64:gold ribbon',
          metadata: {
            labels: {},
            annotations: {
              display_name: 'annotation1',
              display_description: 'annotation1 description',
            },
          },
          services: [],
          resources: {
            cpu: 23,
            disks: [
              {
                id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                size: '5GB',
                metadata: {
                  labels: {},
                  annotations: {
                    display_name: 'annotation1',
                    display_description: 'annotation1 description',
                  },
                },
              },
            ],
            memory: '25GB',
            networks: [
              {
                id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                mask: '4',
                network: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
                metadata: {
                  labels: {},
                  annotations: {
                    display_name: 'annotation1',
                    display_description: 'annotation1 description',
                  },
                },
                ipv4Addresses: [],
                ipv6Addresses: [],
              },
            ],
          },
          credentials: [],
        },
      ],
      schema: '1',
      net_info: {
        name: 'mock-netspec',
      },
      networks: [
        {
          id: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
          subnets: ['23'],
          metadata: {
            labels: {},
            annotations: {
              display_name: 'annotation1',
              display_description: 'annotation1 description',
            },
          },
        },
      ],
      services: [],
      credentials: [],
      description: 'this is only a test',
    },
    scenario: 'abfb6403-08a4-4c55-abe4-f7061ef44125',
    package: '67f95dce-0c6e-4cac-8288-8d94707b52e8',
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-04-08T15:42:32.389Z',
    dateEdited: '2024-04-08T15:42:32.389Z',
    description: '',
    name: 'mock-netspec-2',
    author: 'andres.llausas@bylight.com',
  },
];
const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/generics`;

export const pcteNetspec = [
  // GET list
  http.get(
    `${baseUrl}/pcte-standard-netspec`,
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
    `${baseUrl}/pcte-standard-netspec/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/pcte-standard-netspec/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  // POST (create)
  http.post(
    `${baseUrl}/pcte-standard-netspec`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${baseUrl}/pcte-standard-netspec/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/pcte-standard-netspec/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
