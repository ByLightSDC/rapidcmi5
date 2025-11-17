/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';
import { config } from '@rangeos-nx/frontend/environment';
import { sortAlphabeticalByName } from '@rangeos-nx/ui/branded';
export const queryKeyCMI5Classes = 'cmi5-classes';

export const useGetCMI5Classes = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.scenariosListAllClasses(options);
      let classes: any[] = [];
      // to prevent possibility of a scrip error if data is NOT returned
      if (response.data && response.data.length > 0) {
        classes = response.data.map((cmi5Class: any) => {
          return {
            uuid: cmi5Class.name,
            name: cmi5Class.name,
            rangeId: cmi5Class.rangeId,
          };
        });
        // sorting manually since currently there are no sorts for classes
        classes.sort(sortAlphabeticalByName);
      }
      return {
        offset: 0,
        limit: 100,
        totalCount: classes.length,
        totalPages: 1,
        data: classes,
      };
      // return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving CMI5 Classes');
    }
  };

  return useQuery(
    [queryKeyCMI5Classes, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};
