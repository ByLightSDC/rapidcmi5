/* eslint-disable @typescript-eslint/no-explicit-any */

import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  CourseMappingUpdate,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import { CourseMappingCreate } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyCourseMappings = 'course-mappings';

/**
 * list
 * @param reqOptions
 * @returns
 */
export const useGetCourseMappings = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      const metadata = getMetadataFilterParam(reqOptions);
      const options: AxiosRequestConfig = {
        ...queryHooksConfig,
        params: { metadata },
        paramsSerializer(params) {
          return qs.stringify(params);
        },
        authToken: reqOptions?.authToken,
      };

      const response = await DevopsApiClient.courseMappingList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.scenarioId,
        reqOptions?.courseId,
        reqOptions?.offset,
        reqOptions?.limit,
        reqOptions?.search,
        reqOptions?.sortBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving Course Mappings',
      );
    }
  };

  return useQuery(
    [queryKeyCourseMappings, reqOptions],
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
export const useGetCourseMapping = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.courseMappingRetrieve(
        id,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Course Mapping',
      );
    }
  };

  return useQuery([queryKeyCourseMappings, id], getResult, {
    ...defaultQueryConfig,
  });
};

/**
 * create
 * @returns
 */
export const usePostCourseMapping = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: CourseMappingCreate) => {
    try {
      const response = await DevopsApiClient.courseMappingCreate(
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Course Mapping',
      );
    }
  };

  return useMutation((formData: CourseMappingCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCourseMappings);
      }
    },
  });
};

export const usePutCourseMapping = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: CourseMappingUpdate) => {
    console.log('TRY usePutCourseMapping', formData);

    try {
      const response = await DevopsApiClient.courseMappingUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Course Mapping',
      );
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCourseMappings);
      }
    },
  });
};

/**
 * delete
 * @returns
 */
export const useDeleteCourseMapping = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.courseMappingDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Course Mapping',
      );
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyCourseMappings);
      }
    },
  });
};
