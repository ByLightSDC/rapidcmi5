/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from 'react-query';
import {
  DevopsApiClient,
  tCountryCodes,
} from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

const queryRefreshMs = 24 * 60 * 60 * 1000;

export const queryKeyCountryCodes = 'country-codes';

export const useGetCountryCodes = () => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.countryCodesList(queryHooksConfig);
      // the actual country code list is inside of data
      const countryCodes = response.data.countryCodes
        ? (response.data.countryCodes as tCountryCodes[])
        : [];

      // format to a standard label/value list for UI to consume
      let countryList: { label: string; value: string }[] = [];
      countryCodes.forEach((country: any) => {
        countryList.push({ label: country.country, value: country.alpha2 });
      });

      // put US at the top
      const usIndex = countryList.findIndex((item) => item.value === 'US');
      if (usIndex > 0) {
        countryList.unshift(countryList.splice(usIndex, 1)[0]);
      }

      return countryList;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the list of country codes',
      );
    }
  };

  return useQuery(queryKeyCountryCodes, getResult, {
    ...defaultQueryConfig,
    staleTime: queryRefreshMs,
    cacheTime: queryRefreshMs,
  });
};
