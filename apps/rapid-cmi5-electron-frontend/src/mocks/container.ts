/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    name: 'mock nginx',
    tags: [
      { name: 'mock nginx', tag: '1.23.1' },
      { name: 'mock nginx', tag: 'latest' },
    ],
  },
  {
    name: 'mock pcap-pilot',
    tags: [{ name: 'pcap-pilot', tag: '0.0.5' }],
  },
  {
    name: 'mock ssh-scp-pilot-attackstation',
    tags: [{ name: 'mock ssh-scp-pilot-attackstation', tag: '0.0.1' }],
  },
  {
    name: 'mock ssh-scp-pilot-targetone',
    tags: [{ name: 'mock ssh-scp-pilot-targetone', tag: '0.0.1' }],
  },
  {
    name: 'mock ssh-scp-pilot-targetthree',
    tags: [{ name: 'mock ssh-scp-pilot-targetthree', tag: '0.0.1' }],
  },
  {
    name: 'mock ssh-scp-pilot-targettwo',
    tags: [{ name: 'mock ssh-scp-pilot-targettwo', tag: '0.0.1' }],
  },
];

const emptyList: string[] = [];

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;

export const container = [
  // GET list
  http.get(`${baseUrl}/containers`, (info) => {
    //TODO?? mocked params for offset/limit/search params are now embedded in the info.request.url
    // so we will always just return the list data
    // example url data:  https://rangeos-api.develop-cp.rangeos.engineering/v1/content/assets/containers?offset=0&limit=100&search=&sortBy=dateEdited&sort=desc
    // const url = new URL(info.request.url);
    // const offset = url.searchParams.get('offset');
    // const limit = url.searchParams.get('limit');
    // const search = url.searchParams.get('search');
    // const nameSearch = search ? search.includes('name') : '';

    // const totalPages = Math.ceil(list.length / (limit ? +limit : 10));
    // name search does NOT have offset or limit searchParams but we get them "all" (under data)
    // if ((offset && limit) || nameSearch) {
    return HttpResponse.json(
      {
        totalCount: list.length,
        totalPages: 1, // totalPages,
        data: list,
      },
      { status: 200 },
    );
    // } else {
    //   // return full list
    //   return HttpResponse.json(list, { status: 200 });
    // }
  }),

  // POST (create)
  http.post(`${baseUrl}/containers`, ({ request, params, cookies }) => {
    return HttpResponse.json(
      {
        //TODO currently nothing is returned
      },
      { status: 200 },
    );
  }),

  // DELETE
  http.delete(
    `${baseUrl}/containers/mock%20nginx`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
