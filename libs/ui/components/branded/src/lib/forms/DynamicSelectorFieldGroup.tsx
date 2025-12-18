import { useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  message,
  selection,
  setMessage,
  useClearCacheSelection,
  useGetCacheSelection,
  useCurrentSelection,
  FormCrudType,
} from '@rapid-cmi5/ui/redux';

/* Branded */
import {
  tFormFieldRendererProps,
  useDisplayFocus,
  useIsVisible,
} from '@rapid-cmi5/ui/branded';

/* MUI */
import { TextFieldProps } from '@mui/material/TextField';
import { ButtonSelectUi } from '@rapid-cmi5/ui/api/hooks';
import UUIDFieldInspector, {
  tUUIDFieldInspectorProps,
} from './UUIDFieldInspector';

export enum ClearedUuidValue {
  Empty,
  Null,
  Undefined,
}
const defaultClearedUuidValue = ClearedUuidValue.Empty;
/**
 * @interface DynamicSelectorFieldGroupProps
 * @property {boolean} [allowClear=false] Show Clear icon 'X' to clear the field
 * @property {any} [apiHook] Hook for getting individual item by uuid
 * @property {ClearedUuidValue} [clearedUuidValue=ClearedUuidValue.Empty] Set field to this value when cleared
 * @property {FormCrudType} crudType Current mode of form
 * @property {string} [dataIdField] Alternate uuid property for applying selection data
 * @property {string} [marginTop = '-12px'] Negative margin for top of layout
 * @property {tFormFieldRendererProps} formProps React hook form props
 * @property {string} [infoText] Helper text for field
 * @property {Partial<tUUIDFieldInspectorProps>} [inspectorProps] Properties passed to UUIDFieldInspector
 * @property {boolean} [isKeyValue = false] indicates data is in form of a key value pair
 * @property {string} itemName Name of item (used for labeling of selection button/field/placeholder text/default viewTooltip)
 * @property {string} [modalFormId] Id for form to view item in modal
 * @property {string} [placeholder] Placeholder text for selection field when no value is selected
 * @property {string} [propertyKey = 'value'] If field is a keyValue pair, retrieve display value with this propertyKey
 * @property {string} queryKey Key for query cache
 * @property {string} [selectButtonFocusId] Id for select button
 * @property {string} selectionModalId Id for modal to select from list of items
 * @property {string} selectionTargetId Id for applying selection (typically to a form)
 * @property {boolean} [shouldApplySelections = false] Whether to apply single selections from modals
 * @property {boolean} [shouldShowButtonText = true] Whether to show label on the button. If false, only icon will appear
 * @property {boolean} [shouldShowLabelText = false] Whether to always show label on the uuid field. If false, only shows on modal or readOnly
 * @property {TextFieldProps} [textFieldProps] Any additional MUI TextField props needed (e.g., required)
 * @property {(data: any, index: number) => any} [getRenderItems] Method used to retriee additional fields to render with the name field
 * @property {(selId:string, value:any)=> void} onApplySelection Callback method with data selected. Useful outside of FormFieldArray to handle selection.
 * @property {(fieldName: string, newValue: string) => void} [onWatchValueChange] Method to call when change of this field may affect something
 */
interface DynamicSelectorFieldGroupProps {
  allowClear?: boolean;
  apiHook?: any;
  clearedUuidValue?: ClearedUuidValue;
  crudType: FormCrudType;
  dataIdField?: string;
  marginTop?: string;
  formProps: tFormFieldRendererProps; //TODO - cleanup this type - really extending formcontroltextfield
  infoText?: string;
  inspectorProps?: Partial<tUUIDFieldInspectorProps>;
  isKeyValue?: boolean;
  itemLabel?: string;
  itemName?: string;
  placeholder?: string;
  propertyKey?: string;
  queryKey: string;
  selectButtonFocusId?: string;
  selectionFilters?: any;
  selectionTargetId?: string; //typically form topic
  shouldApplySelections?: boolean;
  shouldOverrideSelectionName?: boolean;
  shouldPopModal?: boolean;
  shouldRestrictToInDesignOnly?: boolean;
  shouldShowButtonText?: boolean;
  shouldShowLabelText?: boolean;
  textFieldProps?: TextFieldProps;
  topicId: string;
  getRenderItems?: (data: any, index: number) => any;
  onApplySelection?: (selectionId: string, value: any) => void;
  onWatchValueChange?: (fieldName: string, newValue: string) => void;
  onSelectionCleared?: (
    fieldName: string,
    newValue: null | undefined | string,
  ) => void;
}

/**
 * DynamicSelectorFieldGroup is an arrayRenderItem component to allow
 *   - selection of an item into array (see FormFieldArray component)
 *   - display of the uuid -> converted to name
 *   - optional allow viewing item in form
 * @param {DynamicSelectorFieldGroupProps} [props]
 * @returns {React.ReactElement}
 */
