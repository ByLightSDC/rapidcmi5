/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  DragEvent,
  useMemo,
} from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';

/* Form */
import FormControlTextField from './FormControlTextField';
import {
  ButtonInfoFormHeaderLayout,
  ButtonIcon,
  ButtonInfoField,
} from '../inputs/buttons/buttons';

import { ButtonModalMinorUi } from '../inputs/buttons/buttonsmodal';
import { useDisplayFocus } from '../hooks/useDisplayFocus';

/* MUI */
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Variant } from '@mui/material/styles/createTypography';

/* Icons */
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import ListIcon from '@mui/icons-material/List';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PlusOneIcon from '@mui/icons-material/PlusOne';

import { StepperContext } from '../navigation/stepper/StepperContext';
import ModalDialog from '../modals/ModalDialog';
import MultiSelectButton, { MultiSelectButtonProps } from './MultiSelectButton';
import { useDispatch, useSelector } from 'react-redux';
import { expanded, message, setExpanded } from '@rangeos-nx/ui/redux';
import { AddButton, SingleSelectButtonProps } from './AddButton';
import { FormCrudType } from './constants';

/* Style to deliminate between items */
export enum DelimStyle {
  Box = 'box',
  Divider = 'divider',
  None = 'none',
}

/* Style used for Box delimeter style */
const itemBoxStyle = {
  borderStyle: 'solid',
  borderWidth: '1px',
  display: 'flex',
  alignContent: 'center',
  backgroundColor: (theme: any) => `${theme.nav.fill}`,
  borderColor: (theme: any) => `${theme.input.outlineColor}`,
  borderRadius: '8px',
  padding: '2px',
  paddingLeft: '12px',
  paddingTop: '12px',
};

/* these positions are used to "align self" in the row */
export enum ItemNumberPosition {
  LeftCenter = 'center',
  LeftTop = 'start',
}
export enum ItemDeletePosition {
  RightCenter = 'center',
  RightTop = 'start',
}

// need to use the actual form entry values for displaying data instead of "fields"
// because fields does not handle an "empty" simple element correctly ('') - it thinks it doesn't exist
// when you switch to a different "step" for a form and come back the empty one is gone from fields
// (but empty value and error still exist)
// since array entries may not exist yet in form data at first render protect against possible .length error

/**
 * @type {Object} tFormFieldArrayProps
 * @property {boolean} [allowSingleItemView=false] Whether to allow switching between list view and single item view for the array
 * @property {boolean} [defaultSingleItemView=false] Whether to default view to single item view (see allowSingleItemView)
 * @property {string} arrayFieldName form fieldname of the array
 * @property {string} [altArrayFieldName] actual db fieldname of array if different from arrayFieldName - use for reorder
 * @property {JSX.Element} [buttonIcon] icon to use on Add button (instead of +1)
 * @property {*} [buttonIconSxProps] style props to apply to icon button
 * @property {UseFormReturn} formMethods React hook form methods
 * @property {any} [errors] Form errors for determining field(s) that have errors
 * @property {boolean} [isModal=false] Indication of form being displayed as modal (default=false) (from tFormFieldRendererProps)
 * @property {boolean} [isValid] React hook form valid indicator
 * @property {string} [defaultLabel] Label to show above field when using DefaultRenderItem
 * @property {string} placeholder Placeholder text for render item
 * @property {boolean} [readOnly=false] Indication that field is (not) editable
 * @property {DelimStyle} [delimStyle=DelimStyle.Divider] Style to use to deliminate between items
 * @property {ItemDeletePosition} [itemDeletePosition = ItemDeletePosition.RightCenter] Override position of delete button for row
 * @property {itemNumberPosition} [itemNumberPosition = itemNumberPosition.LeftCenter] Override position of delete button for row
 * @property {(props: tFormFieldRendererProps) => JSX.Element} [arrayRenderItem] custom omponent containing the field(s) for the given array row
 * @property {boolean}   [defaultIsExpanded=true] Whether array area should initially be expanded
 * @property {any}   defaultValues default values to assign to fields of added array row
 * @property {string} [deleteTooltip="Delete"] Override for tooltip to delete row
 * @property {string}   [expandTestId='array-expand'] test id for expand button
 * @property {boolean} [hideArrayErrorIfElements=false] Hide the top level array error if elements are present (workaround for yup issue with array nested in object in another array)
 * @property {string | null}   [infoTextTitle] message to display on hover of info icon
 * @property {boolean}   [isExpandable=false] whether to allow collapse/expand of array list
 * @property {number}   [maxArrayLength] indicate a maximum number of entries for array -- add button will be disabled when reached
 * @property {string}   [noneFoundMessage='No items found'] Message to display when array is empty
 * @property {JSX.Element}   [multiSelectButtonProps] If present - show a multiselect button before add button
 * @property {string}   [title=''] Title for the array
 * @property {TypographyPropsVariantOverrides}   [titleVariant='h5'] Typography variant for the array title
 * @property {string}   [width='100%'] Width for the component to use
 * @property {() => void} [onAddEntry] Method to call after adding an entry
 * @property {(index: number) => void}   [onDeleteEntry] Altnernate delete method
 * @property {() => void}   [onReorderEntry] Method to call after reordering item
 * @property {(index: number) => void}   [onWarnDeleteEntry] Method called before item deleted
 */
