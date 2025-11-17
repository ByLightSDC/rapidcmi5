/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyCMI5CourseRegistrations = 'cmi5-course-registrations';

/**
 * list
 * @param reqOptions
 * @returns
 */
export const useGetCourseRegistrations = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const options = {
        ...queryHooksConfig,
        authToken: reqOptions?.authToken,
      };
      const response = await DevopsApiClient.cmi5CourseRegistrationList(
        reqOptions?.author,
        reqOptions?.dateCreated,
        reqOptions?.dateEdited,
        reqOptions?.scenarioId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving Course Registrations',
      );
    }
  };

  return useQuery(
    [queryKeyCMI5CourseRegistrations, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

/**
 * retrieve
 * @param param0
 * @returns
 */
export const useGetCourseRegistration = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.cmi5CourseRegistrationRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Course Registration',
      );
    }
  };

  return useQuery([queryKeyCMI5CourseRegistrations, id], getResult, {
    ...defaultQueryConfig,
  });
};
