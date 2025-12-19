import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery } from 'react-query';
import {
  AutoGrader,
  DevopsApiClient,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
  infiniteRecordLimit,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  AutoGraderEventData,
  AutoGraderEventResult,
} from './useAutoGraderResultsGraph';

export const queryKeyRangeResourceAutoGraders = 'range-resource-autograders';

/**
 * fix for BE breaking their API pattern
 */
export type DeployedAutoGrader = {
  uuid: string;
  autograder: AutoGrader | AutoGraderEventData;
  result?: AutoGraderEventResult;
};

export type AutoGraderMetadata = {
  rangeOsUI: {
    quizQuestion?: {
      questionId?: string;
      activityId?: string;
      questionType: AutoGraderQuestionTypeEnum;
      question?: string;
      answer?: string;
    };
  };
};

export enum AutoGraderQuestionTypeEnum {
  Individual = 'Individual CMI5',
  Collective = 'Collective',
}

export const useGetRangeResourceAutoGraders = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.deployedAutoGradersList(
        reqOptions?.rangeId,
        reqOptions?.scenarioId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.telemetryAgent,
        reqOptions?.offset,
        reqOptions?.limit || infiniteRecordLimit,
        reqOptions?.search,
        reqOptions?.sortBy || defaultSortOrderBy,
        reqOptions?.sort || defaultSortOrder,
        options,
      );

      const autoGraders: DeployedAutoGrader[] = [];

      if (response.data) {
        const data = response.data?.data;
        if (data && data.length > 0) {
          data.forEach((grader: AutoGrader) => {
            autoGraders.push({ uuid: grader.uuid || '', autograder: grader });
          });
        }
      }

      return autoGraders;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Auto Graders',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceAutoGraders, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};
