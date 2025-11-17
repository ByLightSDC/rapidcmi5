/* Handlers for /charts endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = [
  {
    name: 'mychartname',
    versions: [
      {
        uuid: '111version',
        name: 'mychartname',
        description: 'mock description',
        cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        version: 'myversion',
        author: 'michelle.gabele@bylight.com',
        dateCreated: '2022-11-29T19:39:45.000Z',
        appVersion: 'mock app version',
        digest: 'mock digest',
      },
      {
        uuid: '112version',
        name: 'mychartname',
        description: 'mock description2',
        cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        version: 'mock version2',
        author: 'michelle.gabele@bylight.com',
        dateCreated: '2022-11-29T19:39:45.000Z',
        appVersion: 'mock app version2',
        digest: 'mock digest2',
      },
      {
        uuid: '113version',
        name: 'mychartname',
        description: 'mock description3',
        cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        version: 'mockempty',
        author: 'michelle.gabele@bylight.com',
        dateCreated: '2022-11-29T19:39:45.000Z',
        appVersion: 'mock app version3',
        digest: 'mock digest2',
      },
    ],
  },
  {
    name: 'Mock Chart Name 2',
    versions: [
      {
        uuid: '211version',
        name: 'Mock Chart Name 2',
        description: 'mock description',
        cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        version: 'mock version',
        author: 'michelle.gabele@bylight.com',
        dateCreated: '2022-11-29T19:39:45.000Z',
        appVersion: 'mock app version',
        digest: 'mock digest',
      },
      {
        uuid: '212version',
        name: 'Mock Chart Name 2',
        description: 'mock description2',
        cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
        version: 'mock version2',
        author: 'michelle.gabele@bylight.com',
        dateCreated: '2022-11-29T19:39:45.000Z',
        appVersion: 'mock app version2',
        digest: 'mock digest2',
      },
    ],
  },
];

const singleItem = {
  name: 'mychartname',
  versions: [
    {
      uuid: '111version',
      name: 'mychartname',
      description: 'mock description',
      cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      version: 'myversion',
      author: 'michelle.gabele@bylight.com',
      dateCreated: '2022-11-29T19:39:45.000Z',
      appVersion: 'mock app version',
      digest: 'mock digest',
    },
    {
      uuid: '112version',
      name: 'mychartname',
      description: 'mock description2',
      cpe: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
      version: 'mock version2',
      author: 'michelle.gabele@bylight.com',
      dateCreated: '2022-11-29T19:39:45.000Z',
      appVersion: 'mock app version2',
      digest: 'mock digest2',
    },
  ],
};

const devdocs = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    rangeVolumes: {
      type: 'object',
      properties: {
        certs: {
          type: 'string',
          'x-volume-type': 'devdocs-certs',
        },
      },
    },
    values: {
      type: 'object',
      properties: {
        Devdocs: {
          type: 'object',
          properties: {
            ssl: {
              type: 'string',
            },
            port: {
              type: 'string',
            },
            dns: {
              type: 'string',
            },
          },
        },
        Nginx: {
          type: 'object',
          properties: {
            ssl: {
              type: 'string',
            },
            urlStr: {
              type: 'string',
            },
            environmentUrl: {
              type: 'string',
            },
            publicHost: {
              type: 'string',
            },
            port: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};

const devdocs2 = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    rangeVolumes: {
      type: 'object',
      properties: {
        certs: {
          type: 'string',
          'x-volume-type': 'devdocs-certs',
        },
      },
    },
    values: {
      type: 'object',
      properties: {
        Devdocs: {
          type: 'object',
          properties: {
            ssl: {
              type: 'string',
            },
            port: {
              type: 'string',
            },
            dns: {
              type: 'string',
            },
          },
        },
        Nginx: {
          type: 'object',
          properties: {
            ssl: {
              type: 'string',
            },
            urlStr: {
              type: 'string',
            },
            environmentUrl: {
              type: 'string',
            },
            publicHost: {
              type: 'string',
            },
            port: {
              type: 'string',
            },
          },
        },
      },
    },
    TestLevel: {
      type: 'object',
      properties: {
        mico: {
          type: 'string',
        },
      },
    },
  },
};

const devdocs3 = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    rangeVolumes: {
      type: 'object',
      properties: {
        certs: {
          type: 'string',
          'x-volume-type': 'devdocs-certs',
        },
      },
      required: ['certs'],
    },
    values: {
      type: 'object',
      properties: {
        ssl: { type: 'boolean' },
        dns: { type: 'string' },
      },
    },
  },
};

const testSchema = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {
    rangeVolumes: {
      type: 'object',
      properties: {
        certs: {
          type: 'string',
          'x-volume-type': 'certs',
        },
        xtra: {
          type: 'string',
          'x-volume-type': 'certs',
        },
      },
      required: ['certs'],
    },
    values: {
      type: 'object',
      properties: {
        myBoolean: {
          type: 'boolean',
          description: 'A boolean property',
        },
        numberFields: {
          type: 'object',
          properties: {
            myInteger: {
              type: 'integer',
            },
            myRangeInteger: {
              type: 'integer',
              minimum: 5,
              maximum: 10,
              description: 'this integer has a range of valid values',
            },
            myExclusiveRangeInteger: {
              type: 'integer',
              exclusiveMinimum: 5,
              exclusiveMaximum: 10,
            },
            myNumber: {
              type: 'number',
            },
            myRangeNumber: {
              type: 'number',
              minimum: -5,
              maximum: 5,
            },
            myExclusiveRangeNumber: {
              type: 'number',
              exclusiveMinimum: 5,
              exclusiveMaximum: 10,
              description: 'this number has an exclusive range of valid values',
            },
          },
          // required: ['myInteger'],
        },
        myString: {
          type: 'string',
        },
        formattedStrings: {
          type: 'object',
          properties: {
            myDateString: {
              type: 'string',
              format: 'date',
            },
            myEmailString: {
              type: 'string',
              format: 'email',
            },
            myHostString: {
              type: 'string',
              format: 'hostname',
            },
            myIpv4String: {
              type: 'string',
              format: 'ipv4',
            },
            myIpv6String: {
              type: 'string',
              format: 'ipv6',
            },
            myTimeString: {
              type: 'string',
              format: 'time',
            },
            myUriString: {
              type: 'string',
              format: 'uri',
            },
            myUuidString: {
              type: 'string',
              format: 'uuid',
            },
          },
          // required: ['myEmailString'],
        },
        myPatternString: {
          type: 'string',
          pattern: '^word pattern\\d$',
          description: 'Pattern matching string',
        },
        mySizedString: {
          type: 'string',
          minLength: 3,
          // maxLength: 10,
        },
        // myRequiredSizedString: {
        //   type: 'string',
        //   minLength: 3,
        //   maxLength: 10,
        // },
        myReadOnly: {
          type: 'string',
          readOnly: true,
          default: 'read this',
        },
        myEnum: {
          type: 'string',
          // deprecated: true,
          enum: ['apple', 'banana', 'orange'],
          description: 'Very fruitful',
        },
        specialKeywords: {
          type: 'object',
          properties: {
            myNullField: {
              type: 'null',
              // description: 'This is a special field and must be null',
            },
            myConstant: {
              const: 'Const Value',
              // description: 'This is a constant value',
            },
            myDeprecatedField: {
              type: 'string',
              deprecated: true,
              description: 'can enter value even tho deprecated',
            },
            myWriteOnlyField: {
              type: 'string',
              writeOnly: true,
              description: 'can enter value even tho write only',
            },
          },
        },
        mySimpleArray: {
          type: 'array',
          items: { type: 'string', minLength: 3 },
          // minItems: 2,
          maxItems: 4,
          uniqueItems: true,
          // deprecated: true,
          // writeOnly: true,
          description: 'simple unique string array with max entries',
        },
        arrayFormats: {
          type: 'object',
          properties: {
            myEnumArray: {
              type: 'array',
              items: { type: 'string', enum: ['grape', 'mango', 'pineapple'] },
              uniqueItems: true,
            },
            myFormatArray: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
                description: 'list of emails',
              },
            },
            myIntegerArray: {
              type: 'array',
              items: { type: 'integer', minimum: 5 },
            },
            myNumberArray: {
              type: 'array',
              items: { type: 'number', maximum: 5 },
            },
            myPatternArray: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^word pattern\\d$',
              },
            },
            myObjectArray: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  stringField: {
                    type: 'string',
                    description: 'nested array string',
                  },
                  integerField: { type: 'integer' },
                  nestedFields: {
                    type: 'object',
                    properties: {
                      nestedString: { type: 'string' },
                      nestedEnum: { type: 'string', enum: ['A', 'B', 'C'] },
                    },
                  },
                  nestedArray: {
                    type: 'array',
                    items: {
                      type: 'string',
                      minLength: 2,
                    },
                  },
                },
              },
              description: 'This array has several fields',
              required: ['stringField', 'integerField'],
            },
          },
        },
      },
      // required: ['myRequiredSizedString', 'mySimpleArray'],
      required: ['mySimpleArray'],
    },
  },
};

const emptySchema = {
  $schema: 'http://json-schema.org/schema#',
  type: 'object',
  properties: {},
};

const baseUrl = `${config.DEVOPS_API_URL}/v1/content/assets`;

export const chart = [
  // GET list
  http.get(`${baseUrl}/charts`, ({ request, params, cookies }) => {
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
      return HttpResponse.json(list, { status: 200 });
    }
  }),

  // GET specific -- by NAME
  http.get(`${baseUrl}/charts/mychartname`, ({ request, params, cookies }) => {
    return HttpResponse.json(singleItem, { status: 200 });
  }),

  // POST (create)
  http.post(`${baseUrl}/charts`, ({ request, params, cookies }) => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // DELETE
  http.delete(
    `${baseUrl}/charts/mychartname`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];

export const chartVersions = [
  // DELETE
  http.delete(
    `${baseUrl}/charts/mychartname/versions/myversion`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),

  // GET schema
  http.get(
    `${baseUrl}/charts/mychartname/versions/myversion/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(testSchema, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/charts/mychartname/versions/mock%20version2/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(devdocs, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/charts/mychartname/versions/mockempty/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(emptySchema, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/charts/chart/versions/1.0/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(devdocs2, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/charts/chart-name/versions/chart-version-name/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(devdocs3, { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/charts/chart-name/versions/test-version/schema`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(testSchema, { status: 200 });
    },
  ),
];
