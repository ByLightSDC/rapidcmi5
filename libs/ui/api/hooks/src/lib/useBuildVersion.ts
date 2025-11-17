import { useQuery } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import { defaultQueryConfig, queryHooksConfig } from './config';
import { getErrorMessage } from './errorMessages';

export const queryKeyBuildVersion = 'build-version';

export const useGetBuildVersion = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const options = {
        ...queryHooksConfig,
      };
      const response = await DevopsApiClient.versionRetrieve(options);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Build Version',
      );
    }
  };

  return useQuery([queryKeyBuildVersion, id], getResult, {
    ...defaultQueryConfig,
  });
};
