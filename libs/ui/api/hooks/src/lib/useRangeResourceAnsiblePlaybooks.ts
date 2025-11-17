import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceAnsiblePlaybooks =
  'range-resource-ansible-playbooks';
export const useGetRangeResourceAnsiblePlaybooks = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.deployedRangeAnsiblePlaybooksList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.author,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.uuid,
        reqOptions?.schema,
        reqOptions?.ready,
        reqOptions?.status,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ansible Playbooks',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceAnsiblePlaybooks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceAnsiblePlaybook = ({
  rangeId,
  scenarioId,
  id,
  subDomain,
}: {
  rangeId: string;
  scenarioId: string;
  id: string;
  subDomain?: string;
}) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.deployedRangeAnsiblePlaybooksRetrieve(
          rangeId,
          scenarioId,
          id,
          queryHooksConfig,
        );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ansible Playbook',
      );
    }
  };

  return useQuery([queryKeyRangeResourceAnsiblePlaybooks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteRangeResourceAnsiblePlaybook = ({
  rangeId,
  scenarioId,
}: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      const response =
        await DevopsApiClient.deployedRangeAnsiblePlaybooksDelete(
          rangeId,
          scenarioId,
          uuid,
          queryHooksConfig,
        );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Ansible Playbook',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      deleteResult(rangeId, scenarioId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceAnsiblePlaybooks);
        }
      },
    },
  );
};
