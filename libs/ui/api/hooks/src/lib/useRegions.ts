/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import {
  DevopsApiClient,
  EnvironmentAwsRegion,
} from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyEnvironmentRegions = 'environment-regions';

export const useGetRegions = () => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.environmentAwsGetRegions(queryHooksConfig);
      return response.data as EnvironmentAwsRegion[];
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Regions');
    }
  };

  return useQuery(queryKeyEnvironmentRegions, getResult, {
    ...defaultQueryConfig,
  });
};
