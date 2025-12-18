/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UseFormReturn } from 'react-hook-form';
import {
  message,
  setMessage,
  setModal,
  useGetCacheMultipleSelection,
  useSetCacheMultipleSelection,
} from '@rapid-cmi5/ui/redux';

/* Icons */
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { ButtonMinorUi } from '@rapid-cmi5/ui/api/hooks';
import { ButtonModalMinorUi } from '../inputs/buttons/buttonsmodal';
import { tMultiSelectionMeta } from './SharedFormWithProvider';

export type MultiSelectButtonProps = {
  buttonText?: string;
  fieldName?: string;
  id?: string;
  isKeyValue?: boolean;
  isModal?: boolean;
  formMethods?: Partial<UseFormReturn>;
  arrayMethods?: any;
  selectionTargetId?: string;
  shouldRestrictToInDesignOnly?: boolean;
  topicId?: any;
  isDisabled?: boolean;
  whichStyle?: number;
  onApply?: (item: any[]) => void;
};

/**
 * Multiselect Button launches selection view, displays selected values from cache,  and applies selection to form field
 * @param {string} [buttonText = 'Select'] Button label
 * @param {string} [id='select-multiple'] Id for button (e.g. to make unique within an array of items)
 * @param {boolean} [isKeyValue = false] Whether form field data is formatted in key value paairs
 * @param {UseFormReturn} formMethods React Hook form methods
 * @param {string} modalId Unique Modal Identifier
 * @param {boolean} [isDisabled =  false] Whether button should be disabled
 * @param {((selectedItems: any[]) => void))} [onApply] Method to call when selection is applied
 * @return {JSX.Element} React Component
 */

export function MultiSelectButton({
  buttonText = 'Select',
  fieldName = 'xxx',
  id = 'select-multiple',
  isKeyValue = false,
  isModal = false,
  arrayMethods,
  formMethods,
  selectionTargetId,
  shouldRestrictToInDesignOnly,
  topicId,
  isDisabled = false,
  whichStyle = 1,
  onApply,
}: MultiSelectButtonProps) {
  const dispatch = useDispatch();
  const messageObj = useSelector(message);

  const setMultiSelectionCaches = useSetCacheMultipleSelection();
  const getMultiSelectionCache = useGetCacheMultipleSelection();
  const selectModalId = `multiselect-${topicId.toLowerCase()}`;

  /**
   * Use Effect applies selection to form when Apply message is received
   */
  useEffect(() => {
    if (messageObj.message !== 'apply') {
      return;
    }

    // this handles the case when there's more than one multi button on the form for same modal (e.g. within an array)
    if (messageObj.meta?.fieldName !== fieldName) {
      return;
    }

    if (messageObj.type === selectModalId) {
      console.log('Found Match Multi On Mount', selectModalId);
      const cache = getMultiSelectionCache(selectModalId)?.selections || [];

      if (formMethods && fieldName) {
        const { setValue, trigger } = formMethods;

        if (cache) {
          if (isKeyValue) {
            let pairs: { [name: string]: string } = {};
            // first clear the array field before adding selected one(s)
            if (arrayMethods.replace && arrayMethods.append) {
              arrayMethods.replace([]);
              const newArr: any[] = [];
              cache.map((item: any, index: number) => {
                const itemName = item.meta?.name || item.id;
                if (pairs.hasOwnProperty(itemName)) {
                  //properties have to be unique, but BE might not force unique names across records
                  //so we have to handle here to avoid script error
                  pairs[itemName + index] = item.id;
                } else {
                  pairs[itemName] = item.id;
                }
                newArr.push({
                  name: itemName + index,
                  value: item.id,
                });
              });
              arrayMethods.replace(newArr);
            } else if (setValue) {
              setValue(fieldName, []);
              cache.map((item: any, index: number) => {
                const itemName = item.meta?.name || item.id;
                if (pairs.hasOwnProperty(itemName)) {
                  //properties have to be unique, but BE might not force unique names across records
                  //so we have to handle here to avoid script error
                  pairs[itemName + index] = item.id;
                  setValue(`${fieldName}[${index}].name`, itemName + index);
                  setValue(`${fieldName}[${index}].value`, item.id);
                } else {
                  pairs[itemName] = item.id;
                  setValue(`${fieldName}[${index}].name`, itemName);
                  setValue(`${fieldName}[${index}].value`, item.id);
                }
              });
            }
          } else {
            if (arrayMethods.replace) {
              const arr = cache.map((item) => item.id);
              arrayMethods.replace(arr);
            } else if (setValue) {
              cache.map((item: any, index: number) => {
                setValue(`${fieldName}[${index}]`, item.id);
              });
            }
          }
        } else {
          if (isKeyValue) {
            if (arrayMethods.replace) {
              arrayMethods.replace([]);
            } else if (setValue) {
              setValue(fieldName, []);
            }
          } else if (setValue) {
            setValue(fieldName, []);
          }
        }

        if (trigger) {
          if (isKeyValue) {
            trigger(`${fieldName}.name`);
          } else {
            trigger(fieldName);
          }
        }

        if (onApply) {
          onApply(cache || []);
        }
        dispatch(setMessage({ type: '', message: '' }));
      }
    }
  }, [messageObj.message, formMethods, fieldName, dispatch]);

  /**
   * Launches selection list view
   */
  const openMultiSelection = () => {
    //get values from form
    //create a new array and inject modal id
    let arr: any[] = [];
    if (formMethods?.getValues) {
      formMethods.getValues(fieldName).map((item: any, index: number) => {
        let shouldAdd = isKeyValue ? item.value : item;
        //ensure blank entries don't appear in selection

        if (shouldAdd) {
          arr.push({
            id: isKeyValue ? item?.value : item,
            key: selectModalId,
            meta: {
              uuid: isKeyValue ? item?.value : item,
              name: 'Unknown Name',
              indexedArrayField: `${fieldName}[${index}]`,
            },
            name: isKeyValue ? item?.name : item,
            type: selectModalId,
          });
        }
      });
    }
    //send to cache used by the selection view
    setMultiSelectionCaches(selectModalId, arr);
    //open modal
    const multiMeta: tMultiSelectionMeta = {
      fieldName,
      selectionTargetId: selectionTargetId || '',
      shouldSkipQuery: shouldRestrictToInDesignOnly,
      isKeyValue,
      propertyKey: 'value',
    };
    dispatch(
      setModal({
        id: null,
        meta: multiMeta,
        name: null,
        topic: topicId,
        type: 'multi-select',
      }),
    );
  };

  return (
    <>
      {whichStyle === 1 && (
        <ButtonModalMinorUi
          aria-label="Select Multiple"
          id={id}
          size="small"
          disabled={isDisabled}
          startIcon={<TouchAppIcon />}
          onClick={(event) => {
            event.stopPropagation();
            openMultiSelection();
          }}
        >
          {buttonText}
        </ButtonModalMinorUi>
      )}
      {whichStyle === 2 && (
        <ButtonMinorUi
          aria-label="Select Multiple"
          id={id}
          disabled={isDisabled}
          startIcon={<TouchAppIcon />}
          onClick={(event) => {
            event.stopPropagation();
            openMultiSelection();
          }}
        >
          {buttonText}
        </ButtonMinorUi>
      )}
    </>
  );
}

export default MultiSelectButton;
