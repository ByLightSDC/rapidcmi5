/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';
export const queryKeyDnsServerTags = 'dns-server-tags';

export const useGetDnsServerTags = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.rangeDnsServersListTagSelectors(
        reqOptions?.offset,
        reqOptions?.limit,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the DNS Server Tags',
      );
    }
  };

  return useQuery(
    [queryKeyDnsServerTags, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
    },
  );
};

//No POST/PUT/DELETE available for DNS Server tags
