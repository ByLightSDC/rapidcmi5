/* Handlers for /virtual-machine-restores endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';
import { mockScenarioId } from './rangeResourceScenario';
const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockVmId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const list = [
  {
    name: `${mockVmId}-mock-restore-wqn7f`,
    creationTimestamp: '2024-05-14T13:46:16.000Z',
    vmName: mockVmId,
    rangeId: mockRangeId,
    scenarioId: mockScenarioId,
    snapshotName: `${mockVmId}-mock-snapshot-628p6`,
    volumeName: `${mockVmId}-disk0`,
    claimName: `restore-05b03fa6-1aa0-4c5c-ae1a-8c074d788711-${mockVmId}-disk0`,
    volumeSnapshotName: `vmsnapshot-2c5fa921-6772-4031-983a-1c78e1977acb-volume-${mockVmId}-disk0`,
    complete: true,
    status: 'True',
    type: 'Ready',
  },
  {
    name: `${mockVmId}-mock-restore-jt99h`,
    creationTimestamp: '2024-05-13T13:46:16.000Z',
    vmName: mockVmId,
    rangeId: mockRangeId,
    scenarioId: mockScenarioId,
    snapshotName: `${mockVmId}-mock-snapshot-jt99h`,
    volumeName: `${mockVmId}-disk0`,
    claimName: `restore-05b03fa6-1aa0-4c5c-ae1a-8c074d788711-${mockVmId}-disk0`,
    volumeSnapshotName: `vmsnapshot-2c5fa921-6772-4031-983a-1c78e1977acb-volume-${mockVmId}-disk0`,
    complete: true,
    status: 'True',
    type: 'Failure',
    message: 'Error restoring snapshot',
  },
];

export const vmRestore = [
  // GET list
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${mockVmId}/virtual-machine-restores`,
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
  // restore to VM Snapshot
  http.post(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${mockVmId}/virtual-machine-restores/${mockVmId}-mock-snapshot-628p6`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(list[1], { status: 200 });
    },
  ),

  //DELETE
  http.delete(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/${mockVmId}/virtual-machine-restores/${mockVmId}-mock-restore-wqn7f`,
    ({ request, params, cookies }) => {
      return HttpResponse.json({}, { status: 200 });
    },
  ),
];
