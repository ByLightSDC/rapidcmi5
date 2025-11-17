/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import {
  DevopsApiClient,
  ScenariosValidateBeforeCreateRequest,
} from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
import {
  ScenarioCreate,
  ScenarioUpdate,
} from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyScenarios = 'scenarios';
export const queryKeyScenarioDownload = 'scenario-terraform-download';
export const queryKeyScenarioNetspecDownload = 'scenario-netspec-download';
export const queryKeyScenarioSchema = 'scenario-schema';
export const queryKeyScenarioValidation = 'scenarios-validation';

export const useGetScenarios = (reqOptions?: any) => {
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

      const response = await DevopsApiClient.scenariosList(
        reqOptions?.uuid,
        reqOptions?.name,
        reqOptions?.description,
        reqOptions?.author,
        undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
        reqOptions?.tag,
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
        'An error occurred retrieving the Scenarios',
      );
    }
  };

  return useQuery(
    [queryKeyScenarios, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetScenario = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.scenariosRetrieve(
        id,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred retrieving the Scenario');
    }
  };

  return useQuery([queryKeyScenarios, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const usePostScenario = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: ScenarioCreate) => {
    try {
      const response = await DevopsApiClient.scenariosCreate(
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred creating the Scenario');
    }
  };

  return useMutation((formData: ScenarioCreate) => postResult(formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyScenarios);
      }
    },
  });
};

export const usePutScenario = () => {
  const queryClient = useQueryClient();
  const putResult = async (uuid: string, formData: ScenarioUpdate) => {
    try {
      const response = await DevopsApiClient.scenariosUpdate(
        uuid,
        formData,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred updating the Scenario');
    }
  };

  return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyScenarios);
      }
    },
  });
};

export const useDeleteScenario = () => {
  const queryClient = useQueryClient();
  const deleteResult = async (uuid: string) => {
    try {
      const response = await DevopsApiClient.scenariosDelete(
        uuid,
        queryHooksConfig,
      );
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred deleting the Scenario');
    }
  };

  return useMutation((uuid: string) => deleteResult(uuid), {
    onSettled: async (data, error, variables: any) => {
      if (!error) {
        queryClient.invalidateQueries(queryKeyScenarios);
      }
    },
  });
};

export const useGetScenarioSchema = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      if (id) {
        const response = await DevopsApiClient.scenariosRetrieveSchema(
          id,
          queryHooksConfig,
        );
        return response.data;
      }

      return null;
    } catch (error: any) {
      throw (
        error.response?.data?.msg ?? 'An error occurred retrieving the Schema'
      );
    }
  };

  return useQuery([queryKeyScenarioSchema, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useGetScenarioNetspec = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response =
        await DevopsApiClient.scenariosRetrievePcteStandardNetspec(id, {
          ...queryHooksConfig,
          responseType: 'arraybuffer',
        });
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Scenario PCTE Netspec data',
      );
    }
  };
  return useQuery([queryKeyScenarioNetspecDownload, id], getResult, {
    ...defaultQueryConfig,
  });
};

export const useGetScenarioTerraform = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      const response = await DevopsApiClient.scenariosRetrieveTerraform(id, {
        ...queryHooksConfig,
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Scenario Terraform data',
      );
    }
  };
  return useQuery([queryKeyScenarioDownload, id], getResult, {
    ...defaultQueryConfig,
  });
};

// use this same endpoint for create/edit with current form values
export const usePostValidateScenarioPayload = () => {
  const queryClient = useQueryClient();
  const postResult = async (formData: ScenariosValidateBeforeCreateRequest) => {
    try {
      const response = await DevopsApiClient.scenariosValidateBeforeCreate(
        formData,
        queryHooksConfig,
      );

      return response.data;
    } catch (error: any) {
      throw getErrorMessage(error, 'An error occurred validating the Scenario');
    }
  };

  return useMutation(
    (scenario: ScenariosValidateBeforeCreateRequest) => postResult(scenario),
    {
      onSettled: async (data, error, variables: any) => {
        if (!error) {
          queryClient.invalidateQueries(queryKeyScenarioValidation);
        }
      },
    },
  );
};

// OBE - want to validate an existing scenario with CURRENT form values - not db values
// export const usePostScenarioValidate = () => {
//   const queryClient = useQueryClient();
//   const postResult = async (id: string) => {
//     try {
//       const response = await DevopsApiClient.scenariosValidate(
//         id,
//         queryHooksConfig
//       );

//       return response.data;
//     } catch (error: any) {
//       throw getErrorMessage(error, 'An error occurred validating the Scenario');
//     }
//   };

//   return useMutation((id: string) => postResult(id), {
//     onSettled: async (data, error, variables: any) => {
//       if (!error) {
//         queryClient.invalidateQueries(queryKeyScenarioValidation);
//       }
//     },
//   });
// };
