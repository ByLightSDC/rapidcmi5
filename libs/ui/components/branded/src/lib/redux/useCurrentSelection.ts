import { setModal } from './commonAppReducer';
import {
  useSetCacheSelection,
  useClearCacheSelection,
} from './useCacheSelection';

import { useDispatch } from 'react-redux';

export type tSelectionMeta = {
  filters?: any;
  modalTitle?: string;
  selectionAction?: string;
  selectionTargetId: string;
  fieldName: string;
  indexedArrayField: string;
  rowIndex?: number;
  propertyKey?: string;
  isKeyValue?: boolean;
  requestingId?: string; // optional id of item requesting this selection
};

/**
 * Convenience hook for managing cache of selection modals
 * @returns openSelection and clearSelection functions
 */
export const useCurrentSelection = () => {
  const setSelectionCache = useSetCacheSelection();
  const dispatch = useDispatch();
  const clearSelectionCaches = useClearCacheSelection();

  /**
   * Save current selection cache for given modal
   *  and hides selection modal
   * @param {string} modalId Id for selection modal
   * @param {string} selId Currently selected item id
   * @param {*} [modalMeta] Additional information needed for selection
   * @param {string} [selName] Additional selected name (for when dealing with key/value pairs)
   */
  const openSelection = ({
    dataIdField = 'uuid',
    modalId,
    modalMeta,
    selId,
    selName,
    topicId,
  }: {
    dataIdField?: string;
    modalId: string;
    selId: string;
    modalMeta?: tSelectionMeta;
    selName?: string;
    topicId?: string;
  }) => {
    setSelectionCache(modalId, selId, {
      name: selName || 'Unknown Name',
      [dataIdField]: selId, //order important
    });

    console.log('setting modal');

    dispatch(
      setModal({
        id: topicId || selId,
        meta: modalMeta,
        name: null,
        topic: topicId,
        type: 'select',
      }),
    );
  };

  /**
   * Clears selection cache for given modal
   * @param modalId selection modal to clear
   */
  const clearSelection = (modalId?: string) => {
    if (modalId) {
      clearSelectionCaches([modalId]);
    }
  };

  return { clearSelection, openSelection };
};