export function DynamicSelectorFieldGroup(
  props: DynamicSelectorFieldGroupProps,
) {
  const {
    topicId,
    allowClear = false,
    apiHook,
    clearedUuidValue = defaultClearedUuidValue,
    crudType,
    dataIdField = 'uuid',
    marginTop = '0px',
    formProps,
    infoText = '',
    isKeyValue = false,
    itemLabel,
    itemName = topicId,
    placeholder,
    propertyKey = 'value', //OBE always value refactor
    queryKey,
    selectButtonFocusId = 'select-' + topicId + '-' + (formProps.rowIndex || 0),
    selectionFilters,
    selectionTargetId,
    inspectorProps = {
      shouldFetch: crudType !== FormCrudType.design,
      shouldResolve: true,
    },
    shouldApplySelections = false,
    shouldOverrideSelectionName = false,
    shouldRestrictToInDesignOnly = false,
    shouldShowButtonText = false,
    shouldShowLabelText = false,
    shouldPopModal = true,
    textFieldProps = {},
    getRenderItems,
    onApplySelection,
    onWatchValueChange,
    onSelectionCleared,
  } = props;

  const {
    formMethods,
    isFocused = false,
    fieldName,
    indexedArrayField,
    indexedErrors,
    isModal = false,
    isValid,
    readOnly,
  } = formProps; //props that are passed by

  const { control, getValues, setError, setValue, trigger, watch } =
    formMethods;

  //modal
  const selectionModalId = `select-${topicId.toLowerCase()}`;
  const viewModalId = shouldPopModal ? `view-${topicId.toLowerCase()}` : '';

  const dispatch = useDispatch();
  const clearSelectionCaches = useClearCacheSelection();
  const getSelectionCache = useGetCacheSelection();
  const messageObj = useSelector(message);
  const selectionArr = useSelector(selection);
  const selectionHelper = useCurrentSelection();
  const focusHelper = useDisplayFocus();

  const divRef = useRef(null);
  const isVisible = useIsVisible(divRef);

  const watchKey = !shouldOverrideSelectionName
    ? watch(`${indexedArrayField}.name`)
    : watch(indexedArrayField);

  const watchValue = isKeyValue
    ? watch(`${indexedArrayField}.${propertyKey}`)
    : watch(indexedArrayField);

  // some keyValue Pair fields only show the value,
  //so check if error on key(name) OR value(example range certs in ContainerSpec)
  let fieldError: any = null;
  if (isKeyValue) {
    fieldError = indexedErrors?.name;
    if (!fieldError) {
      fieldError =
        indexedErrors && indexedErrors.hasOwnProperty(propertyKey)
          ? indexedErrors[propertyKey]
          : null;
    }
  } else {
    fieldError = indexedErrors;
  }

  const placeholderStr =
    placeholder ||
    (readOnly
      ? 'None'
      : (textFieldProps?.required
          ? '<-- Field is required. Click to select '
          : '<-- Select ') + itemName);

  /**
   * Clears the field value as well as selection cache
   * @param {string} fieldName Name of field being cleared
   */
  const handleClearSelection = (fieldName: string) => {
    let newClearValue = undefined;
    switch (clearedUuidValue) {
      case ClearedUuidValue.Undefined:
        newClearValue = undefined;
        break;
      case ClearedUuidValue.Null:
        newClearValue = null;
        break;
      default:
        newClearValue = '';
    }

    setValue(fieldName, newClearValue);
    if (onSelectionCleared) {
      onSelectionCleared(fieldName, newClearValue);
    }
    clearSelectionCaches([selectionModalId]);
    if (isKeyValue) {
      trigger(`${indexedArrayField}.name`);
    } else {
      trigger(indexedArrayField);
    }
  };

  const handleKeyChange = (keyName: string) => {
    if (isKeyValue) {
      const newObj = getValues(indexedArrayField);
      newObj.name = keyName;
      setValue(indexedArrayField, newObj);
      trigger(`${indexedArrayField}.name`);
    }
  };

  /**
   * Memo for resolving record uuid to name
   */
  const uuidMemo = useMemo(() => {
    return (
      <UUIDFieldInspector
        initialAlias={isKeyValue ? watchKey : watchValue}
        isKeyValue={isKeyValue}
        apiHook={apiHook}
        crudType={
          crudType === FormCrudType.create || crudType === FormCrudType.edit
            ? FormCrudType.edit
            : crudType //if parent is editable, pop up form should be
        }
        disabled={isModal || !watchValue}
        filters={{ id: watchValue }}
        modalFormId={viewModalId}
        queryKey={queryKey}
        uuid={watchValue}
        getRenderItems={getRenderItems}
        formFieldProps={{
          control: control,
          error: Boolean(fieldError),
          helperText: fieldError?.message,
          infoText: infoText,
          isValid: isValid,
          name: isKeyValue
            ? `${indexedArrayField}.${propertyKey}`
            : indexedArrayField,
          label: shouldShowLabelText
            ? itemLabel || (isKeyValue === true ? 'Name' : itemName)
            : '',
          placeholder: placeholderStr,
          readOnly:
            isKeyValue &&
            (crudType === FormCrudType.create || crudType === FormCrudType.edit)
              ? false
              : true, //dont allow people to type in directly
          required: textFieldProps?.required || false,
          setError: setError,
          disabled: textFieldProps?.disabled || crudType === FormCrudType.view, //preserves interactive color unless viewing a readonly modal
          onChange: handleKeyChange,
          onClear: allowClear && !readOnly ? handleClearSelection : undefined,
        }}
        topicId={topicId}
        {...inspectorProps}
      />
    );
  }, [fieldError?.message, watchKey, watchValue]);

  // this effect is for when form has other field(s) dependent on this one
  // so form can sync as appropriate (example: allow Network OR IP but not both)
  useEffect(() => {
    if (onWatchValueChange) {
      onWatchValueChange(indexedArrayField, watchValue);
    }
  }, [watchValue]);

  // this effect is for focusing on select button
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(selectButtonFocusId);
    }
  }, [isFocused]);

  /**
   * UseEffect handles applying selected item
   * Pulls selected value from redux
   * Updates appropriate form field with the selected value
   */
  useEffect(() => {
    if (
      (!shouldApplySelections && !onApplySelection) ||
      messageObj.message !== 'apply'
    ) {
      return;
    }
    if (messageObj.type === selectionModalId) {
      //match modal
      console.log(
        'messageObj.meta?.indexedArrayField ' +
          messageObj.meta?.indexedArrayField,
        indexedArrayField,
      );
      if (messageObj.meta?.indexedArrayField === indexedArrayField) {
        //match field
        let isNewId = true;
        const cache = getSelectionCache(messageObj.type);
        //check for cache
        if (cache) {
          // this is to prevent issue with parent form with same field name as a popped modal form being edited
          if (
            selectionTargetId &&
            cache?.modalMeta &&
            cache.modalMeta?.selectionTargetId !== selectionTargetId
          ) {
            return;
          }
          if (onApplySelection) {
            onApplySelection(topicId, cache);
          }
          if (!shouldApplySelections) {
            dispatch(setMessage({ type: '', message: '' }));
            return;
          }
          if (isKeyValue) {
            setValue(`${indexedArrayField}.name`, cache.meta?.name ?? '');
            setValue(`${indexedArrayField}.${propertyKey}`, cache.id);
          } else {
            setValue(indexedArrayField, cache.id);
          }
          isNewId = cache.id !== watchValue;
        } else {
          if (onApplySelection) {
            onApplySelection(topicId, '');
          }
          if (!shouldApplySelections) {
            dispatch(setMessage({ type: '', message: '' }));
            return;
          }

          //update form
          if (isKeyValue) {
            setValue(`${indexedArrayField}.name`, '');
            setValue(`${indexedArrayField}.${propertyKey}`, '');
          } else {
            setValue(indexedArrayField, '');
          }
        }

        // only trigger if changed (prevents clearing of data api read error)
        // UUIDFieldInspector may have a api error set in it's local state
        // trigger causes a rerender and this api error gets lost when the form field yup validation reevaluated
        if (isNewId) {
          if (isKeyValue) {
            trigger([
              `${indexedArrayField}.name`,
              `${indexedArrayField}.${propertyKey}`,
            ]);
          } else {
            trigger(indexedArrayField);
          }
        }
        dispatch(setMessage({ type: '', message: '' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionArr, messageObj.message, messageObj.meta?.indexedArrayField]);

  const handleOpenSelection = (event: any) => {
    console.log('clickerd opn');
    const selectionData = {
      dataIdField,
      modalId: selectionModalId,
      selId: watchValue,
      modalMeta: {
        filters: selectionFilters,
        rowIndex: formProps.rowIndex,
        selectionTargetId: selectionTargetId || '',
        fieldName: fieldName,
        indexedArrayField: indexedArrayField,
        propertyKey,
        isKeyValue,
        shouldSkipQuery: shouldRestrictToInDesignOnly,
      },
      selName: watchKey,
      topicId,
    };

    console.log("se3lection data", selectionData);
    selectionHelper.openSelection(selectionData);
  };

  return (
    <div
      className="content-row-icons"
      ref={divRef}
      style={{ marginTop: marginTop, gap: '4px' }} //negative margin to undo extra div vertical
    >
      <>
        {!readOnly && (
          <ButtonSelectUi
            aria-label={`select-${itemName}`}
            id={selectButtonFocusId}
            onClick={handleOpenSelection}
            sxProps={
              shouldShowButtonText
                ? {
                    width: 'auto',
                    minWidth: '90px', //hack for node 1, node 2 in BGP Link Form
                    marginBottom: '8px',
                  }
                : { width: '40px', minWidth: '0px', marginBottom: '8px' }
            }
          >
            {shouldShowButtonText ? itemName : ''}
          </ButtonSelectUi>
        )}
        {uuidMemo}
      </>
    </div>
  );
}

export default DynamicSelectorFieldGroup;
