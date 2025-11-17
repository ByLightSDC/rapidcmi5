import { ButtonModalMinorUi } from '../inputs/buttons/buttonsmodal';
import { UseFormReturn } from 'react-hook-form';

import PlusOneIcon from '@mui/icons-material/PlusOne';
import { useDispatch, useSelector } from 'react-redux';
import {
  message,
  selection,
  setMessage,
  useGetCacheSelection,
} from '@rangeos-nx/ui/redux';
import { useEffect } from 'react';
import { debugLog, debugLogError } from '../utility/logger';
import { Topic } from '@rangeos-nx/ui/api/hooks';

/**
 * @typedef {Object} AddButtonProps
 * @property {JSX.Element} buttonIcon Button Icon
 * @property {string} indexedArrayField Field
 * @property {boolean} [isKeyValue] Whether field is a Key Value pair
 * @property {boolean} [isModal] Whether is in modal
 * @property {Partial<UseFormReturn>} [formMethods] Form Methods
 * @property {string} [topicId] Topic
 * @property {boolean} [isDisabled] Whether Add button is disabled
 * @property {boolean} [shouldApplySelections] Whether should apply selections to form data
 * @property {(selectionId: string, value: any) => void} [onApplySelection] Callback method when fields applied to form
 * @property {(event: any) => void} onClick Method to call when Add button is clicked
 */
export type AddButtonProps = {
  buttonIcon?: JSX.Element;
  fieldName: string;
  isKeyValue?: boolean;
  isModal?: boolean;
  formMethods?: Partial<UseFormReturn>;
  arrayMethods?: any;
  topicId?: string;
  isDisabled?: boolean;
  isReplaceEnabled?: boolean;
  shouldApplySelections?: boolean;
  onApplySelection?: (selectionId: string, value: any) => void;
  onClick: (event: any) => void;
};

export type SingleSelectButtonProps = {
  arrayMethods?: any;
  isReplaceEnabled?: boolean;
  shouldApplySelections?: boolean;
  onApplySelection?: (selectionId: string, value: any) => void;
};

/**
 * Applies selections to FormFieldArray entries
 * Adds Entries
 * @param param0
 * @returns
 */
export function AddButton({
  buttonIcon = <PlusOneIcon />,
  isKeyValue = false,
  fieldName,
  formMethods,
  arrayMethods,
  topicId = Topic.Unknown,
  isDisabled = false,
  shouldApplySelections = true,
  onApplySelection,
  onClick,
}: AddButtonProps) {
  const dispatch = useDispatch();
  const getSelectionCache = useGetCacheSelection();
  const messageObj = useSelector(message);
  const selectionArr = useSelector(selection);
  const selectionModalId = `select-${topicId.toLowerCase()}`;
  const propertyKey = 'value'; //how form stores key value pairs

  /**
   * UseEffect handles applying selected item
   * Pulls selected value from redux
   * Updates appropriate form field with the selected value
   */
  useEffect(() => {
    //match modal
    if (messageObj.type === selectionModalId) {
      if (
        (!shouldApplySelections && !onApplySelection) ||
        messageObj.message !== 'apply'
      ) {
        return;
      }
      const theFieldName = messageObj.meta?.fieldName;
      const theIndexedField = messageObj.meta?.indexedArrayField;
      const rowIndex = messageObj.meta?.rowIndex;

      //match field
      if (fieldName === theFieldName) {
        if (formMethods) {
          const { getValues, setValue, trigger } = formMethods;

          if (getValues && setValue && trigger) {
            debugLog('[AddBtn] field match', fieldName);

            let isNewId = true;
            let watchValue = undefined;
            let valueToApply = undefined;
            const cache = getSelectionCache(messageObj.type);
            if (isKeyValue) {
              watchValue = getValues(`${theIndexedField}.${propertyKey}`);
              valueToApply = cache ? cache.meta?.name : '';

              //REF
              if (arrayMethods?.replace) {
                console.log('use replace', cache?.meta?.name);
                const arr = getValues(fieldName);
                console.log('arr', arr);
                console.log('row index', rowIndex);
              }

              //there is no replace method for key value pairs
              setValue(
                `${theIndexedField}.name`,
                cache ? cache.meta?.name : '',
              );
              setValue(
                `${theIndexedField}.${propertyKey}`,
                cache ? cache.id : '',
              );
            } else {
              watchValue = getValues(theIndexedField);
              valueToApply = cache ? cache.id : '';

              if (arrayMethods?.replace) {
                const arr = getValues(fieldName);
                arr[rowIndex] = valueToApply;
                arrayMethods.replace(arr);
              } else {
                setValue(theIndexedField, valueToApply);
              }
            }

            if (onApplySelection) {
              onApplySelection(topicId, cache || '');
            }

            isNewId = cache ? cache.id !== watchValue : false;

            // only trigger if changed (prevents clearing of data api read error)
            // UUIDFieldInspector may have a api error set in it's local state
            // trigger causes a rerender and this api error gets lost when the form field yup validation reevaluated
            if (isNewId) {
              if (isKeyValue) {
                trigger([
                  `${theIndexedField}.name`,
                  `${theIndexedField}.${propertyKey}`,
                ]);
              } else {
                trigger(theIndexedField);
              }
            }
          } else {
            debugLogError('Missing Form Methods - Could Not Apply Selection');
          }
          dispatch(setMessage({ type: '', message: '' }));
        }
      }
    }
  }, [
    formMethods,
    arrayMethods,
    selectionArr,
    messageObj.message,
    messageObj.meta?.indexedArrayField,
  ]);

  return (
    <ButtonModalMinorUi
      aria-label="Add"
      id="add-button"
      size="small"
      disabled={isDisabled}
      startIcon={buttonIcon}
      onClick={(event) => {
        onClick(event);
      }}
    >
      ADD
    </ButtonModalMinorUi>
  );
}
