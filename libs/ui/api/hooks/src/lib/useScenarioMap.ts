/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyScenarioMap = 'scenario-map';

export const useGetScenarioMap = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await axios.get<unknown>(
        `http://localhost:4200/scenario-map/${id}`,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Scenario Map',
      );
    }
  };

  return useQuery([queryKeyScenarioMap, id], getResult, {
    ...defaultQueryConfig,
  });
};
