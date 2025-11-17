/* Handlers for web scrape endpoints */
import { http, HttpResponse } from 'msw';
import { config } from '@rangeos-nx/frontend/environment';

const list = {
  files: [
    {
      name: 'Mock google.com-1665089922033.tgz',
      created: '2022-10-06 20:58:42',
      size: 2336026,
    },
    {
      name: 'Mock google.com-Second 1665089922033.tgz',
      created: '2022-10-06 20:58:42',
      size: 2336026,
    },
    {
      name: 'Mock google.com-1665089922033.zip',
      created: '2022-10-06 20:58:42',
      size: 2336026,
    },
    {
      name: 'Mock google.com-Second 1665089922033.zip',
      created: '2022-10-06 20:58:42',
      size: 2336026,
    },
  ],
};

const single = {
  name: 'google.com-1665089922033.zip',
  created: '2022-10-06 20:58:42',
  size: 2336026,
};

const postResponse = {
  kasm_id: '673c0a1a-f8f8-48bc-9ccb-792f02f064ed',
  status: 'starting',
  user_id: '3d5046f8f7b943079cb9c871b0745255',
  username: 'michelle.gabele@bylight.com',
  session_token: '5bba3c80-21cb-4b46-a643-df4ed53ebb35',
  kasm_url:
    '/#/connect/kasm/673c0a1a-f8f8-48bc-9ccb-792f02f064ed/3d5046f8f7b943079cb9c871b0745255/5bba3c80-21cb-4b46-a643-df4ed53ebb35',
};

const downloadFileName = 'Mock google.com-1665089922033.zip';
const downloadBlob = new Blob(['testing'], { type: 'tar' });

let kasmMockUrl = 'https://starion.kasmweb.com/api/pcte';
const downloadUrl = 'https://starion.kasmweb.com/api/pcte/file_download';

export const webScrape = [
  // GET list
  http.get(`${kasmMockUrl}/file_listing`, ({ request, params, cookies }) => {
    return HttpResponse.json(list, { status: 200 });
  }),

  // POST (create)
  http.post(`${kasmMockUrl}/create_scraper`, ({ request, params, cookies }) => {
    return HttpResponse.json(single, { status: 200 });
  }),

  //Depends on POST mock in volume
  //REF
  // http.post(`${config.DEVOPS_API_URL}/volumes`, ({ request, params, cookies }) => {
  //   return HttpResponse.json({
  //   author: 'striar.yunis@bylight.com',
  //   description: 'Describe volume 1',
  //   dateCreated: '2022-08-31T17:45:33.017Z',
  //   dateEdited: '2022-08-31T17:45:33.017Z',
  //   size: 100,
  //   volumeType: 'ftp',
  //   name: 'Mock Volume 3',
  //   uuid: '32345678-6fb7-4997-8f3c-70f0a335d5a3',
  // }, { status: 200 });

  // DOWNLOAD (create)
  http.get(downloadUrl, ({ request, params, cookies }) => {
    //REF const fileName = req.url.searchParams.get('name');
    return HttpResponse.json({}, { status: 200 });
    // return HttpResponse.json(null, { status: 400 });
  }),
];
