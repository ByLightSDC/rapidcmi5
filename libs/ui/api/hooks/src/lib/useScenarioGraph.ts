import { useQuery, useMutation, useQueryClient } from 'react-query';
import { defaultQueryConfig, getGraphQLUrl, queryHooksConfig } from './config';
import { request, gql } from 'graphql-request';
import { getErrorMessage } from './errorMessages';

// #region Query Operations
const graphQuery = gql`
  query ExampleQuery(
    $uuid: String!
    $pckgUuids: [String!]
    $l3Uuids: [String!]
  ) {
    netmapScenario(uuid: $uuid) {
      name
      uuid
      netmapPackages(uuids: $pckgUuids) {
        name
        uuid
        containerSpecificationCollection {
          uuid
          name
        }
        netmapRangeL3Networks(uuids: $l3Uuids) {
          uuid
          name
          container {
            rangeContainers {
              uuid
            }
            rangeVms {
              uuid
            }
          }
          rangeNetwork {
            uuid
          }
        }
        rangeRouterCollection {
          uuid
          name
        }
        vmSpecificationCollection {
          uuid
          name
        }
        packageNetworkLinks {
          uuid
          rangeContainers {
            uuid
          }
          rangeL3Networks {
            uuid
          }
          rangeRouters {
            uuid
          }
          rangeVms {
            uuid
          }
        }
      }
      scenarioNetworkLinks {
        uuid
        packages {
          uuid
        }
      }
    }
  }
`;
// #endregion

/* Get Content for Specified Scenario */
export const useGetScenarioGraph = () => {
  const queryClient = useQueryClient();
  const getResult = async (
    uuid: string,
    pckgUuids: string[],
    l3Uuids: string[],
  ) => {
    try {
      const variables = {
        uuid: uuid,
        pckgUuids: pckgUuids,
        l3Uuids: l3Uuids,
      };
      const headers = { ...queryHooksConfig.headers };
      const response = await request(
        getGraphQLUrl(),
        graphQuery,
        variables,
        headers,
      );
      return response;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Scenario');
    }
  };

  return useMutation(
    ({ uuid, pckgUuids, l3Uuids }: any) => getResult(uuid, pckgUuids, l3Uuids),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries('scenario-graph');
        }
      },
    },
  );
};
