import { useGetScenarioGraph, useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoader, setNavbarToggleState } from '@rangeos-nx/ui/redux';

export const useScenarioModel = (
  defaultMapData: any,
  uuid: string | undefined,
) => {
  const [mapData, setMapData] = useState(defaultMapData);
  const [pckgUuids, setPackages] = useState<string[]>([]);
  const [l3Uuids, setL3s] = useState<string[]>([]);
  const [isInitialized, setInitialized] = useState(false);
  const dispatch: any = useDispatch();
  const query = useGetScenarioGraph();

  /* Creates Graph Model from DTO
   */

  const updateQuery = () => {
    const variables = {
      uuid: uuid,
      pckgUuids: pckgUuids,
      l3Uuids: l3Uuids,
    };
    query.mutateAsync(variables);
  };

  // useEffect(() => {
  //   setMapData(defaultMapData);
  // }, [defaultMapData?.netmapScenario?.name]);

  useEffect(() => {
    if (!defaultMapData && uuid && !isInitialized) {
      setInitialized(true);
      updateQuery();
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      updateQuery();
    }
  }, [l3Uuids.length]);

  useEffect(() => {
    if (isInitialized) {
      updateQuery();
    }
  }, [pckgUuids.length]);

  useEffect(() => {
    //console.log('query.data', query?.data);
    setMapData(query?.data);
  }, [query?.isSuccess]);

  const addRemoveVariables = (prop: string, uuid: string) => {
    let arr = null;
    if (prop === 'Package') {
      arr = [...pckgUuids];
      const index = arr.indexOf(uuid);
      if (index < 0) {
        arr.push(uuid);
      } else {
        arr.splice(index, 1);
      }
      setPackages(arr);
    } else if (prop === 'L3') {
      arr = [...l3Uuids];
      const index = arr.indexOf(uuid);
      if (index < 0) {
        arr.push(uuid);
      } else {
        arr.splice(index, 1);
      }
      setL3s(arr);
    }
  };

  return {
    addRemoveVariables,
    mapData: mapData,
    l3Uuids: l3Uuids,
    pckgUuids: pckgUuids,
  };
};
