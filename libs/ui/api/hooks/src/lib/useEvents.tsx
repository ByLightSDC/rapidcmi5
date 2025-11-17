import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useCache } from '@rangeos-nx/ui/branded';
import { config } from '@rangeos-nx/frontend/environment';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import {
  LiveActionEvent,
  JoinedParticipant,
  ScoreCard,
  ScoreCardUpdate,
} from './types';
import { getErrorMessage } from './errorMessages';
const baseUrl = `${config.DEVOPS_API_URL}/v1/content`;
const topic = 'events';
export const queryKeyEvents = 'events';
export const queryKeyEventScoreCard = 'event-scorecard';
export const queryKeyEventParticipants = 'joined-participants';

export const useGetEvents = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await axios.get<LiveActionEvent>(`${baseUrl}/${topic}`);
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Events');
    }
  };

  return useQuery([queryKeyEvents, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};

export const useGetEvent = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<LiveActionEvent>(
        `${baseUrl}/${topic}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Event');
    }
  };

  return useQuery([queryKeyEvents, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostEvent = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: any) => {
    try {
      const response = await axios.post<LiveActionEvent>(
        `${baseUrl}/${topic}/`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Event');
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEvents);
      }
    },
  });
};

export const usePutEvent = () => {
  const queryClient = useQueryClient();
  const putResult = async (formData: any) => {
    try {
      const response = await axios.put<LiveActionEvent>(
        `${baseUrl}/${topic}/${formData.uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Event');
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEvents);
      }
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await axios.delete<LiveActionEvent>(
        `${baseUrl}/${topic}/${uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Event');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEvents);
      }
    },
  });
};

export const usePostPauseEvent = () => {
  const queryClient = useQueryClient();
  const queryCache = useCache();
  const postResult = async (uuid: string) => {
    try {
      const response = await axios.post<LiveActionEvent>(
        `${baseUrl}/${topic}/${uuid}/pause`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred pausing the Event');
    }
  };

  return useMutation(({ uuid }: any) => postResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        //TEMP queryCache.putObjInArray(queryKeyRangeResourceContainers + '-' + rangeId, scenarioId, data);
        //queryClient.invalidateQueries([queryKeyRangeResourceContainers + '-' + rangeId, scenarioId]);
      }
    },
  });
};

export const usePostResumeEvent = () => {
  const queryCache = useCache();
  const postResult = async (uuid: string) => {
    try {
      const response = await axios.post<LiveActionEvent>(
        `${baseUrl}/${topic}/${uuid}/resume`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred resuming the Event');
    }
  };

  return useMutation(({ uuid }: any) => postResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        //TEMP we may use this to replace modifying cache directly
        //const queryClient = useQueryClient();
        //queryClient.invalidateQueries([queryKeyRangeResourceContainers + '-' + rangeId, scenarioId]);
      }
    },
  });
};

export const usePostStopEvent = () => {
  const queryCache = useCache();
  const postResult = async (uuid: string) => {
    try {
      const response = await axios.post<LiveActionEvent>(
        `${baseUrl}/${topic}/${uuid}/stop`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred stopping the Event');
    }
  };

  return useMutation(({ uuid }: any) => postResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        //TEMP we may use this to replace modifying cache directly
        //const queryClient = useQueryClient();
        //queryClient.invalidateQueries([queryKeyRangeResourceContainers + '-' + rangeId, scenarioId]);
      }
    },
  });
};

export const useGetEventScoreCard = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<ScoreCard>(
        `${baseUrl}/${topic}/${id}/scorecard`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the ScoreCard',
      );
    }
  };

  return useQuery([queryKeyEventParticipants, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePutEventScoreCard = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const putResult = async (formData: any) => {
    try {
      const response = await axios.put<ScoreCardUpdate>(
        `${baseUrl}/${topic}/${id}/scorecard`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the ScoreCard');
    }
  };

  return useMutation((formData: any) => putResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEventParticipants);
      }
    },
  });
};

export const useGetEventParticipants = ({ eventId }: { eventId: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<JoinedParticipant>(
        `${baseUrl}/${topic}/${eventId}/participants`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Participants',
      );
    }
  };

  return useQuery([queryKeyEventParticipants, eventId], getResult, {
    ...defaultQueryConfig,
  });
};

export const useDeleteEventParticipant = ({ eventId }: { eventId: string }) => {
  const queryClient = useQueryClient();
  const deleteResult = async (eventId: string, uuid: string) => {
    try {
      const response = await axios.delete<JoinedParticipant>(
        `${baseUrl}/${topic}/${eventId}/participants/${uuid}`,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred removing the Participant',
      );
    }
  };

  return useMutation(({ eventId, uuid }: any) => deleteResult(eventId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyEventParticipants);
      }
    },
  });
};
