/* Query Auto Grader Results from Graph QL */
export type AutoGraderEvent = {
  autoGrader: AutoGraderEventData;
  result: AutoGraderEventResult;
};

export type AutoGraderEventData = {
  name: string;
  telemetryAgent: string;
  uuid: string;
  metadata: {
    rangeOsUI?: {
      quizQuestion?: {
        question: string;
        activityId: string;
        questionId: string;
        questionType: 'Individual' | 'Collective' | string;
      };
    };
  };
};

export type AutoGraderEventResult = {
  answers: {
    performance: number;
    [key: string]: number;
  };
  success: boolean;
};

// #REF - currently no query - only subscription
// import { useQuery } from 'react-query';
// import {
//   defaultQueryConfig,
//   getGraphQLUrl,
//   getIsMSWMock,
//   infiniteRecordLimit,
//   queryHooksConfig,
// } from './config';
// import { request, gql } from 'graphql-request';
// import { getErrorMessage } from './errorMessages';
export const queryKeyAutoGraderResultsGraph = 'autograder-results-graph';

export const graphqlAutoGraderResultsFields = `
       result {
          answers
          success
        }
        autoGrader {
          name
          telemetryAgent
          uuid
          metadata
        }
`;
// #REF - currently there is NOT a graphql query - onlyt the subscription
// const autoGraderResultsQuery = gql`
//   query AutoGraderResults($rangeId: String!, $scenarioId: String!, $limit: Int) {
//     autoGraderResults(rangeId: $rangeId, scenarioId: $scenarioId, limit: $limit) {
//       ${graphqlAutoGraderResultsFields}
//     }
//   }
// `;

/* Get AutoGraders for specified range/scenario */
// export const useGetAutoGraderResultsGraph = (
//   rangeId: string,
//   scenarioId: string,
// ) => {
//   const getResult = async () => {
//     try {
//       const variables = {
//         rangeId: rangeId,
//         scenarioId: scenarioId,
//         //#REF PRETEND ERROR
//         // scenarioId: '12345678-6fb7-4997-8f3c-70f0a335d5a3',
//         limit: infiniteRecordLimit, //#REF - we want to get all - see CCR-1322
//       };
//       const headers = { ...queryHooksConfig.headers };
//       const response = await request(
//         getGraphQLUrl(),
//         autoGraderResultsQuery,
//         variables,
//         headers,
//       );
//       return response;
//     } catch (error: any) {
//       //Supports Mocking GraphQL Queries Using Rest Methods
//       if (getIsMSWMock()) {
//         if (error.response?.status === 200 && error.response) {
//           //Not really an error so return data is if there was no error
//           // eslint-disable-next-line no-prototype-builtins
//           if (error.response.hasOwnProperty('0')) {
//             return error.response['0'].data;
//           }
//         }
//       }
//       throw getErrorMessage(
//         error,
//         'An error occurred retrieving the Range Scenario Auto Graders',
//       );
//     }
//   };

//   return useQuery(['queryKeyAutoGraderResultsGraph', scenarioId], getResult, {
//     ...defaultQueryConfig,
//   });
// };
