import { useQuery } from 'react-query';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { LmsApiClient } from '@rangeos-nx/frontend/clients/lms-api';
import { defaultQueryConfig, queryHooksConfig } from '../config';
import { getErrorMessage } from '../errorMessages';

export const queryKeyKSATs = 'ksats';

const defaultKsatSortBy = 'element_type';
const defaultKsatOrderBy = 'asc';
const defaultKsatElementTypes = ['knowledge', 'skill', 'task'];

/**
 * list
 * @param reqOptions
 * @returns
 */
export const useGetKSATs = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      // array of element_type(s) must be set into the AxiosRequestConfig
      let element_type = reqOptions.element_type;
      if (!element_type || element_type.length === 0) {
        // default to filter by all of the ones we allow
        element_type = defaultKsatElementTypes;
      }
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        params: { element_type },
        paramsSerializer(params) {
          return qs.stringify(params);
        },
        authToken: reqOptions?.authToken,
      };

      const response = await LmsApiClient.ksaTsList(
        undefined, // reqOptions?.element_type -- array must be set with paramsSerializer in options above
        reqOptions?.element_identifier,
        reqOptions?.title,
        reqOptions?.text,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultKsatSortBy,
        reqOptions?.sort || defaultKsatOrderBy,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving KSATs');
    }
  };

  return useQuery([queryKeyKSATs, reqOptions], () => getResult(reqOptions), {
    ...defaultQueryConfig,
    keepPreviousData: true,
  });
};
