import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  DevopsApiClient,
  DraftStateCreate,
} from '@rangeos-nx/frontend/clients/devops-api';
import { config } from '@rangeos-nx/frontend/environment';
import axios from 'axios';
const pako = require('pako');

export const queryKeyDraftStates = 'draftstates';
export const useGetDraftStates = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        query_cache_size: 0,
        query_cache_type: 0,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.draftStatesList(
        reqOptions?.draftId,
        reqOptions?.uuid,
        reqOptions?.published,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || 'dateCreated',
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Draft States',
      );
    }
  };

  return useQuery(
    [queryKeyDraftStates, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      ...reqOptions?.queryConfig,
    },
  );
};

export const useGetDraftState = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.draftStatesRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Draft State',
      );
    }
  };

  return useQuery([queryKeyDraftStates, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostDraftState = () => {
  const queryClient = useQueryClient();
  const postResult = async (draftId: string, formData: DraftStateCreate) => {
    try {
      if (formData.publish) {
        console.log('payload', formData);
      }
      const baseUrl = `${config.DEVOPS_API_URL}${config.DEVOPS_API_DESIGN_VERSION}/drafts`;
      const str = JSON.stringify(formData, null, 0);
      const utf8Data = new TextEncoder().encode(str);
      const gzipper = pako.gzip(utf8Data);
      const response = await axios.post(
        `${baseUrl}/${draftId}/states`,
        gzipper,
        {
          headers: {
            Authorization: `Bearer ${queryHooksConfig.headers.Authorization}`,
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Draft State',
      );
    }
  };

  return useMutation(
    ({ draftId, formData }: any) => postResult(draftId, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyDraftStates);
        }
      },
    },
  );
};

export const useDeleteDraftState = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (draftId: string, uuid: string) => {
    try {
      const response = await DevopsApiClient.draftStatesDelete(
        draftId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Draft State',
      );
    }
  };

  return useMutation(({ draftId, uuid }: any) => deleteResult(draftId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyDraftStates);
      }
    },
  });
};
