import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { authToken } from '@rangeos-nx/ui/keycloak';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { config } from '@rangeos-nx/frontend/environment';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
  getKASMUrl,
} from './config';
import {
  EventResource,
  EventResourceCreate,
  EventResourceUpdate,
} from './types';
import { getErrorMessage } from './errorMessages';
const baseUrl = `${config.DEVOPS_API_URL}/v1/content`;
const eventTopic = 'events';
const featureName = 'Resource';
const topic = 'resources';

export const queryKeyEventResources = 'event-resources';

export const useGetEventResources = ({ eventId }: { eventId: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<EventResource>(
        `${baseUrl}/${eventTopic}/${eventId}/${topic}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred retrieving the ${featureName}s`,
      );
    }
  };

  return useQuery([queryKeyEventResources, eventId], getResult, {
    ...defaultQueryConfig,
  });
};

export const useGetEventResource = ({
  id,
  eventId,
}: {
  id: string;
  eventId: string;
}) => {
  const getResult = async () => {
    try {
      const response = await axios.get<EventResource>(
        `${baseUrl}/${eventTopic}/${eventId}/${topic}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred retrieving the ${featureName}`,
      );
    }
  };

  return useQuery([queryKeyEventResources, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostEventResource = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const postResult = async (formData: EventResourceCreate) => {
    try {
      const configWithProgress = {
        ...queryHooksConfig,
        onUploadProgress: formData.onUploadProgress,
      };

      //REF const response = await DevopsApiClient.volumesCreate(
      //   formData.name,
      //   formData.description,
      //   formData.volumeType,
      //   formData.file,
      //   formData.onUploadProgress ? configWithProgress : queryHooksConfig
      // );
      const response = await axios.post<EventResource>(
        `${baseUrl}/${eventTopic}/${eventId}/${topic}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred creating the ${featureName}`,
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEventResources);
      }
    },
  });
};

export const usePutEventResource = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: EventResourceUpdate) => {
    try {
      //REF const response = await DevopsApiClient.volumesUpdate(
      //   uuid,
      //   formData,
      //   queryHooksConfig
      // );

      console.log(`${baseUrl}/${eventTopic}/${eventId}/${topic}/${uuid}`);
      const response = await axios.put<EventResource>(
        `${baseUrl}/${eventTopic}/${eventId}/${topic}/${uuid}`,
      );
      return response.data;
      return null;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred updating the ${featureName}`,
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEventResources);
      }
    },
  });
};

export const useDeleteEventResource = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const deleteResult = async (eventId: string, uuid: string) => {
    try {
      const response = await axios.delete<EventResource>(
        `${baseUrl}/${eventTopic}/${eventId}/${topic}/${uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        `An error occurred removing the ${featureName}`,
      );
    }
  };

  return useMutation(({ eventId, uuid }: any) => deleteResult(eventId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEventResources);
      }
    },
  });
};

export const useDownloadEventResource = ({ id }: { id: string }) => {
  const authTokenSel = useSelector(authToken);
  const [percentComplete, setPercentComplete] = useState(0);

  const getResult = async () => {
    try {
      const result = await axios.get<Blob>(
        `${getKASMUrl()}/api/pcte/file_download?name=${id}`,
        {
          headers: {
            Authorization: `Bearer ${authTokenSel}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 100),
            );
            setPercentComplete(percentCompleted);
          },
        },
      );

      return result.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ??
        'An error occurred downloading the Resource'
      );
    }
  };

  const query = useQuery(
    ['resource-download', 'resource-download'],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );

  return {
    percentComplete,
    query,
  };
};
