/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  tAnsibleRoleCreate,
  AnsibleRoleUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyAnsibleRoles = 'ansible-roles';
export const queryKeyAnsibleRoleDownload = 'ansible-role-download';
export const useGetAnsibleRoles = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const metadata = getMetadataFilterParam(reqOptions);
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        params: { metadata },
        paramsSerializer(params) {
          return qs.stringify(params);
        },
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.ansibleRolesList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.publicUrl,
        reqOptions?.lang || '*',
        reqOptions?.other || '*',
        reqOptions?.part || '*',
        reqOptions?.product || '*',
        reqOptions?.softwareEdition || '*',
        reqOptions?.targetHardware || '*',
        reqOptions?.targetSoftware || '*',
        reqOptions?.update || '*',
        reqOptions?.vendor || '*',
        reqOptions?.version || '*',
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
        'An error occurred retrieving Ansible Roles',
      );
    }
  };

  return useQuery(
    [queryKeyAnsibleRoles, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetAnsibleRole = ({
  id,
  publicUrl,
}: {
  id: string;
  publicUrl?: boolean;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.ansibleRolesRetrieve(
        id,
        publicUrl,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ansible Role',
      );
    }
  };

  return useQuery([queryKeyAnsibleRoles, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostAnsibleRole = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: tAnsibleRoleCreate) => {
    try {
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        transformRequest: (data) => {
          if (formData.metadata) {
            data.set('metadata', JSON.stringify(formData.metadata));
          }
          return data;
        },
      };

      const response = await DevopsApiClient.ansibleRolesCreate(
        formData.name,
        formData.file,
        formData.systemCpeUuids,
        formData.description || '',
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        formData.scenarioGroups && formData.scenarioGroups?.length > 0
          ? formData.scenarioGroups
          : undefined,
        formData.roleVariablesSchema,
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Ansible Role',
      );
    }
  };

  return useMutation((formData: tAnsibleRoleCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAnsibleRoles);
      }
    },
  });
};

export const usePutAnsibleRole = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: AnsibleRoleUpdate) => {
    try {
      const response = await DevopsApiClient.ansibleRolesUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Ansible Role',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyAnsibleRoles);
      }
    },
  });
};

export const useDeleteAnsibleRole = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.ansibleRolesDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Ansible Role',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyAnsibleRoles);
      }
    },
  });
};

export const useGetAnsibleRoleDownload = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.ansibleRolesDownload(id, {
        ...queryHooksConfig,
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred downloading the Ansible Role',
      );
    }
  };
  return useQuery([queryKeyAnsibleRoleDownload, id], getResult, {
    ...defaultQueryConfig,
  });
};
