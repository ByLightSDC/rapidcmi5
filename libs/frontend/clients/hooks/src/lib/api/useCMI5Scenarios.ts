/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation } from 'react-query';

import {
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

import { DevopsApiClient, ScenariosCreate1Request } from '@rangeos-nx/frontend/clients/devops-api';
export const queryKeyCMI5Scenarios = 'cmi5-scenarios';

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

