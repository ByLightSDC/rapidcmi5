/* Handlers for /virtual-machine-snapshots endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockVmId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const list = [
  {
    name: `${mockVmId}-mock-snapshot-jt99h`,
    creationTimestamp: '2024-05-06T16:23:34.000Z',
    vmName: mockVmId,
    rangeId: mockRangeId,
    scenarioId: mockScenarioId,
    phase: 'InProgress',
    readyToUse: false,
  },
  {
    name: `${mockVmId}-mock-snapshot-628p6`,
    creationTimestamp: '2024-04-22T15:23:09.000Z',
    vmName: mockVmId,
    rangeId: mockRangeId,
    scenarioId: mockScenarioId,
    phase: 'Succeeded',
    readyToUse: true,
  },
  {
    name: `${mockVmId}-mock-snapshot-failed`,
    creationTimestamp: '2024-04-06T16:23:34.000Z',
    vmName: mockVmId,
    rangeId: mockRangeId,
    scenarioId: mockScenarioId,
    phase: 'Failed',
    readyToUse: false,
  },
];

export const vmSnapshot = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/virtual-machine-snapshots/${mockVmId}`,
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

  // POST
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/virtual-machine-snapshots/${mockVmId}`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/virtual-machine-snapshots/${mockVmId}/${mockVmId}-mock-snapshot-jt99h`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
