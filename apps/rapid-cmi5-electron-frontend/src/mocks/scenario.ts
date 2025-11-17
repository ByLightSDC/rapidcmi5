/* Handlers for /scenarios endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1'],
    name: 'Mock Scenario 1',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1'],
    name: 'Mock Scenario 2',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 3',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 4',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 5',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 6',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 7',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 8',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 9',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
  {
    author: 'striar.yunis@bylight.com',
    dateCreated: '2022-11-29T19:39:45.000Z',
    dateEdited: '2022-11-29T19:39:45.000Z',
    metadata_tags: ['tag1', 'tag2'],
    name: 'Mock Scenario 10',
    packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
  },
];

const single = {
  author: 'striar.yunis@bylight.com',
  dateCreated: '2022-11-29T19:39:45.000Z',
  dateEdited: '2022-11-29T19:39:45.000Z',
  metadata_tags: ['tag1', 'tag2'],
  name: 'Mock Scenario 1',
  packages: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
  containerSpecifications: ['22345678-6fb7-4997-8f3c-70f0a335d5a3'],
  uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
};

const scenarioSchema1 = {
  type: 'object',
  required: ['username'],
  properties: {
    vncPassword: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
  },
};

const scenarioTerraform1 = {
  name: 'terraform Example',
  description:
    'not sure what this object really looks like - just trying something here',
};

const validationIssues = [
  {
    message:
      "Range DNS record 'www' references a Range DNS zone not in the scenario.",
    code: 'missing_resource',
    severity: 'error',
    source: {
      uuid: '9200d396-a4eb-4191-b2b7-9c4b15425a4a',
      name: 'tor browser',
      type: 'ContainerSpecification',
    },
    data: {
      missing: {
        name: 'test-dns-zone1',
        uuid: 'f2ff12b2-968b-4686-b477-af8a392e305d',
        type: 'RangeDNSZone',
      },
      referencedBy: {
        uuid: 'f150c47d-f124-4e50-8f7b-dd3d52e8b60f',
        name: 'www',
        type: 'RangeDNSRecord',
      },
    },
  },
  {
    message:
      "Range DNS record 'mx' references a Range DNS zone not in the scenario.",
    code: 'missing_resource',
    severity: 'error',
    source: {
      uuid: '9200d396-a4eb-4191-b2b7-9c4b15425a4a',
      name: 'tor browser',
      type: 'ContainerSpecification',
    },
    data: {
      missing: {
        name: 'test-dns-zone1',
        uuid: 'f2ff12b2-968b-4686-b477-af8a392e305d',
        type: 'RangeDNSZone',
      },
      referencedBy: {
        uuid: 'c89b9f2e-3680-4fbc-920d-cd3e097ba185',
        name: 'mx',
        type: 'RangeDNSRecord',
      },
    },
  },
  {
    message:
      "Unexpected error validating container specification 'tor browser' values: NOT_FOUND(404): Chart 'netshoot' not found",
    code: 'unknown',
    severity: 'error',
    source: {
      uuid: '4967555a-c932-4937-aa3b-83916d67041e',
      name: 'test package',
      type: 'Package',
    },
  },
  {
    message:
      "Range DNS zone 'test-dns-zone2' has no associated Range DNS records in the scenario.",
    code: 'missing_resource_type',
    severity: 'warning',
    source: {
      uuid: '4967555a-c932-4937-aa3b-83916d67041e',
      name: 'test package',
      type: 'Package',
    },
    data: {
      missingType: 'RangeDNSRecord',
      requiredBy: {
        uuid: '8f877bb3-48e1-4ead-ac23-e25d988a42ab',
        name: 'test-dns-zone2',
        type: 'RangeDNSZone',
      },
    },
  },
  {
    message: "Range DNS zone 'test-dns-zone1' is missing tag selectors.",
    code: 'invalid_field',
    severity: 'warning',
    source: {
      uuid: '4967555a-c932-4937-aa3b-83916d67041e',
      name: 'test package',
      type: 'Package',
    },
    data: {
      resource: {
        uuid: 'f2ff12b2-968b-4686-b477-af8a392e305d',
        name: 'test-dns-zone1',
        type: 'RangeDNSZone',
      },
      field: 'tagSelectors',
    },
  },
  {
    message:
      "Range DNS zone 'test-dns-zone2' does not match any Range DNS server in the scenario.",
    code: 'missing_resource_type',
    severity: 'info',
    source: {
      uuid: '4967555a-c932-4937-aa3b-83916d67041e',
      name: 'test package',
      type: 'Package',
    },
    data: {
      missingType: 'RangeDNSServer',
      requiredBy: {
        uuid: '8f877bb3-48e1-4ead-ac23-e25d988a42ab',
        name: 'test-dns-zone2',
        type: 'RangeDNSZone',
      },
    },
  },
];

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/range`;

export const scenario = [
  // GET list
  http.get(`${baseUrl}/scenarios`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(list.length / +limit);
      //mock paging
      const firstItem = +offset;
      const lastItem = Math.min(
        firstItem + +limit - 1,
        list.length ? list.length - 1 : 0,
      );
      const scenarioPageItems = list.slice(firstItem, lastItem + 1);
      return HttpResponse.json(
        {
          totalCount: list.length,
          totalPages: totalPages,
          data: scenarioPageItems,
        },
        { status: 200 },
      );
    } else {
      // return full list
      return HttpResponse.json(list, { status: 200 });
    }
  }),

  // GET tags
  http.get(`${baseUrl}/scenarios`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(list.length / +limit);
      //mock paging
      const firstItem = +offset;
      const lastItem = Math.min(
        firstItem + +limit - 1,
        list.length ? list.length - 1 : 0,
      );
      const scenarioPageItems = list.slice(firstItem, lastItem + 1);
      return HttpResponse.json(
        {
          totalCount: list.length,
          totalPages: totalPages,
          data: scenarioPageItems,
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
    `${baseUrl}/scenarios/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // POST (create)
  http.post(`${baseUrl}/scenarios`, ({ request, params, cookies }) => {
    return HttpResponse.json(single, { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/scenarios/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(single, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/scenarios/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),

  // GET schema
  http.get(
    `${baseUrl}/scenarios/12345678-6fb7-4997-8f3c-70f0a335d5a3/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioSchema1, { status: 200 });
    },
  ),

  // GET terraform
  http.get(
    `${baseUrl}/scenarios/12345678-6fb7-4997-8f3c-70f0a335d5a3/terraform`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(scenarioTerraform1, { status: 200 });
    },
  ),

  // POST (validate)
  http.post(`${baseUrl}/scenarios/validate`, ({ request, params, cookies }) => {
    return HttpResponse.json(validationIssues, { status: 200 });
  }),
];
