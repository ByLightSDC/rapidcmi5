/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;

const listCpes = [
  {
    lang: '*',
    other: '*',
    part: '*',
    product: 'Windows Server',
    softwareEdition: '*',
    targetHardware: '*',
    targetSoftware: '*',
    update: '*',
    vendor: 'Microsoft',
    version: '2012',
    cpeFormat: 'cpe:2.3:*:Microsoft:Windows Server:2012:*:*:*:*:*:*:*',
    uuid: '12345679-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2023-03-07T18:08:06.000Z',
    dateEdited: '2023-03-07T18:08:06.000Z',
    description: 'Microsoft Windows Server 2012',
    name: 'Mock Microsoft Windows Server 2012',
    author: 'jschramm@ultimateknowledge.com',
  },
  {
    lang: '*',
    other: '*',
    part: '*',
    product: 'kali',
    softwareEdition: '*',
    targetHardware: '*',
    targetSoftware: '*',
    update: '*',
    vendor: 'kali',
    version: '2021',
    cpeFormat: 'cpe:2.3:*:kali:kali:2021:*:*:*:*:*:*:*',
    uuid: '78c484f6-cd29-4da4-a1c4-c6cbf0766898',
    dateCreated: '2023-03-02T20:50:22.000Z',
    dateEdited: '2023-03-02T20:50:22.000Z',
    description: 'Kali 2021',
    name: 'Kali 2021',
    author: 'andrew.thigpen@bylight.com',
  },
  {
    lang: '*',
    other: '*',
    part: '*',
    product: 'windows_10',
    softwareEdition: '*',
    targetHardware: '*',
    targetSoftware: '*',
    update: '*',
    vendor: 'microsoft',
    version: '*',
    cpeFormat: 'cpe:2.3:*:microsoft:windows_10:*:*:*:*:*:*:*:*',
    uuid: 'b86dfc24-b34c-4e90-94a4-f6e401307b80',
    dateCreated: '2023-03-02T20:47:57.000Z',
    dateEdited: '2023-03-02T20:47:57.000Z',
    description: 'Microsoft Windows 10',
    name: 'Microsoft Windows 10',
    author: 'andrew.thigpen@bylight.com',
  },
];

const updated = {
  ...listCpes[0],
  name: 'Mock CPE Updated',
};

export const cpe = [
  // GET list
  http.get(`${baseUrl}/cpe`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listCpes.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listCpes.length,
          totalPages: totalPages,
          data: listCpes,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listCpes.length,
          totalPages: 1,
          data: listCpes,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/cpe/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listCpes[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/cpe/78c484f6-cd29-4da4-a1c4-c6cbf0766898`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listCpes[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/cpe`, ({ request, params, cookies }) => {
    return HttpResponse.json(listCpes[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/cpe/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updated, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/cpe/12345679-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