type tFormFieldArrayProps = {
  //array field props
  formMethods: UseFormReturn;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowReOrder?: boolean;
  allowSingleItemView?: boolean;
  arrayFieldName: string;
  altArrayFieldName?: string; //for reorder
  buttonIcon?: JSX.Element;
  buttonIconSxProps?: any;
  errors: any;
  expandId?: string;
  isKeyValue?: boolean;
  isModal?: boolean;
  isValid?: boolean;
  isVisibleAdd?: boolean;
  isVisibleDeleteAll?: boolean;
  defaultLabel?: string;
  placeholder?: string;
  readOnly?: boolean;
  //other
  arrayRenderItem?: (props: tFormFieldRendererProps) => JSX.Element;
  defaultIsExpanded?: boolean;
  defaultSingleItemView?: boolean;
  defaultValues: any;
  deleteTooltip?: string;
  expandTestId?: string;
  hideArrayErrorIfElements?: boolean;
  infoTextTitle?: string | JSX.Element | null;
  isExpandable?: boolean;
  delimStyle?: DelimStyle;
  itemDeletePosition?: ItemDeletePosition;
  itemNumberPosition?: ItemNumberPosition;
  maxArrayLength?: number;
  noneFoundMessage?: string;
  multiSelectButtonProps?: MultiSelectButtonProps;
  singleSelectButtonProps?: SingleSelectButtonProps;
  title?: string;
  titleVariant?: Variant | undefined;
  topic?: string;
  width?: string;
  onAddEntry?: () => void;
  onCountChange?: (fieldArrName: string, count: number) => void;
  onDeleteEntry?: (index: number) => void;
  onReorderEntry?: () => void;
  onWarnDeleteEntry?: (index: number) => void;
};

/**
 * @interface tFormFieldRendererProps
 * @prop {UseFormReturn} formMethods React hook form methods
 * @prop {string} arrayFieldName Form field name for array row entry (e.g. demoArray[0])
 * @prop {any} indexedErrors React hook form error(s) for array row entry
 * @prop {boolean} [isFocused] Indication that arrayRenderItem should handle focus (e.g., when needing to focus on select button)
 * @prop {boolean} [isModal=false] Indication of form being displayed as modal (default=false)
 * @prop {boolean} [isValid] React hook form valid indicator
 * @prop {string} [label] Label to display for field (can be used when rendering with DefaultRenderItem)
 * @prop {string} placeholder Placeholder text for selection
 * @prop {boolean} readOnly Indication that field is (not) editable
 * @prop {number} [rowIndex] Index into array for this row
 * @prop {any} [onChange] Fxn to call when change is made to field
 **/
export type tFormFieldRendererProps = {
  formMethods: UseFormReturn;
  fieldName: string;
  indexedArrayField: string;
  indexedErrors: any;
  isFocused?: boolean;
  label?: string;
  placeholder: string;
  readOnly: boolean;
  rowIndex?: number;
  isModal?: boolean;
  isValid?: boolean;
  onChange?: any;
};

/**
 * Form Field Array Component renders a list of strings or objects
 * using a custom render item, a default render item, or a FormControlTextField
 * See DemoForm for examples
 * @param {tFormFieldArrayProps} props Component props
 * @returns {React.ReactElement}
 *
 */
