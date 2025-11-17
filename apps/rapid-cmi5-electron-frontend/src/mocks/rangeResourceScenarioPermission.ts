/* Handlers for /containers endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const mockRangeId = '12345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockSecondRangeId = '22345679-6fb7-4997-8f3c-70f0a335d5a3';
const mockParentScenarioId = '12345678-6fb7-4997-8f3c-70f0a335d5a3';
export const mockScenarioId = '11145679-6fb7-4997-8f3c-70f0a335d5a3';

const rangeScenarioPermissions = {
  dateCreated: '2024-09-19T14:52:44.000Z',
  dateEdited: '2024-09-19T21:09:41.662Z',
  blueCell: ['marilyn.stuck'],
  redCell: ['a_gabele'],
  whiteCell: [],
  scenarioAdmin: ['michelle.gabele'],
};

export const rangeResourceScenarioPermission = [
  // GET specific
  http.get(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/permissions`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(rangeScenarioPermissions, { status: 200 });
    },
  ),

  // PUT (update)
  http.put(
    `${config.DEVOPS_API_URL}/v1/manage/range/${mockRangeId}/scenarios/${mockScenarioId}/permissions`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(rangeScenarioPermissions, { status: 200 });
    },
  ),
];
