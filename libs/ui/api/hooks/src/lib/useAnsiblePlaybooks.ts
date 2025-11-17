import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  AnsiblePlaybook,
  AnsiblePlaybookCreate,
  AnsiblePlaybookUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyAnsiblePlaybooks = 'ansible-playbooks';
export const useGetAnsiblePlaybooks = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.ansiblePlaybooksList(
        reqOptions?.author,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.uuid,
        reqOptions?.schema,
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
        'An error occurred retrieving Ansible Playbooks',
      );
    }
  };

  return useQuery(
    [queryKeyAnsiblePlaybooks, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetAnsiblePlaybook = ({
  id,
  publicUrl,
}: {
  id: string;
  publicUrl?: boolean;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.ansiblePlaybooksRetrieve(
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

  return useQuery([queryKeyAnsiblePlaybooks, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostAnsiblePlaybook = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: AnsiblePlaybookCreate) => {
    try {
      const response = await DevopsApiClient.ansiblePlaybooksCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Ansible Playbook',
      );
    }
  };

  return useMutation(
    (formData: AnsiblePlaybookCreate) => postResult(formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyAnsiblePlaybooks);
        }
      },
    },
  );
};

export const usePutAnsiblePlaybook = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: AnsiblePlaybookUpdate) => {
    try {
      const response = await DevopsApiClient.ansiblePlaybooksUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Ansible Playbook',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAnsiblePlaybooks);
      }
    },
  });
};

export const useDeleteAnsiblePlaybook = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.ansiblePlaybooksDelete(
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

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyAnsiblePlaybooks);
      }
    },
  });
};