export function FormFieldArray({
  //array field props
  formMethods,
  allowAdd = true,
  allowDelete = true,
  allowReOrder = false,
  allowSingleItemView = false,
  arrayFieldName,
  altArrayFieldName,
  buttonIcon = <PlusOneIcon />,
  buttonIconSxProps = {},
  errors,
  expandId,
  isKeyValue = false,
  isModal = false,
  isValid,
  isVisibleAdd = true,
  isVisibleDeleteAll = true,
  defaultLabel = '',
  placeholder = '',
  readOnly = false,
  //other
  defaultIsExpanded = true,
  defaultSingleItemView = false,
  defaultValues,
  deleteTooltip = 'Delete',
  expandTestId = 'array-expand',
  hideArrayErrorIfElements = false,
  infoTextTitle = null,
  isExpandable = false,
  delimStyle = DelimStyle.Divider,
  itemDeletePosition = ItemDeletePosition.RightCenter,
  itemNumberPosition = ItemNumberPosition.LeftCenter,
  maxArrayLength = 50,
  multiSelectButtonProps,
  noneFoundMessage = 'No items found',
  singleSelectButtonProps,
  title = '',
  titleVariant = 'h5',
  topic,
  width = '100%',
  arrayRenderItem,
  onAddEntry,
  onCountChange,
  onDeleteEntry,
  onReorderEntry,
  onWarnDeleteEntry,
}: tFormFieldArrayProps) {
  const messageObj = useSelector(message);
  const { control, getValues, setValue, clearErrors, trigger, watch } =
    formMethods;
  const { fields, append, insert, remove, replace } = useFieldArray({
    control,
    name: arrayFieldName,
  });

  const altFieldArrHelper = useFieldArray({
    control,
    name: altArrayFieldName || arrayFieldName,
  });

  const expandedSel = useSelector(expanded);

  const defaultExpandOverride = expandId
    ? expandedSel.hasOwnProperty(expandId)
      ? expandedSel[expandId]
      : defaultIsExpanded
    : defaultIsExpanded;

  //const watchArrData = watch(arrayFieldName);

  const dispatch = useDispatch();
  const stepperContext = useContext(StepperContext);
  const notifyTimeout = useRef<NodeJS.Timeout>(); //Timer for checking if focus element is available in DOM
  const timeOutSeconds = 500;
  const focusHelper = useDisplayFocus();
  const [isPromptDelete, setIsPromptDelete] = useState(false);
  const [isListView, setIsListView] = useState(
    !(allowSingleItemView && defaultSingleItemView),
  );
  const isAdding = useRef<boolean>(false);
  const [shouldSynch, setShouldSynch] = useState(false);
  const [listCount, setListCount] = useState(fields?.length || 0);
  const [currentItemNumber, setCurrentItemNumber] = useState(0);
  const [isRemoveItemDisabled, setisRemoveItemDisabled] = useState(readOnly);
  const [isExpanded, setIsExpanded] = useState(defaultExpandOverride);
  const renderItem = arrayRenderItem ? arrayRenderItem : DefaultRenderItem;
  const [isReOrderingEnabled, setIsReOrderingEnabled] = useState(false); //whther drag and drop to reorder is active
  const [shouldReorderRefresh, setShouldReorderRefresh] = useState(false); //if alt field name, update after a reorder
  const [rowFocused, setRowFocused] = useState(-1);
  const [lastEl, setLastEl] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number>(-1);
  const startIndex = useRef<number>(-1);

  // array may or may not be nested, in either case
  // the error is the "last" slice of the field name (e.g., certificates.usages => usages or tags => tags)
  const arrayErrorName = arrayFieldName.slice(
    arrayFieldName.lastIndexOf('.') + 1,
  );
  const arrayErrors =
    errors && errors.hasOwnProperty(arrayErrorName)
      ? errors[arrayErrorName]
      : null;

  // expand stuff
  const iconTransform = isExpanded ? 'rotate(180deg)' : 'rotate(90deg)';

  /**
   * Expand and Collapse Array
   * Persist display visibility state
   */
  const toggleExpanded = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    if (expandId) {
      dispatch(setExpanded({ key: expandId, value: newValue }));
    }
  };

  // check for no top level error but has array element error(s)

  const isAddDisabled = useMemo(() => {
    return (
      !allowAdd ||
      readOnly ||
      listCount >= maxArrayLength ||
      (fields.length > 0 && arrayErrors && !arrayErrors.message)
    );
  }, [!allowAdd, readOnly, arrayErrors, fields, listCount]);

  const isDeleteAllDisabled = !allowDelete || readOnly || fields.length === 0;
  const isRemoveDisabled = !allowDelete || readOnly || isRemoveItemDisabled;

  /** Focus last item and scroll to make it visible */
  const checkScrollToBottom = () => {
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }
    scrollToLastAndFocus();
  };
  const scrollToLastAndFocus = () => {
    if (lastEl) {
      if (!focusHelper.scrollToElementById(lastEl)) {
        notifyTimeout.current = setTimeout(() => {
          checkScrollToBottom();
        }, timeOutSeconds);
      } else {
        //item is rendered, now focus it
        setRowFocused(fields.length - 1);
      }
      isAdding.current = false;
    }
  };

  /**
   * UE Cleans up blank form field array entries on unmount
   */
  useEffect(() => {
    // CCUI-1684 without this return, sync was happening before cache can be applied
    // synch was out of date with cache
    if (messageObj.type) {
      setShouldSynch(true);
      return;
    }
    const multiData = getValues(arrayFieldName);

    if (
      (multiData && fields?.length !== multiData?.length) ||
      (multiData &&
        multiData.length > 0 &&
        multiData[multiData.length - 1] === '')
    ) {
      if (multiData.length > 0 && multiData[multiData.length - 1] === '') {
        // do not apply this
      } else {
        setListCount(multiData.length);
        replace(multiData);
      }
    }

    return () => {
      if (stepperContext && stepperContext.isStepperEnabled) {
        // check for empty values in the form
        // not fields does not match getValues at this moment
        const theValues = getValues(arrayErrorName);
        if (theValues?.length > 0) {
          //REF console.log(`${arrayFieldName} has outgoing errors`, theValues);
          const lastValue = theValues[theValues.length - 1];
          let isEmpty = false;

          if (defaultValues === '') {
            //assume array item is a string
            if (lastValue === '') {
              isEmpty = true;
              theValues.splice(theValues.length - 1, 1);
              setValue(arrayFieldName, theValues);
            }
          } else {
            isEmpty = true;
            if (Object.prototype.hasOwnProperty.call(lastValue, 'name')) {
              //assume key value pair with name as key
              if (lastValue['name'] !== '') {
                isEmpty = false;
              }
            } else {
              //we dont know what the keys are, so check to see if they are all empty
              const kk = Object.keys(lastValue);
              isEmpty = true;
              for (let i = 0; i < kk.length; i++) {
                if (lastValue[kk[i]] !== '') {
                  isEmpty = false;
                  break;
                }
              }
            }
            if (isEmpty) {
              theValues.splice(theValues.length - 1, 1);
              setValue(arrayFieldName, theValues);
            }
          }
          if (isEmpty) {
            // console.log('clearing empties & errors here');
            clearErrors(arrayErrorName);
          }
        }
      }

      if (notifyTimeout.current !== undefined) {
        clearTimeout(notifyTimeout.current);
      }
    };
  }, []);

  /**
   * UE Cleans up blank form field array entries on unmount
   */
  useEffect(() => {
    if (messageObj.type && shouldSynch) {
      setShouldSynch(false);
    }

    const multiData = getValues(arrayFieldName);
    if (
      (multiData && fields?.length !== multiData?.length) ||
      (multiData &&
        multiData.length > 0 &&
        multiData[multiData.length - 1] === '')
    ) {
      if (multiData[multiData.length - 1] === '') {
        // dont apply ['']
      } else {
        setListCount(multiData.length);
        replace(multiData);
      }
    }
  }, [shouldSynch, messageObj.type]);

  /**
   * useEffect checks button state when list count changes
   */
  useEffect(() => {
    // check for array count change
    if (listCount !== fields?.length) {
      // need to trigger validation on array when length changes to update array level errors appropriately
      trigger(arrayFieldName);

      // clean up when in single list view
      if (
        !isListView &&
        fields.length &&
        currentItemNumber > fields.length - 1
      ) {
        setCurrentItemNumber(fields.length - 1);
      }

      setListCount(fields?.length);
      if (onCountChange) {
        onCountChange(arrayFieldName, fields.length);
      }
      // update bottom most row (only when adding using single select)
      // this prevents scrolling when multiselect or deleting an entry
      if (isAdding.current) {
        setLastEl(`${arrayFieldName}[${fields.length - 1}]`);
      }
    }
  }, [fields?.length]);

  useEffect(() => {
    checkScrollToBottom();
  }, [lastEl]);

  const multiProps = multiSelectButtonProps
    ? {
        ...multiSelectButtonProps,
        arrayMethods: { append: append, replace: replace },
        fieldName: arrayFieldName,
      }
    : undefined;

  const singleProps = singleSelectButtonProps
    ? {
        ...singleSelectButtonProps,
        arrayMethods: { append: append, replace: replace },
      }
    : undefined;

  /**
   * Add Button Click
   * @param event
   */
  const handleAdd = (event: any) => {
    event.stopPropagation();
    isAdding.current = true;
    append(defaultValues);
    setIsExpanded(true);
    setCurrentItemNumber(fields.length);
    if (onAddEntry) {
      onAddEntry();
    }
    if (expandId) {
      dispatch(setExpanded({ key: expandId, value: true }));
    }
  };

  //#region Drag and Drop

  /**
   * Store pick up index
   * @param {*} event
   * @param {string} key
   * @param {number} index
   */
  const handleDragStart = (event: DragEvent, key: string, index: number) => {
    startIndex.current = index;
  };

  /**
   * Update pick up index
   * @param {*} event
   * @param {string} key
   * @param {number} index
   */
  const handleDragOver = (event: any, key: string, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    const dim = event.target.getBoundingClientRect();
    const cy = event.clientY - dim.top;
    const insertIndex = Math.min(cy >= 14 ? index + 1 : index, fields.length);

    setDragIndex(insertIndex);
  };

  /**
   * Update pick up index
   * @param {*} event
   * @param {string} key
   * @param {number} index
   */
  const handleDragLeave = (event: DragEvent, key: string, index: number) => {
    setDragIndex(-1);
  };

  /**
   * Drop items
   * @param {*} event
   * @param {string} key
   * @param {number} index
   */
  const handleDrop = (event: DragEvent, key: string, index: number) => {
    if (dragIndex < 0 || startIndex.current === dragIndex) {
      //do nothing
    } else {
      //insert
      const startField = `${arrayFieldName}[${startIndex.current}]`;
      const startData = getValues(startField);
      const insertIndex = dragIndex;
      const removeIndex =
        insertIndex < startIndex.current
          ? startIndex.current + 1
          : startIndex.current;
      insert(insertIndex, startData);
      remove(removeIndex); //move to a second render
      // need to also drop the DB field array entry if different from the field array
      if (altArrayFieldName) {
        const startAltField = `${altArrayFieldName}[${startIndex.current}]`;
        const startAltData = getValues(startAltField);
        altFieldArrHelper.insert(insertIndex, startAltData);
        altFieldArrHelper.remove(removeIndex);
      }
      if (onReorderEntry) {
        onReorderEntry();
      }
      setDragIndex(-1);
    }
  };
  //#endregion

  // the "counter" portion of array title depends on whether array is in list view or single item view
  const titleCounter = isListView
    ? '' + listCount
    : listCount === 0
      ? '0'
      : currentItemNumber + 1 + ' / ' + listCount;

  // information for when viewing single item
  const singleItem: any =
    allowSingleItemView && fields.length > 0 ? fields[currentItemNumber] : {};
  const localId =
    singleItem?.uuid || singleItem?.name || singleItem?.id || currentItemNumber;

  const singleFieldKey = `${localId}${arrayFieldName}`;
  const singleIndexedField = `${arrayFieldName}[${currentItemNumber}]`;
  const singleIndexedErrors = arrayErrors
    ? arrayErrors[currentItemNumber]
    : null;

  const singleItemProps = {
    formMethods,
    fieldName: arrayFieldName,
    indexedArrayField: singleIndexedField,
    indexedErrors: singleIndexedErrors,
    isModal,
    label: defaultLabel,
    placeholder,
    readOnly,
    rowIndex: currentItemNumber,
    isValid,
    isFocused: rowFocused === currentItemNumber,
  };

  return (
    <section role="list" style={{ width }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: 'auto', //REF '90%' grows to fit content
          alignItems: 'center',
        }}
      >
        <div>
          <div className="content-row-icons">
            {isExpandable && (
              <ListItemIcon data-testid={expandTestId} onClick={toggleExpanded}>
                <ExpandLessIcon
                  color="primary"
                  sx={{ transform: iconTransform }}
                />
              </ListItemIcon>
            )}
            {title && (
              <Typography variant={titleVariant} sx={{ paddingRight: '4px' }}>
                {title + '  '}({titleCounter})
              </Typography>
            )}
            {infoTextTitle && (
              <ButtonInfoField
                message={infoTextTitle}
                props={{ sx: ButtonInfoFormHeaderLayout }}
              />
            )}
            <div
              style={{
                paddingLeft: '12px',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {!readOnly && (
                <>
                  {multiProps && <MultiSelectButton {...multiProps} />}
                  {isVisibleAdd && (
                    <AddButton
                      isDisabled={isAddDisabled}
                      isKeyValue={isKeyValue}
                      buttonIcon={buttonIcon}
                      formMethods={formMethods}
                      fieldName={arrayFieldName}
                      topicId={multiProps?.topicId || topic}
                      onClick={handleAdd}
                      {...singleProps}
                    />
                  )}
                </>
              )}
              {allowSingleItemView && fields.length > 1 && (
                <Box
                  sx={{
                    height: '32px',
                    marginTop: '2px',
                    marginLeft: '4px',
                    marginRight: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                    backgroundColor: (theme: any) => `${theme.nav.fill}`,
                    borderColor: (theme: any) => 'primary.light',
                    borderStyle: 'none',
                    borderWidth: '1px',
                  }}
                >
                  <Tooltip
                    arrow
                    enterDelay={500}
                    enterNextDelay={500}
                    title={fields.length > 0 ? 'List View' : ''}
                    placement="bottom"
                  >
                    <span>
                      <IconButton
                        id="list-view-button"
                        aria-label="list-view"
                        color="inherit"
                        disabled={isListView}
                        size="small"
                        sx={{ height: '32px' }}
                        onClick={() => {
                          setCurrentItemNumber(0);
                          setIsListView(true);
                        }}
                      >
                        <ListIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Divider
                    orientation="vertical"
                    // variant="middle"
                    flexItem
                    sx={{
                      backgroundColor: (theme: any) => `primary.light`,
                      borderRadius: '2px',
                      // top/bottom  left/right
                      margin: '4px 0px',
                      width: '2px',
                    }}
                  />
                  <Tooltip
                    arrow
                    enterDelay={500}
                    enterNextDelay={500}
                    title={fields.length > 0 ? 'Single Item View' : ''}
                    placement="bottom"
                  >
                    <span>
                      <IconButton
                        id="single-item-view-button"
                        aria-label="single-item-view"
                        color="inherit"
                        disabled={!isListView}
                        size="small"
                        sx={{ height: '32px' }}
                        onClick={() => {
                          setIsListView(false);
                        }}
                      >
                        <FeaturedPlayListIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )}
              {!readOnly && allowReOrder && (
                <Tooltip
                  arrow
                  enterDelay={0}
                  enterNextDelay={0}
                  title={'Reorder'}
                  placement="bottom"
                >
                  <span>
                    <ButtonModalMinorUi
                      id="reorder-button"
                      aria-label="Reorder"
                      disabled={isDeleteAllDisabled}
                      size="large"
                      sx={{
                        minWidth: '32px',
                        padding: '0px',
                        marginLeft: '4px',
                      }}
                      startIcon={
                        <LowPriorityIcon
                          fontSize="large"
                          sx={{
                            padding: '0px',
                            margin: '0px',
                          }}
                        />
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                        // force to list view mode
                        if (!isReOrderingEnabled) {
                          setIsListView(true);
                        }
                        setIsReOrderingEnabled(!isReOrderingEnabled);
                      }}
                    />
                  </span>
                </Tooltip>
              )}
              {isVisibleDeleteAll && !readOnly && (
                <Tooltip
                  arrow
                  enterDelay={0}
                  enterNextDelay={0}
                  title={fields.length > 0 ? 'Delete All' : ''}
                  placement="bottom"
                >
                  <span>
                    <ButtonModalMinorUi
                      id="delete-all-button"
                      aria-label="Delete All"
                      disabled={isDeleteAllDisabled}
                      size="small"
                      sx={{
                        minWidth: '32px',
                        padding: '0px',
                        marginLeft: '4px',
                      }}
                      startIcon={<DeleteSweepIcon fontSize="large" />}
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsPromptDelete(true);
                      }}
                    />
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
          {arrayErrors?.message &&
            (listCount === 0 || !hideArrayErrorIfElements) && (
              <Typography
                variant="body2"
                sx={{ color: (theme: any) => `${theme.palette.error.main}` }}
              >
                {arrayErrors.message}
              </Typography>
            )}
        </div>
      </Box>
      {isExpanded && (
        <>
          {listCount === 0 && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                backgroundColor: 'transparent',
                borderWidth: '0px',
                margin: '0px',
                padding: '0px',
                paddingLeft: '12px',
                maxWidth: '480px',
              }}
            >
              {noneFoundMessage}
            </Alert>
          )}
          {/* array list */}
          {fields.length > 0 &&
            fields.map((item: any, index: number) => {
              // using the index # as "key" causes misbehavior on delete of an array item
              // see https://stackoverflow.com/questions/64244731/react-renders-the-wrong-data-when-deleting-the-item-in-the-middle-of-the-list
              // so use the field (item) id
              //console.log('item', item);
              const localId = item.uuid || item.name || item.id || index;

              const fieldKey = `${localId}${arrayFieldName}`; // keys are short, so need to put the unique part first
              const indexedField = `${arrayFieldName}[${index}]`;
              const indexedErrors = arrayErrors ? arrayErrors[index] : null;

              // when in single item view -- only render if this is the current item number
              const shouldRender =
                isListView || (!isListView && currentItemNumber === index);

              const renderItemProps = {
                formMethods,
                fieldName: arrayFieldName,
                indexedArrayField: indexedField,
                indexedErrors,
                isModal,
                label: defaultLabel,
                placeholder,
                readOnly,
                rowIndex: index,
                isValid,
                isFocused: rowFocused === index,
              };
              return (
                <React.Fragment key={fieldKey}>
                  {isListView && isReOrderingEnabled ? (
                    <>
                      <Box
                        id={fieldKey}
                        // key={fieldKey}
                        data-testid={`${arrayFieldName}_${index}`}
                        sx={{
                          alignItems: 'center',
                          display: 'flex',
                          flexDirection: 'row',
                          padding: '8px 0px 4px',
                          backgroundColor: (theme) =>
                            `${
                              dragIndex === index
                                ? theme.palette.background.paper
                                : 'none'
                            }`,
                        }}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, localId, index)
                        }
                        onDragOver={(event) =>
                          handleDragOver(event, localId, index)
                        }
                        onDragLeave={(event) =>
                          handleDragLeave(event, localId, index)
                        }
                        onDrop={(event) => handleDrop(event, localId, index)}
                      >
                        <DragIndicatorIcon color="primary" />
                        <ItemDisplay
                          delimStyle={delimStyle}
                          renderItem={renderItem}
                          renderItemProps={renderItemProps}
                        />
                        <ItemDeleteButton
                          buttonIconSxProps={buttonIconSxProps}
                          deleteTooltip={deleteTooltip}
                          readOnly={readOnly}
                          index={index}
                          isRemoveDisabled={isRemoveDisabled}
                          itemDeletePosition={itemDeletePosition}
                          onWarnDeleteEntry={onWarnDeleteEntry}
                          onDeleteEntry={onDeleteEntry}
                          remove={remove}
                        />
                      </Box>
                      {/* dont show divider after last one */}
                      {delimStyle === DelimStyle.Divider &&
                        index < fields.length - 1 && (
                          <Divider
                            orientation="horizontal"
                            variant="fullWidth"
                          />
                        )}
                    </>
                  ) : (
                    <>
                      {shouldRender && (
                        <>
                          <Box
                            id={fieldKey}
                            key={fieldKey}
                            data-testid={`${arrayFieldName}_${index}`}
                            sx={{
                              alignItems: 'center',
                              display: 'flex',
                              flexDirection: 'row',
                              padding: '8px 0px 4px',
                              backgroundColor: (theme) => 'none',
                            }}
                          >
                            {/* List view shows item number */}
                            {isListView && (
                              <Box
                                sx={{
                                  minWidth: 'auto',
                                  height: 'auto',
                                  borderStyle: 'solid',
                                  borderColor: (theme: any) =>
                                    `${theme.input.outlineColor}`,
                                  borderWidth: '1px',
                                  borderRadius: '6px',
                                  alignSelf: itemNumberPosition,
                                  marginRight: 1,
                                  // REF marginLeft: '2px !important',
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  color="primary"
                                  sx={{
                                    padding: '2px',
                                  }}
                                >
                                  {index + 1}
                                </Typography>
                              </Box>
                            )}
                            {/* single item view shows previous */}
                            {!isListView && (
                              <ButtonIcon
                                name={`${arrayFieldName}_previous_item`}
                                tooltip="Previous"
                                props={{
                                  disabled: currentItemNumber === 0,
                                  onClick: (event) => {
                                    event.stopPropagation();
                                    setCurrentItemNumber(currentItemNumber - 1);
                                  },
                                }}
                              >
                                <ArrowBackIosIcon fontSize="medium" />
                              </ButtonIcon>
                            )}
                            <ItemDisplay
                              delimStyle={delimStyle}
                              renderItem={renderItem}
                              renderItemProps={renderItemProps}
                            />
                            {/* single item view shows next */}
                            {!isListView && (
                              <ButtonIcon
                                name={`${arrayFieldName}_next_item`}
                                tooltip="Next"
                                props={{
                                  disabled:
                                    currentItemNumber >= fields.length - 1,
                                  onClick: (event) => {
                                    setCurrentItemNumber(currentItemNumber + 1);
                                  },
                                }}
                              >
                                <ArrowForwardIosIcon fontSize="medium" />
                              </ButtonIcon>
                            )}
                            <ItemDeleteButton
                              buttonIconSxProps={buttonIconSxProps}
                              deleteTooltip={deleteTooltip}
                              readOnly={readOnly}
                              index={index}
                              isRemoveDisabled={isRemoveDisabled}
                              itemDeletePosition={itemDeletePosition}
                              onWarnDeleteEntry={onWarnDeleteEntry}
                              onDeleteEntry={onDeleteEntry}
                              remove={remove}
                            />
                          </Box>
                          {/* dont show divider after last one or when in single item view*/}
                          {isListView &&
                            delimStyle === DelimStyle.Divider &&
                            index < fields.length - 1 && (
                              <Divider
                                orientation="horizontal"
                                variant="fullWidth"
                              />
                            )}
                        </>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}
        </>
      )}

      <>
        {isPromptDelete && (
          <ModalDialog
            testId="prompt-delete"
            buttons={['Cancel', 'Delete']}
            dialogProps={{
              open: isPromptDelete,
            }}
            message="Delete all of the entries?"
            title="Delete All"
            handleAction={(buttonIndex: number) => {
              setIsPromptDelete(false);
              if (buttonIndex === 1) {
                replace([]);
              }
            }}
            maxWidth="xs"
          />
        )}
      </>
    </section>
  );
}

/**
 * @typedef tItemDisplayProps
 * @property {DelimStyle} [delimStyle=DelimStyle.Divider] Style to use to deliminate between items
 * @property {(props: tFormFieldRendererProps) => JSX.Element} renderItem component containing the field(s) for the given array row
 * @property {tFormFieldRendererProps} renderItemProps
 */
type tItemDisplayProps = {
  delimStyle: DelimStyle;
  renderItem: (props: tFormFieldRendererProps) => JSX.Element;
  renderItemProps: tFormFieldRendererProps;
};

/**
 * Returns the render item based on delimeter style
 */
function ItemDisplay(props: tItemDisplayProps) {
  const { delimStyle, renderItem, renderItemProps } = props;
  if (delimStyle === DelimStyle.Box) {
    return <Box sx={itemBoxStyle}>{renderItem({ ...renderItemProps })}</Box>;
  }
  return <>{renderItem({ ...renderItemProps })}</>;
}

/**
 * @typeDef {object} tDeleteButtonProps
 * @property {*} buttonIconSxProps style props to apply to icon button
 * @property {string} deleteTooltip Tooltip to display for delete
 * @property {boolean} readOnly Indication that array field is (not) editable
 * @property {number} index Item index in array
 * @property {boolean} isRemoveDisabled Indication that delete should be disabled
 * @property {ItemDeletePosition} itemDeletePosition ALignment position for the delete button
 * @property {(index: number) => void}   [onDeleteEntry] Additional Method called when item deleted
 * @property {(index: number) => void}   [onWarnDeleteEntry] Method called before item deleted
 * @property {*} remove Method from useFieldArray hook
 */
type tDeleteButtonProps = {
  buttonIconSxProps: any;
  deleteTooltip: string;
  readOnly: boolean;
  index: number;
  isRemoveDisabled: boolean;
  itemDeletePosition: ItemDeletePosition;
  onWarnDeleteEntry?: (index: number) => void;
  onDeleteEntry?: (index: number) => void;
  remove: any;
};

function ItemDeleteButton(props: tDeleteButtonProps) {
  const {
    buttonIconSxProps,
    deleteTooltip,
    readOnly,
    index,
    isRemoveDisabled,
    itemDeletePosition,
    onWarnDeleteEntry,
    onDeleteEntry,
    remove,
  } = props;
  if (!readOnly) {
    return (
      <div style={{ alignSelf: itemDeletePosition }}>
        <ButtonIcon
          id="delete-button"
          tooltip={deleteTooltip}
          props={{
            'aria-label': 'Delete Item From Array',
            name: 'delete button ' + index,
            disabled: isRemoveDisabled,
            onClick: (event) => {
              event.stopPropagation();
              if (onWarnDeleteEntry) {
                onWarnDeleteEntry(index);
              }
              if (onDeleteEntry) {
                onDeleteEntry(index);
              }
              remove(index);
            },
          }}
          sxProps={buttonIconSxProps}
        >
          <DeleteIcon fontSize="medium" />
        </ButtonIcon>
      </div>
    );
  }
  return null;
}

//Default renderer renders an Array of Strings
function DefaultRenderItem(props: tFormFieldRendererProps) {
  const {
    formMethods,
    indexedArrayField,
    indexedErrors,
    isFocused,
    label = '',
    placeholder,
    readOnly,
    onChange,
  } = props;

  const { control, setValue } = formMethods;
  const handleChangeValue = (value: string) => {
    setValue(indexedArrayField, value);
    if (onChange) {
      onChange(value);
    }
  };

  const focusHelper = useDisplayFocus();
  // this effect is for focusing on row when added to an array
  useEffect(() => {
    if (isFocused) {
      focusHelper.focusOnElementById(indexedArrayField);
    }
  }, [isFocused]);

  return (
    <FormControlTextField
      control={control}
      label={label}
      error={Boolean(indexedErrors)}
      helperText={indexedErrors?.message}
      name={indexedArrayField}
      placeholder={placeholder}
      required
      readOnly={readOnly}
      onChange={onChange ? handleChangeValue : undefined}
    />
  );
}

export default FormFieldArray;
