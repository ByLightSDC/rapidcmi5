/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';
export const queryKeyDnsZoneTags = 'dns-zone-tags';

export const useGetDnsZoneTags = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.rangeDnsZonesListTagSelectors(
        reqOptions?.offset,
        reqOptions?.limit,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the DNS Zone Tags',
      );
    }
  };

  return useQuery(
    [queryKeyDnsZoneTags, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
    },
  );
};

//No POST/PUT/DELETE available for DNS Zone tags
