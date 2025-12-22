/* eslint-disable array-callback-return */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Query, useQueryClient } from 'react-query';

interface LooseObject {
  [key: string]: any;
}

export const useCache = () => {
  const queryClient = useQueryClient();

  const applyById = (
    queryKey: string,
    id: string,
    data: any,
    applyMethod: (q: any, data: any) => void,
  ) => {
    const queryObj: any = queryClient.getQueryData([queryKey, id]);
    if (queryObj) {
      applyMethod(queryObj, data);
      /*let props = atDepth ? queryObj[atDepth] : queryObj;
        Object.entries(data).map(([key, value]) => {
          if (props.hasOwnProperty(key)) {
            props[key] = value;
          }
        });*/
    }
    queryClient.setQueryData([queryKey, id], queryObj);
  };

  /*
  Check to see if query data is invalidated
  */
  const getIsValid = (queryKey: string, uuid?: string) => {
    let isInvalidated = true;
    if (uuid) {
      isInvalidated =
        queryClient.getQueryState([queryKey, uuid])?.isInvalidated || false;
    } else {
      isInvalidated =
        queryClient.getQueryState(queryKey)?.isInvalidated || false;
    }

    return !isInvalidated;
  };

  /*
  Get Cache Data By UUID
  */
  // NOTE - this is completely broken
  // here is the call that will work to retrieve data
  // const data = queryClient.getQueriesData(queryKey);
  const getIdFromArray = (
    queryKey: string,
    id: string,
    idPropName = 'uuid',
  ) => {
    if (!id) {
      //console.log('You must specify an id for property ' + idPropName);
      return;
    }

    //find from non paginated data
    const singleRecord = queryClient.getQueryData([queryKey, id]);
    if (singleRecord) {
      return singleRecord;
    }

    // try to find in "paginated" data
    // The queries are stored in cache as a map by queryKey and reqOptions
    const entries = queryClient
      .getQueryCache()
      .findAll({ queryKey: queryKey })
      .values();

    let result = entries.next();
    while (!result.done) {
      let records: any = (result.value as Query)?.state?.data;
      // some endpoints cache a "paged data" object with a nested array of items,
      // some endpoints cache individual records.
      // Any payload can have a data parameter so we need to decipher
      // between paged data and a payload parameter
      //
      // Example - RangeDnsRecord has a field named ‘data’ that represents ip information
      if (
        records?.hasOwnProperty('data') &&
        records?.hasOwnProperty('totalPages') // part of what identifies a paged data object
      ) {
        records = records.data;
      }

      if (records && records.length > 0) {
        const record = records.find((o: LooseObject) => o[idPropName] === id);
        if (record) {
          return record;
        }
      }
      result = entries.next();
    }
    return null;
  };

  /*
  Get Cache Data By UUID
  */
  const getObjFromArrayById = (
    queryKey: string,
    parentUUID: string,
    uuid: string,
  ) => {
    if (!uuid || !parentUUID) {
      console.log('You must specify parentUUID and UUID');
      return;
    }

    const queryObj: any = queryClient.getQueryData([queryKey, parentUUID]);
    return queryObj?.find((o: LooseObject) => o['uuid'] === uuid);
  };

  /*
  Get array of items that have a matching property 'propName' and 'propValue'
  propValue comparison checks to see if property value starts with value passed in
  */
  const searchArray = (
    queryKey: string,
    propName: string,
    propValue: string,
  ) => {
    //check for non paged cache data first
    //REF == in case we have a case of non-paged data
    // let nonPageResults: Array<string> = [];
    // let queryObj: any = queryClient.getQueryData([queryKey]);
    // if (queryObj && queryObj.constructor === Array) {
    //   nonPageResults = queryObj.reduce((acc: string[], obj: any) => {
    //     if (obj.hasOwnProperty(propName)) {
    //       if (obj[propName].startsWith(propValue)) {
    //         const foundIndex = nonPageResults.indexOf(obj[propName]);
    //         if (foundIndex < 0) {
    //           acc.push(obj[propName]);
    //         }
    //       }
    //     }
    //     return acc;
    //   }, []);
    //   return nonPageResults;
    // }

    //if not found above, check in "pagination" cache
    let pagedResults: Array<string> = [];
    // The queries are stored in cache as a map by queryKey and reqOptions
    const entries = queryClient
      .getQueryCache()
      .findAll({ queryKey: queryKey })
      .values();

    let result = entries.next();
    while (!result.done) {
      let records: any = (result.value as Query)?.state?.data;
      // check if this is "paged data"
      if (records?.hasOwnProperty('data')) {
        records = records.data;
      }
      if (records && records.length > 0) {
        let localPageResults: Array<string> = [];
        localPageResults = records.reduce((acc: string[], obj: any) => {
          if (obj.hasOwnProperty(propName)) {
            if (obj[propName].startsWith(propValue)) {
              // to prevent duplicates
              const foundPageIndex = localPageResults.indexOf(obj[propName]);
              const foundIndex = pagedResults.indexOf(obj[propName]);
              if (foundIndex < 0 && foundPageIndex < 0) {
                acc.push(obj[propName]);
              }
            }
          }
          return acc;
        }, []);
        pagedResults.push(...localPageResults);
      }
      result = entries.next();
    }
    return pagedResults;
  };

  /*
  Invalidate Cache Data
  Causes query specified by key to be refetched
  */
  const invalidate = (queryKey: string) =>
    queryClient.invalidateQueries([queryKey]);

  const invalidateById = (queryKey: string, uuid: string) =>
    queryClient.invalidateQueries([queryKey, uuid]);

  /*
  Update Cache Data (Needs work)
  */
  const update = (queryKey: any, data: any) => {
    queryClient.setQueryData(queryKey, data);
  };

  /*
  Put Cache Data
  Looks up object from cache by key
  Updates matching properties with incoming partial data values
  */
  const put = (queryKey: string, id: string, data: any) => {
    const queryObj: any = queryClient.getQueryData(queryKey);
    if (queryObj) {
      const dataList = queryObj.data ? queryObj.data : queryObj;
      dataList.map((obj: any) => {
        if (obj.uuid === id) {
          Object.entries(data).map(([key, value]) => {
            if (obj.hasOwnProperty(key)) {
              obj[key] = value;
            }
          });
        }
      });

      // Update
      queryClient.setQueryData(queryKey, queryObj);
    }
  };

  /*
  Put Cache Data
  Looks up object from cache by key
  Updates matching properties with incoming partial data values
  */
  const putObjInArray = (queryKey: string, id: string, data: any) => {
    const queryObj: any = queryClient.getQueryData([queryKey, id]);

    if (queryObj) {
      queryObj.map((obj: any, index: number) => {
        if (obj.uuid === data?.uuid) {
          //queryObj[index] = data;
          Object.entries(data).map(([key, value]) => {
            if (obj.hasOwnProperty(key)) {
              obj[key] = value;
            }
          });
        }
      });

      // Update
      queryClient.setQueryData(queryKey, queryObj);
    }
  };

  /* 
  Put Cache Data
  Looks up object from cache by key AND id
  Updates matching properties with incoming data values
  Incoming data is sometimes wrapped, atDepth allows you to specify iterating properties one level down instead of at root of object
  */
  const putById = (
    queryKey: string,
    id: string,
    data: any,
    atDepth?: string,
  ) => {
    const queryObj: any = queryClient.getQueryData([queryKey, id]);
    if (queryObj) {
      const props = atDepth ? queryObj[atDepth] : queryObj;
      if (props) {
        Object.entries(data).map(([key, value]) => {
          if (props.hasOwnProperty(key)) {
            props[key] = value;
          }
        });
      }
    }
    queryClient.setQueryData([queryKey, id], queryObj);
  };

  return {
    applyById,
    getIdFromArray,
    getObjFromArrayById,
    getIsValid,
    invalidate,
    invalidateById,
    put,
    putById,
    putObjInArray,
    searchArray,
    update,
  };
};
