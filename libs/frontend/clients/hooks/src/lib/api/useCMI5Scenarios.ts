/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery, useMutation } from 'react-query';

import {
  defaultQueryConfig,
  defaultSortByOptions,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

import { DevopsApiClient, ScenariosCreate1Request, ScenariosDeployRequest } from '@rangeos-nx/frontend/clients/devops-api';
export const queryKeyCMI5Scenarios = 'cmi5-scenarios';

export const useGetCMI5Scenarios = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.scenariosList1(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        reqOptions?.metadata,
        reqOptions?.tag,
        reqOptions?.deployedBy,
        reqOptions?.classId,
        reqOptions?.studentId,
        reqOptions?.studentUsername,
        reqOptions?.scenarioId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortByOptions,
        reqOptions?.sort || defaultSortOrder,
        undefined, // includes
        options,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving CMI5 Scenarios',
      );
    }
  };

  return useQuery(
    [queryKeyCMI5Scenarios, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const usePostCMI5Scenarios = (formData: any) => {
  const postResult = async (formData: any) => {
    const scenarioDeployRequest: ScenariosDeployRequest = {
      classId: formData.classId,
      count: formData.count,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
    try {
      const response = await DevopsApiClient.scenariosDeploy(
        formData.scenarioId,
        scenarioDeployRequest,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred Deploying Scenarios');
    }
  };

  return useMutation((formData: any) => postResult(formData), {});
};

export const usePostInitializeCMI5Scenarios = (formData: any) => {
  const postResult = async (formData: any) => {
    const req: ScenariosCreate1Request = {
      classId: formData.classId,
      startDate: formData.startDate,
      endDate: formData.endDate,
    };
    try {
      const response = await DevopsApiClient.scenariosCreate1(
        req,
        queryHooksConfig,
      );

      if (
        response.data.deployedScenarios?.length === 0 &&
        response.data.scheduledScenarios?.length === 0
      ) {
        throw new Error(
          `No deployed scenarios found for Class Id ${formData.classId}`,
        );
      }

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred Initializing Scenarios');
    }
  };

  return useMutation((formData: any) => postResult(formData), {});
};
