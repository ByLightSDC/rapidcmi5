/* Handlers for /telemetryAgent endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockTopic = 'telemetry-agents';

const listTelemetryAgents = [
  {
    targetRangeVm: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    interval: 10,
    script:
      '#!/bin/sh\nif [ -f /tmp/flag.txt ]; then\n  echo \'{"flag":1}\'\nfi\n',
    scenarioGroups: [],
    uuid: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-12-04T17:05:32.413Z',
    dateEdited: '2024-12-04T20:24:12.725Z',
    description: '',
    name: 'Mock Telemetry Agent1',
    author: 'test.user@bylight.com',
    metadata: {},
  },
  {
    targetRangeVm: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
    interval: 30,
    script:
      '#!/bin/sh\nif [ -f /tmp/flag.txt ]; then\n  echo \'{"flag":1}\'\nfi\n',
    scenarioGroups: [],
    uuid: '22345678-6fb7-4997-8f3c-70f0a335d5a3',
    dateCreated: '2024-12-11T19:40:44.863Z',
    dateEdited: '2024-12-11T19:40:44.863Z',
    description: '',
    name: 'Mock Telemetry Agent2',
    author: 'andrew.thigpen@bylight.com',
    metadata: {},
  },
];

const updatedTelemetryAgent = {
  ...listTelemetryAgents[0],
  name: 'Mock Telemetry Agent1 Updated',
};

const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_CONTENT_VERSION}/range`;

export const telemetryAgent = [
  // GET list
  http.get(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');
    const limit = url.searchParams.get('limit');
    if (offset && limit) {
      const totalPages = Math.ceil(listTelemetryAgents.length / +limit);
      return HttpResponse.json(
        {
          totalCount: listTelemetryAgents.length,
          totalPages: totalPages,
          data: listTelemetryAgents,
        },
        { status: 200 },
      );
    } else {
      return HttpResponse.json(
        {
          totalCount: listTelemetryAgents.length,
          totalPages: 1,
          data: listTelemetryAgents,
        },
        { status: 200 },
      );
    }
  }),

  // GET specific
  http.get(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listTelemetryAgents[0], { status: 200 });
    },
  ),
  http.get(
    `${baseUrl}/${mockTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(listTelemetryAgents[1], { status: 200 });
    },
  ),
  // POST (create)
  http.post(`${baseUrl}/${mockTopic}`, ({ request, params, cookies }) => {
    return HttpResponse.json(listTelemetryAgents[0], { status: 200 });
  }),

  // PUT (update)
  http.put(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(updatedTelemetryAgent, { status: 200 });
    },
  ),

  // DELETE
  http.delete(
    `${baseUrl}/${mockTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
