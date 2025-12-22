/*
Saves selection state to the redux store 
Each selection is saved into global state with a unique key
Methods included for setting and retrieving selection
*/

import { useDispatch, useSelector } from 'react-redux';
import { selection, CommonAppSelectionState, setSelection, multipleSelection, CommonAppMultipleSelectionState, setMultipleSelection } from './commonAppReducer';



export const useClearCacheSelection = () => {
  const selectionArr = useSelector(selection);
  const dispatch = useDispatch();

  const clearSelectionCaches = (keys: string[]) => {
    let newArr = [...selectionArr];

    for (let i = 0; i < keys.length; i++) {
      const selIndex = newArr.findIndex(
        (obj: CommonAppSelectionState) => obj.key == keys[i],
      );

      if (selIndex >= 0) {
        newArr.splice(selIndex, 1);
      }
    }

    dispatch(setSelection(newArr));
  };
  return clearSelectionCaches;
};

// Can not be called for multiple keys at the same time
// If you need to clear multiple selections at once, use the clear method above
export const useSetCacheSelection = () => {
  const selectionArr = useSelector(selection);
  const dispatch = useDispatch();

  const setSelectionCache = (
    key: any,
    id: string,
    meta?: any,
    modalMeta?: any,
  ) => {
    let newArr = [...selectionArr];
    const selIndex = newArr.findIndex(
      (obj: CommonAppSelectionState) => obj.key == key,
    );
    if (selIndex >= 0) {
      if (id && id.length > 0) {
        newArr[selIndex] = {
          key: key,
          id: id,
          meta: meta,
          modalMeta: modalMeta,
        };
      } else {
        //clear selection
        newArr[selIndex] = { key: key, id: '', meta: null, modalMeta: null };
      }
    } else {
      if (id && id.length > 0) {
        newArr.push({ key: key, id: id, meta: meta, modalMeta: modalMeta });
      } else {
        return;
      }
    }
    dispatch(setSelection(newArr));
  };
  return setSelectionCache;
};

export const useSetCacheSelections = () => {
  const selectionArr = useSelector(selection);
  const dispatch = useDispatch();

  const setSelectionCaches = (cacheList: any) => {
    let newArr = [...selectionArr];

    cacheList.map((sel: any) => {
      const key = sel.key;
      const id = sel.id;
      const meta = sel.meta;
      const modalMeta = sel.modalMeta;

      const selIndex = newArr.findIndex(
        (obj: CommonAppSelectionState) => obj.key == key,
      );

      if (selIndex >= 0) {
        if (id.length > 0) {
          newArr[selIndex] = {
            key: key,
            id: id,
            meta: meta,
            modalMeta: modalMeta,
          };
        } else {
          //clear selection
          newArr[selIndex] = { key: key, id: '', meta: null, modalMeta: null };
        }
      } else {
        if (id.length > 0) {
          newArr.push({ key: key, id: id, meta: meta, modalMeta: modalMeta });
        } else {
          console.warn('No id found');
          return;
        }
      }
    });

    dispatch(setSelection(newArr));
  };
  return setSelectionCaches;
};

export const useGetCacheSelection = () => {
  const selectionArr = useSelector(selection);

  const getSelectionCache = (key: any) => {
    const selIndex = selectionArr.findIndex(
      (obj: CommonAppSelectionState) => obj.key == key,
    );

    if (selIndex >= 0) {
      return selectionArr[selIndex];
    } else {
      return null;
    }
  };
  return getSelectionCache;
};

export const useSetCacheMultipleSelection = () => {
  const selectionArr = useSelector(multipleSelection);
  const dispatch = useDispatch();

  const setMultipleSelectionCache = (
    key: any,
    selections: CommonAppSelectionState[], //#REF any[]
  ) => {
    let newArr = [...selectionArr];
    const selIndex = newArr.findIndex(
      (obj: CommonAppMultipleSelectionState) => obj.key == key,
    );

    if (selIndex >= 0) {
      newArr[selIndex] = { key: key, selections: selections };
    } else {
      newArr.push({ key: key, selections: selections });
    }
    dispatch(setMultipleSelection(newArr));
  };
  return setMultipleSelectionCache;
};

export const useGetCacheMultipleSelection = () => {
  const selectionArr = useSelector(multipleSelection);

  const getMultipleSelectionCache = (key: any) => {
    const selIndex = selectionArr.findIndex(
      (obj: CommonAppMultipleSelectionState) => obj.key == key,
    );

    if (selIndex >= 0) {
      return selectionArr[selIndex];
    } else {
      return null;
    }
  };
  return getMultipleSelectionCache;
};
