/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyRangeResourceGhostMachines =
  'range-resource-ghost-machines';
export const useGetRangeResourceGhostMachines = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.deployedGhostMachinesList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ghost Machines',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceGhostMachines, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceGhostMachine = ({
  rangeId,
  scenarioId,
  uuid,
}: {
  rangeId: string;
  scenarioId: string;
  uuid: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.deployedGhostMachinesRetrieve(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Ghost Machine',
      );
    }
  };

  return useQuery([queryKeyRangeResourceGhostMachines, uuid], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostStartRangeResourceGhostMachine = () => {
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      await DevopsApiClient.deployedGhostMachinesStartMachine(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return {}; // there is no data in response, so send something so success will be noticed
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred starting traffic on Ghost Machine',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      //#REF since machine status isn't changed, don't invalidate query
    },
  );
};

export const usePostStopRangeResourceGhostMachine = () => {
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
  ) => {
    try {
      await DevopsApiClient.deployedGhostMachinesStopMachine(
        rangeId,
        scenarioId,
        uuid,
        queryHooksConfig,
      );
      return {}; // there is no data in response, so send something so success will be noticed
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred stopping traffic on Ghost Machine',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid }: any) =>
      postResult(rangeId, scenarioId, uuid),
    {
      //#REF since machine status isn't changed, don't invalidate query
    },
  );
};

export const usePostPublishRangeResourceGhostMachineProfile = () => {
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    uuid: string,
    trafficProfileId: string,
  ) => {
    try {
      await DevopsApiClient.deployedGhostMachinesPublishTrafficProfile(
        rangeId,
        scenarioId,
        uuid,
        { ghostTrafficProfileId: trafficProfileId },
        queryHooksConfig,
      );
      return {}; // there is no data in response, so send something so success will be noticed
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred publishing traffic profile to Ghost Machine',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, uuid, trafficProfileId }: any) =>
      postResult(rangeId, scenarioId, uuid, trafficProfileId),
    {
      //#REF since machine status isn't changed, don't invalidate query
    },
  );
};
