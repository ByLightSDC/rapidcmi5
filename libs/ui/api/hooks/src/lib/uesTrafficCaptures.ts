import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DevopsApiClient } from '@rangeos-nx/frontend/clients/devops-api';
import {
  defaultQueryConfig,
  defaultSortOrderBy,
  defaultSortOrder,
  getMetadataFilterParam,
  queryHooksConfig,
} from './config';
import { getErrorMessage } from './errorMessages';
// import {
//   TrafficCapture,
//   TrafficCaptureCreate,
//   TrafficCaptureUpdate,
// } from '@rangeos-nx/frontend/clients/devops-api';

export const queryKeyTrafficCaptures = 'traffic-captures';

const mockId1 = '12345660-6fb7-4997-8f3c-70f0a335d5a3';
const mockId2 = '22345660-6fb7-4997-8f3c-70f0a335d5a3';
const mockResponse = {
  limit: 100,
  offset: 0,
  totalCount: 2,
  totalPages: 1,
  data: [
    {
      name: 'Mock Capture 1',
      description: '',
      instanceId: 'abc',
      targetInterface: 1,
      vmSpecification: '200222d5-2ed2-416d-be3a-eb625c3615e2',
      containerSpecification: null,
      uuid: mockId1,
    },
    {
      name: 'Mock Capture 2',
      description: '',
      instanceId: 'xyz',
      targetInterface: 1,
      vmSpecification: null,
      containerSpecification: '857354c1-3a12-464a-a784-59eab4aeb232',
      uuid: mockId2,
    },
  ],
};

export const useGetTrafficCaptures = (reqOptions?: any) => {
  const getResult = async (reqOptions?: any) => {
    try {
      //   const metadata = getMetadataFilterParam(reqOptions);
      //   const options: AxiosRequestConfig = {
      //     ...queryHooksConfig,
      //     params: { metadata },
      //     paramsSerializer(params) {
      //       return qs.stringify(params);
      //     },
      //     authToken: reqOptions?.authToken,
      //   };
      //   const response = await DevopsApiClient.trafficCapturesList(
      //     reqOptions?.uuid,
      //     reqOptions?.name,
      //     reqOptions?.description,
      //     reqOptions?.author,
      //     undefined, //reqOptions?.metadata -- nested object must be set with paramsSerializer in options above
      //     reqOptions?.offset,
      //     reqOptions?.limit,
      //     reqOptions?.search,
      //     reqOptions?.sortBy || defaultSortOrderBy,
      //     reqOptions?.sort || defaultSortOrder,
      //     options,
      //   );
      //   return response.data;
      //TODO - mock for now
      return mockResponse;
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Traffic Captures',
      );
    }
  };

  return useQuery(
    [queryKeyTrafficCaptures, reqOptions],
    () => getResult(reqOptions),
    {
      ...defaultQueryConfig,
      keepPreviousData: true,
    },
  );
};

export const useGetTrafficCapture = ({ id }: { id: string }) => {
  const getResult = async () => {
    try {
      //   const response = await DevopsApiClient.trafficCapturesRetrieve(
      //     id,
      //     queryHooksConfig,
      //   );
      //   return response.data;
      //TODO - mock for now
      if (id === mockId1) {
        return mockResponse.data[0];
      }
      return mockResponse.data[1];
    } catch (error: any) {
      throw getErrorMessage(
        error,
        'An error occurred retrieving the Traffic Capture',
      );
    }
  };

  return useQuery([queryKeyTrafficCaptures, id], getResult, {
    ...defaultQueryConfig,
  });
};

//TODO - need endpoints
// export const usePostTrafficCapture = () => {
//   const queryClient = useQueryClient();
//   const postResult = async (formData: TrafficCaptureCreate) => {
//     try {
//       const response = await DevopsApiClient.trafficCapturesCreate(
//         formData,
//         queryHooksConfig,
//       );
//       return response.data;
//     } catch (error: any) {
//       throw getErrorMessage(
//         error,
//         'An error occurred creating the Traffic Capture',
//       );
//     }
//   };

//   return useMutation((formData: TrafficCaptureCreate) => postResult(formData), {
//     onSettled: async (data, error, variables: any) => {
//       if (!error) {
//         queryClient.invalidateQueries(queryKeyTrafficCaptures);
//       }
//     },
//   });
// };

// export const usePutTrafficCapture = () => {
//   const queryClient = useQueryClient();
//   const putResult = async (uuid: string, formData: TrafficCaptureUpdate) => {
//     try {
//       const response = await DevopsApiClient.trafficCapturesUpdate(
//         uuid,
//         formData,
//         queryHooksConfig,
//       );

//       return response.data;
//     } catch (error: any) {
//       throw getErrorMessage(
//         error,
//         'An error occurred updating the Traffic Capture',
//       );
//     }
//   };

//   return useMutation(({ uuid, formData }: any) => putResult(uuid, formData), {
//     onSettled: async (data, error, variables: any) => {
//       if (!error) {
//         queryClient.invalidateQueries(queryKeyTrafficCaptures);
//       }
//     },
//   });
// };

// export const useDeleteTrafficCapture = (
//   uuid?: string, //  mark as “optional” so  when CrudModals sets up the api query it doesn’t complain about “undefined”
//   skipInvalidate = false, // normally we want to invalidate, but not when doing bulk delete
// ) => {
//   const queryClient = useQueryClient();
//   const deleteResult = async (uuid: string) => {
//     try {
//       const response = await DevopsApiClient.trafficCapturesDelete(
//         uuid,
//         queryHooksConfig,
//       );
//       return response.data;
//     } catch (error: any) {
//       throw getErrorMessage(
//         error,
//         'An error occurred deleting the Traffic Capture',
//       );
//     }
//   };

//   return useMutation((uuid: any) => deleteResult(uuid), {
//     onSettled: async (data, error, variables: any) => {
//       if (!error) {
//         if (skipInvalidate) {
//           return;
//         }
//         queryClient.invalidateQueries(queryKeyTrafficCaptures);
//       }
//     },
//   });
// };
