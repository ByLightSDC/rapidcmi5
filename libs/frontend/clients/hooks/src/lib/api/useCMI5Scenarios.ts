/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery } from 'react-query';

import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

import {
  ClassesListScenariosSortEnum,
  DevopsApiClient,
  ScenariosCreate1Request,
  ClassesListScenariosSortByEnum,
} from '@rangeos-nx/frontend/clients/devops-api';
export const queryKeyCMI5Scenarios = 'cmi5-scenarios';

export const useGetCMI5Scenarios = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.classesListScenarios(
        reqOptions?.classId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        reqOptions?.metadata,
        reqOptions?.tag,
        reqOptions?.deployedBy,
        reqOptions?.studentId,
        reqOptions?.studentUsername,
        reqOptions?.scenarioId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || ClassesListScenariosSortByEnum.Name,
        reqOptions?.sort || ClassesListScenariosSortEnum.Asc,
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

export const usePostInitializeCMI5Scenarios = () => {
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
