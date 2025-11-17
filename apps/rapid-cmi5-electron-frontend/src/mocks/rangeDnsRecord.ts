/* Handlers for /range-dns-records endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    uuid: '5af22713-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-10-31T14:19:34.019Z',
    dateEdited: '2022-10-31T14:19:34.019Z',
    description: 'first record description',
    name: 'dnsRecordOne',
    author: 'user@example.com',
    recordClass: 'IN',
    ttl: 3600,
    type: 'CNAME',
    data: 'my.domain.com',
    rangeDNSZone: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    uuid: '4af22713-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2022-10-31T14:19:34.019Z',
    dateEdited: '2022-10-31T14:19:34.019Z',
    description: 'second record description',
    name: 'dnsRecordTwo',
    author: 'user@example.com',
    recordClass: 'IN',
    ttl: 3600,
    type: 'A',
    data: '10.10.10.10',
    rangeDNSZone: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const single = {
  uuid: '5af22713-6fb7-4997-8f3c-70f0a335d5a3',
  dateCreated: '2022-10-31T14:19:34.019Z',
  dateEdited: '2022-10-31T14:19:34.019Z',
  description: 'first record description',
  name: 'dnsRecordOne',
  author: 'user@example.com',
  recordClass: 'IN',
  ttl: 3600,
  type: 'CNAME',
  data: 'my.domain.com',
  rangeDNSZone: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
};

const scenarioValidationDnsRecords = [
  {
    uuid: 'c89b9f2e-3680-4fbc-920d-cd3e097ba185',
    dateCreated: '2022-10-31T14:19:34.019Z',
    dateEdited: '2022-10-31T14:19:34.019Z',
    description: 'first record description',
    name: 'mx',
    author: 'user@example.com',
    recordClass: 'IN',
    ttl: 3600,
    type: 'CNAME',
    data: 'my.domain.com',
    rangeDNSZone: 'f2ff12b2-968b-4686-b477-af8a392e305d',
  },
  {
    uuid: 'f150c47d-f124-4e50-8f7b-dd3d52e8b60f',
    dateCreated: '2022-10-31T14:19:34.019Z',
    dateEdited: '2022-10-31T14:19:34.019Z',
    description: 'first record description',
    name: 'www',
    author: 'user@example.com',
    recordClass: 'IN',
    ttl: 3600,
    type: 'CNAME',
    data: 'my.domain.com',
    rangeDNSZone: 'f2ff12b2-968b-4686-b477-af8a392e305d',
  },
];

const rangeDnsRecordPath = '/v1/content/range/range-dns-records';
export const rangeDnsRecord = [
  // GET list
  ///// v1/content/range/range-dns-zones
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}`,
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
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/5af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/4af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        {
          uuid: '4af22713-6fb7-4997-8f3c-70f0a335d5a3',
          dateCreated: '2022-10-31T14:19:34.019Z',
          dateEdited: '2022-10-31T14:19:34.019Z',
          description: 'second record description',
          name: 'dnsRecordTwo',
          author: 'user@example.com',
          recordClass: 'IN',
          ttl: 3600,
          type: 'A',
          data: '10.10.10.10',
          rangeDNSZone: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        },
        { status: 200 },
      );
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/c89b9f2e-3680-4fbc-920d-cd3e097ba185`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationDnsRecords[0], {
        status: 200,
      });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/f150c47d-f124-4e50-8f7b-dd3d52e8b60f`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioValidationDnsRecords[1], {
        status: 200,
      });
    },
  ),

  // POST (create)
  http.post(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/5af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),
  http.put(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/4af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // DELETE
  //simular timing return HttpResponse.json(list[2], { status: 200 });

  http.delete(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/5af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
  http.delete(
    `${config.DEVOPS_API_URL}${rangeDnsRecordPath}/4af22713-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
