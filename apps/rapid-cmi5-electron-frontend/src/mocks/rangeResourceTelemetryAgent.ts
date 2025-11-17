/* Handlers for /rangeResourceTelemetryAgent endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const apiTopic = 'range-telemetry-agents';
const list = [
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

export const rangeResourceTelemetryAgent = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}`,
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
        return HttpResponse.json(
          {
            totalCount: list.length,
            totalPages: 1,
            data: list,
          },
          { status: 200 },
        );
      }
    },
  ),

  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[0], { status: 200 });
    },
  ),
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/22345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${apiTopic}/12345678-6fb7-4997-8f3c-70f0a335d5a3`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
