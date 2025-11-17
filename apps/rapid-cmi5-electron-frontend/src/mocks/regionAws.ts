/* Handlers for /environment-specifications/aws/regions endpoint */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1/manage/infrastructure`;

export const regionAws = [
  // GET LIST
  http.get(
    `${baseUrl}/environments/aws/regions`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(
        [
          { region: 'us-west-1', zones: ['us-west-1a', 'us-west-1b'] },
          { region: 'us-west-2', zones: ['us-west-2a', 'us-west-2b'] },
          {
            region: 'us-east-1',
            zones: ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d'],
          },
          { region: 'us-east-2', zones: ['us-east-2a', 'us-east-2b'] },
        ],
        { status: 200 },
      );
    },
  ),
];
