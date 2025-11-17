/* Handlers for /range endpoints */
import { http, HttpResponse } from 'msw';

const map1 = {
  id: '09d42d27-569b-499d-a398-6e17bbd46ab7',
  name: 'Domain1',
  description: 'Domain1',
  packages: [
    {
      id: '06a9c079-8e3e-4a63-baa1-5e08dab1ebbd',
      template_id: '4bd3022f-9d7a-4f1e-9d8d-d5f6a8865a50',
      real: true,
      name: 'Corp-RTR',
    },
    {
      id: '287b6049-5c57-4fbb-905a-aade6bfa82c6',
      template_id: 'cc05250b-ed36-42a3-a912-e3b263ab6ccc',
      real: true,
      name: 'DC01',
    },
    {
      id: '70eac200-f4fb-4936-bbd1-ca433d797edc',
      template_id: '4da1ce06-ec6b-47d6-9bdf-29ab18d03053',
      real: true,
      name: 'DC02',
    },
  ],
};

export const scenarioMap = [
  http.get(
    `http://localhost:4200/scenario-map/xxx`,
    ({ request, params, cookies }) => {
      return HttpResponse.json(map1, { status: 200 });
    },
  ),
];
