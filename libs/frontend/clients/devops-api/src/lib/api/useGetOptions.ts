import { useEffect, useState } from 'react';
import { useQueryDetails } from './useQueryDetails';

/**
 * Retrieves the list of data from given apiHook
 * @param {*} apiHook API hook for getting the list of items
 * @param {*} payload Payload to pass to the api hook
 * @param {*} onSuccess Success method called when api hook request returns success response
 * @param {*} onError Error method to call when api hook request returns error
 * @returns {any} List of items found
 */
export const useGetOptions = (
  apiHook: any,
  payload?: any,
  onSuccess?: any,
  onError?: any,
) => {
  const [displayList, setDisplayList] = useState<any>([]);
  const listQuery = payload ? apiHook(payload) : apiHook();
  useQueryDetails({
    queryObj: listQuery,
    errorFunction: (errorState: any) => {
      if (onError) {
        onError(
          typeof listQuery.error === 'string'
            ? listQuery.error
            : listQuery.error?.message,
        );
      }
    },
    successFunction: onSuccess,
  });

  useEffect(() => {
    if (listQuery.isSuccess) {
      setDisplayList(
        listQuery.data.hasOwnProperty('data')
          ? listQuery.data.data
          : listQuery.data,
      );
    }
  }, [listQuery.isSuccess]);

  useEffect(() => {
    if (listQuery.isSuccess) {
      setDisplayList(
        listQuery.data.hasOwnProperty('data')
          ? listQuery.data.data
          : listQuery.data,
      );
    }
  }, [listQuery.isSuccess]);

  return displayList;
};
