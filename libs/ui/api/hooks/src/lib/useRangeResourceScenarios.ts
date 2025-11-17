/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  DeployedScenarioPermission,
  DevopsApiClient,
  ScenariosUpdateByRangeIdUuidRequest,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrder,
  queryHooksConfig,
  infiniteRecordLimit,
  getMetadataFilterParam,
} from './config';
import { getErrorMessage, getErrorMessageDetail } from './errorMessages';
import {
  ScenariosCreateByRangeIdRequest,
  ScenariosValidateRequest,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyRangeResourceScenarios = 'range-resource-scenarios';
export const queryKeyRangeResourceScenarioPermissions =
  'range-resource-scenario-permissions';
export const queryKeyRangeResourceScenarioOverrides =
  'range-resource-scenario-overrides';
//TODO consider adding rangeId to the key
//const queryKeyPlusRange = queryKey + '-' + reqOptions?.rangeId;

export const useGetRangeResourceScenarios = (reqOptions?: any) => {
  const getResult = async () => {
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

      const response = await DevopsApiClient.scenariosListByRangeId(
        reqOptions?.rangeId,
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.tag,
        reqOptions?.deployedBy,
        reqOptions?.classId,
        reqOptions?.studentId,
        reqOptions?.studentUsername,
        reqOptions?.scenarioId,
        reqOptions?.offset,
        reqOptions?.limit || infiniteRecordLimit,
        reqOptions?.search,
        reqOptions?.sortBy || 'dateCreated', // this is the date the scenario was deployed
        reqOptions?.sort || defaultSortOrder,
        reqOptions?.includes,
        options,
      );
      return response.data;
    } catch (error: any) {
      //only showing error is too vague
      //add detail for context
      throw getErrorMessageDetail(
        error,
        'An error occurred retrieving the Scenarios for this range',
      );
    }
  };

  return useQuery(
    [queryKeyRangeResourceScenarios, reqOptions?.rangeId, reqOptions], // any reqOptions to handle paging
    getResult,
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetRangeResourceScenario = ({
  id,
  rangeId,
}: {
  id: string;
  rangeId: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.scenariosRetrieveByRangeIdUuid(
        rangeId,
        id,
        undefined,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Scenario');
    }
  };

  return useQuery([queryKeyRangeResourceScenarios, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostRangeResourceScenario = () => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    formData: ScenariosCreateByRangeIdRequest,
  ) => {
    try {
      const response = await DevopsApiClient.scenariosCreateByRangeId(
        rangeId,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deploying the Scenario to this range',
      );
    }
  };

  return useMutation(
    ({ rangeId, formData }: any) => postResult(rangeId, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceScenarios);
        }
      },
    },
  );
};

export const usePutRangeResourceScenario = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    rangeId: string,
    uuid: string,
    formData: ScenariosUpdateByRangeIdUuidRequest,
  ) => {
    try {
      //delete values if they are not present
      //TODO CCUI-589 Synch Deployed Scenario
      // if (formData.values && Object.keys(formData.values).length === 0) {
      //   delete formData.values;
      // }

      const response = await DevopsApiClient.scenariosUpdateByRangeIdUuid(
        rangeId,
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred redeploying the Scenario',
      );
    }
  };

  return useMutation(
    ({ rangeId, uuid, formData }: any) => putResult(rangeId, uuid, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceScenarios);
          queryClient.invalidateQueries(queryKeyRangeResourceScenarioOverrides);
        }
      },
    },
  );
};

export const useDeleteRangeResourceScenario = ({
  rangeId,
  uuid,
  shouldInvalidate = false, // since we use graphql - don't need to invalidate on delete - just add/update
}: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (rangeId: string, uuid: string) => {
    try {
      const response = await DevopsApiClient.scenariosDeleteByRangeIdUuid(
        rangeId,
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the Scenario from this range',
      );
    }
  };

  return useMutation(({ rangeId, uuid }: any) => deleteResult(rangeId, uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        if (shouldInvalidate) {
          queryClient.invalidateQueries([queryKeyRangeResourceScenarios]);
        }
      }
    },
  });
};

