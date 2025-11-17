/* Handlers for countryCodes endpoint */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const baseUrl = `${config.DEVOPS_API_URL}/v1`;

export const countryCodes = [
  // GET LIST
  http.get(`${baseUrl}/country-codes`, ({ request, params, cookies }) => {
    return HttpResponse.json(
      {
        countryCodes: [
          {
            country: 'Antarctica',
            alpha2: 'AQ',
            alpha3: 'ATA',
            numeric: '010',
          },
          {
            country: 'Costa Rica',
            alpha2: 'CR',
            alpha3: 'CRI',
            numeric: '188',
          },
          { country: 'Germany', alpha2: 'DE', alpha3: 'DEU', numeric: '276' },
          { country: 'Spain', alpha2: 'ES', alpha3: 'ESP', numeric: '724' },
          {
            country: 'Switzerland',
            alpha2: 'CH',
            alpha3: 'CHE',
            numeric: '756',
          },
          {
            country: 'United States of America',
            alpha2: 'US',
            alpha3: 'USA',
            numeric: '840',
          },
        ],
      },
      { status: 200 },
    );
  }),
];
