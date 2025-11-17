/* 
Handlers for GraphQL queries
Subscriptions are NOT currently supported by MS 
*/
import { http, HttpResponse } from 'msw';

type tGraphReqBody = {
  operationName: string;
  query: string;
  variables: object;
};

export const graphQLQueries = [
  // GET LIST
  http.post(
    'https://graphql.global.cloudcents.bylight.com',
    async ({ request, params, cookies }) => {
      const data: any = await request.json();
      let opName = 'missing';
      if (data && data.hasOwnProperty('operationName')) {
        opName = data['operationName'];
      }
      //const reqBody = request.json(); // as tGraphReqBody;
      return HttpResponse.json(getGraphQLMockData(opName), {
        status: 200,
      });
    },
  ),
];

const getGraphQLMockData = (operationName: string) => {
  switch (operationName) {
    case 'Range':
      return [
        {
          data: {
            range: {
              uuid: '0801d77c-4346-4cb6-9921-cbd8e2bc6f5b',
              name: 'Michelles Mock Range',
              resources: [
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-mgqt7',
                  kind: 'LaunchTemplate',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-w67gf',
                  kind: 'LaunchTemplate',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-7rvjq',
                  kind: 'FileSystem',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-kzjmb',
                  kind: 'MountTarget',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-5k5w4',
                  kind: 'Instance',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-9ns6x',
                  kind: 'Instance',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-7tcg5',
                  kind: 'Instance',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-r8jz7',
                  kind: 'Instance',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-ph9bz',
                  kind: 'LBTargetGroup',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-k5z2d',
                  kind: 'LBTargetGroup',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-7fsmj',
                  kind: 'LBTargetGroupAttachment',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-n9n9s',
                  kind: 'LBTargetGroupAttachment',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-blrfh',
                  kind: 'LBTargetGroupAttachment',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-xnrkt',
                  kind: 'LB',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-7jr72',
                  kind: 'LBListener',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-lcwgj',
                  kind: 'LBListener',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-9w8cn',
                  kind: 'Cluster',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-m75d5',
                  kind: 'Object',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-t7bgs',
                  kind: 'Record',
                  ready: true,
                },
                {
                  name: 'michelles-test-range-0801d77c-4346-4cb6-9921-cbd8e2bc6f5b-cclr8',
                  kind: 'Object',
                  ready: true,
                },
              ],
            },
          },
        },
      ];
      break;
    default:
      return [];
  }
};
