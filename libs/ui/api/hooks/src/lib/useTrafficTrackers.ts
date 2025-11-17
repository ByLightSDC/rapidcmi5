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
  TrafficTracker,
  TrafficTrackerCreate,
  TrafficTrackerUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyTrafficTrackers = 'traffic-trackers';
export const useGetTrafficTrackers = (reqOptions?: any) => {
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
      const response = await DevopsApiClient.trafficTrackersList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
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
        'An error occurred retrieving the Traffic Trackers',
      );
    }
  };

  return useQuery(
    [queryKeyTrafficTrackers, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetTrafficTracker = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.trafficTrackersRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Traffic Tracker',
      );
    }
  };

  return useQuery([queryKeyTrafficTrackers, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostTrafficTracker = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: TrafficTrackerCreate) => {
    try {
      const response = await DevopsApiClient.trafficTrackersCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Traffic Tracker',
      );
    }
  };

  return useMutation((formData: TrafficTrackerCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyTrafficTrackers);
      }
    },
  });
};

export const usePutTrafficTracker = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: TrafficTrackerUpdate) => {
    try {
      const response = await DevopsApiClient.trafficTrackersUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Traffic Tracker',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyTrafficTrackers);
      }
    },
  });
};

export const useDeleteTrafficTracker = (
  uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
  skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
) => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.trafficTrackersDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Traffic Tracker',
      );
    }
  };

  return useMutation((uuid: any) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (skipInvalidate) {
          return;
        }
        queryClient.invalidateQueries(queryKeyTrafficTrackers);
      }
    },
  });
};
