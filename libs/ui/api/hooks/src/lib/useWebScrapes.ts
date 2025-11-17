/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useSelector } from 'react-redux';

import axios from 'axios';
import { LooseObject } from './types';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { defaultQueryConfig, getKASMUrl } from './config';
import { tWebScrapeCreate } from '@rangeos-nx/frontend/clients/devops-api';
// authToken required for api so we don't have to pass thru any shared component - disable to prevent eslintwarning
// eslint-disable-next-line @nx/enforce-module-boundaries
import { authToken } from '@rangeos-nx/ui/keycloak';
import { getErrorMessage } from './errorMessages';
export const queryKeyWebScrapes = 'web-scrapes';

export const useGetWebScrapes = (reqOptions?: any) => {
  const authTokenSel = useSelector(authToken);

  const config = {
    ...defaultQueryConfig,
    refetchInterval: reqOptions?.shouldPoll || false,
  };

  const getResult = async (reqOptions?: any) => {
    const config = {
      headers: {
        Authorization: `Bearer ${authTokenSel}`,
        'Content-Type': 'application/json',
      },
      port: 443,
    };

    try {
      const response = await axios.get(
        `${getKASMUrl()}/api/pcte/file_listing`,
        config,
      );
      const listContainerData = response.data as LooseObject;
      if (listContainerData.hasOwnProperty('files')) {
        // filtering by tgz Volumes/Files tab only accepts tgz files for uploading
        const filtered = listContainerData['files'].filter(
          (file: any) => file.name.indexOf('tgz') >= 0,
        );
        return filtered;
      }
      return [];
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Web Scrapes',
      );
    }
  };

  //header auth is different than our other endpoints
  return useQuery(
    [queryKeyWebScrapes, reqOptions],
    () => getResult(reqOptions),
    {
      ...config,
    },
  );
};

export const usePostWebScrape = () => {
  const authTokenSel = useSelector(authToken);
  const queryClient = useQueryClient();
  const postResult = async (formData: tWebScrapeCreate) => {
    const config = {
      headers: {
        Authorization: `Bearer ${authTokenSel}`,
        'Content-Type': 'application/json',
      },
      port: 443,
    };

    try {
      await axios.post<unknown>(
        `${getKASMUrl()}/api/pcte/create_scraper`,
        formData,
        config,
      );
      return true;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred creating the Web Scrapes',
      );
    }
  };

  return useMutation((formData: any) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyWebScrapes);
      }
    },
  });
};

export const useDownloadWebScrape = ({ filename }: { filename: string }) => {
  const authTokenSel = useSelector(authToken);
  const [percentComplete, setPercentComplete] = useState(0);

  const getResult = async () => {
    try {
      const result = await axios.get<Blob>(
        `${getKASMUrl()}/api/pcte/file_download?name=${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authTokenSel}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 100),
            );
            setPercentComplete(percentCompleted);
          },
        },
      );

      return result.data;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ??
        'An error occurred downloading the Web Scrape'
      );
    }
  };

  const query = useQuery(
    ['web-scrapes-download', 'web-scrapes-download'],
    getResult,
    {
      ...defaultQueryConfig,
    },
  );

  return {
    percentComplete,
    query,
  };
};