export const useStartRangeResourceScenario = ({
  rangeId,
  uuid,
  shouldInvalidate = false, // since we use graphql - don't need to invalidate on delete - just add/update
}: any) => {
  const queryClient = useQueryClient();
  const postResult = async (rangeId: string, uuid: string) => {
    try {
      const response = await DevopsApiClient.scenariosStart(
        rangeId,
        uuid,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred starting the Scenario');
    }
  };

  return useMutation(
    ({ rangeId, uuid, formData }: any) => postResult(rangeId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          if (shouldInvalidate) {
            queryClient.invalidateQueries([queryKeyRangeResourceScenarios]);
          }
        }
      },
    },
  );
};

export const useStopRangeResourceScenario = ({
  rangeId,
  uuid,
  shouldInvalidate = false, // since we use graphql - don't need to invalidate on delete - just add/update
}: any) => {
  const queryClient = useQueryClient();
  const postResult = async (rangeId: string, uuid: string) => {
    try {
      const response = await DevopsApiClient.scenariosStop(
        rangeId,
        uuid,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred stopping the Scenario');
    }
  };

  return useMutation(
    ({ rangeId, uuid, formData }: any) => postResult(rangeId, uuid),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          if (shouldInvalidate) {
            queryClient.invalidateQueries([queryKeyRangeResourceScenarios]);
          }
        }
      },
    },
  );
};

export const useGetRangeResourceScenarioOverrides = ({
  id,
  rangeId,
}: {
  id: string;
  rangeId: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.scenariosRetrieveScenarioOverrides(
        rangeId,
        id,
        queryHooksConfig,
      );
      return response.data || {}; // handles if backend returns nothing
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Scenario Overrides for this range',
      );
    }
  };

  return useQuery([queryKeyRangeResourceScenarioOverrides, id], getResult, {
    ...defaultQueryConfig,
  });
};

//Permissions

export const useGetRangeResourceScenarioPermissions = ({
  id,
  rangeId,
}: {
  id: string;
  rangeId: string;
}) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.scenarioPermissionsRetrieve(
        rangeId,
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Permissions for this Scenario ',
      );
    }
  };

  return useQuery([queryKeyRangeResourceScenarioPermissions, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePutRangeResourceScenarioPermissions = () => {
  const queryClient = useQueryClient();
  const putResult = async (
    rangeId: string,
    uuid: string,
    formData: DeployedScenarioPermission,
  ) => {
    try {
      const response = await DevopsApiClient.scenarioPermissionsUpdate(
        rangeId,
        uuid,
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred updating the Scenario Permissions',
      );
    }
  };

  return useMutation(
    ({ rangeId, uuid, formData }: any) => putResult(rangeId, uuid, formData),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(
            queryKeyRangeResourceScenarioPermissions,
          );
        }
      },
    },
  );
};

export const usePostUserToScenarioPermission = () => {
  const queryClient = useQueryClient();
  const postResult = async (
    rangeId: string,
    scenarioId: string,
    group: 'blueCell' | 'redCell' | 'whiteCell' | 'scenarioAdmin',
    username: string,
  ) => {
    try {
      const response = await DevopsApiClient.scenarioPermissionsAddUser(
        rangeId,
        scenarioId,
        group,
        username,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred adding the user to this permission group',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, group, username }: any) =>
      postResult(rangeId, scenarioId, group, username),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyRangeResourceScenarios);
        }
      },
    },
  );
};

export const useDeleteUserFromScenarioPermission = ({ rangeId }: any) => {
  const queryClient = useQueryClient();
  const deleteResult = async (
    rangeId: string,
    scenarioId: string,
    group: 'blueCell' | 'redCell' | 'whiteCell' | 'scenarioAdmin',
    username: string,
  ) => {
    try {
      const response = await DevopsApiClient.scenarioPermissionsRemoveUser(
        rangeId,
        scenarioId,
        group,
        username,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred deleting the user from this permission group',
      );
    }
  };

  return useMutation(
    ({ rangeId, scenarioId, group, username }: any) =>
      deleteResult(rangeId, scenarioId, group, username),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries([
            queryKeyRangeResourceScenarioPermissions,
          ]);
        }
      },
    },
  );
};
