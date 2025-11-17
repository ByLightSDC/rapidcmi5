import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { UseFormReturn, useForm, useWatch } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  message,
  modal,
  setMessage,
  tSelectionMeta,
  useGetCacheSelection,
  useGetCacheMultipleSelection,
} from '@rangeos-nx/ui/redux';

import { useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { setLoader } from '@rangeos-nx/ui/redux';
import { ErrorMessageDetail, sanitizePayload } from '@rangeos-nx/ui/validation';

/* MUI */
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

/* Icons */
import Check from '@mui/icons-material/Check';
import RocketLaunch from '@mui/icons-material/RocketLaunch';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

/* Branded */
import AuthoringInfoFields, {
  tAuthoringInfoFieldProps,
} from './AuthoringInfoFields';
import { BookmarksContext } from '../navigation/bookmark/BookmarksContext';
import { ButtonLoadingUi } from '../inputs/buttons/buttons';
import {
  ButtonModalCancelUi,
  ButtonModalMainUi,
  ButtonModalMinorUi,
} from '../inputs/buttons/buttonsmodal';
import DataFetcher from './DataFetcher';
import FileUpload from '../inputs/file-upload/FileUpload';
import Form from './Form';
import { FormControlUIContext } from './FormControlUIContext';
import { StepperContext } from '../navigation/stepper/StepperContext';
import StepperUi from '../navigation/stepper/Stepper';
import { useNavigateAlias } from '../hooks/useNavigateAlias';

/* Constants */
import { FormCrudType } from './constants';
import { FormStateType } from '../types/form';
import { iListItemType } from '../dashboards/constants';
import axios, { CancelTokenSource } from 'axios';
import { debugLog } from '../utility/logger';

const defaultFormWidth = 800;

//Move when Multibutton moves to branded
export type tMultiSelectionMeta = {
  fieldName: string;
  selectionTargetId: string;
  shouldSkipQuery?: boolean;
  propertyKey?: string;
  isKeyValue?: boolean;
};

/**
 * Form component
 * Displays form fields and handles user interaction
 * @template tFormType List item type returned from API requests
 * @template tFormCreateType Payload type for post API request
 * @template tFormUpdateType Payload type for put API request
 *
 * @param {Partial<tAuthoringInfoFieldProps>} [authoringProps] Props for Authoring Field Component
 * @param {*} [dataCache] Form data from cache
 * @param {*} [defaultCache] Override for default payload for post (rarely used)
 * @param {FormCrudType} crudType APi request method type
 * @param {number} [formWidth] Width for form
 * @param {string} [fileButtonTitle] Title for button on File Upload if form hasFile
 * @param {string} [fileTypes] Comma separated list of file types to allow on File Upload if form hasFIle
 * @param {boolean} [hasFile] Whether form should include FileUpload functionality
 * @param {boolean} [hasAuthoringInfo] Whether form should display authoringInfo
 * @param {string} [instructions] Any instructions to include at top of form
 * @param {boolean} [isModal] Whether form is presented in a modal
 * @param {string} [noFileSelectedMessage] Message to display in File Upload if no file has been selected
 * @param {string} [featureNameOverride] Name of feature used to title Form. If none specified, topic will be used
 * @param {string} [submitButtonText] Submit Button Text
 * @param {string} [crudLabel] Label to use instead of crud type along with topiv for form title (e.g. Upload -> Upload Container)
 * @param {string} [uuid] UUID of data to populate the form
 * @param {() => void} [onCancel] Method to cancel the form
 * @param {() => void} [onClose] Method to close the form
 * @param {() => void} [onLoaded] Method when form is about to appear after all data is loaded
 * @param {(isSuccess: boolean, data: tFormType) => void} [onResponse] Callback when success response is received after form submission
 * @param {*} [getHook] API hook for retrieving item
 * @param {*} [getHookParams] Special payload params needed for getHook api request
 * @param {*} [postHook] API hook for creating item
 * @param {*} [postHookParams] Special payload params needed for postHook api request
 * @param {*} [putHook] API hook for updating item
 * @param {*} [putHookParams] Special payload params needed for putHook api request
 * @param {*} [validationSchema] Form yup validation schema
 * @param {*} [defaultPostData] Default post data fields
 * @param {*} [defaultPutData] Default put data fields
 * @param {boolean} [forceSubmitDisabled=false] Force the submit button to be disabled (ex. need to force going to another step)
 * @param {boolean} [loadingShouldEnableCancel=false] Prevent cancel button from being disabled during loading
 * @param {boolean} [shouldSuppressSubmit] Whether to subpress actual submit of data and print to console instead
 * @param {boolean} [hasStepper=false] Whether form should look at stepper context (ex. so nested form won't inherit from another's settings)
 * @param {(data: any) => any} [getCleanInitialData Method to sanitize initial form data
 * @param {(data: any) => any} [getCleanSubmissionData] Method to sanitize form data for submit
 * @param {(submitError: any) => JSX.Element } [getSubmitDisplayError] Method to provide override of submit error to display
 * @param {*} [getFormFields] Method to retrieve fields unique to the form
 * @returns {React.ReactElement}
 */
export function SharedFormWithProvider<
  tFormType,
  tFormCreateType extends iListItemType,
  tFormUpdateType,
>({
  authoringProps = { includeVersioning: false },
  dataCache,
  defaultCache,
  crudType = FormCrudType.edit,
  designer,
  featureNameOverride,
  formWidth = defaultFormWidth,
  formTopic,
  fileButtonTitle = 'Select File ...',
  fileTypes = '.tar.gz,.gz',
  hasFile = false,
  hasAuthoringInfo = true,
  instructions,
  isModal = false,
  isRoutable = true,
  loadingShouldEnableCancel = false,
  noFileSelectedMessage = 'No file selected',
  submitButtonText = 'Save',
  crudLabel,
  uuid = '',
  onCancel,
  onLocalResponse,
  onResponse,
  onClose,
  onLoaded,
  getHook,
  getHookParams,
  postHook,
  postHookParams,
  putHook,
  putHookParams,
  validationSchema,
  defaultPostData,
  defaultPutData,
  forceSubmitDisabled = false,
  shouldForceStep = false,
  stepToForce,
  shouldSuppressSubmit = false,
  shouldShowStepper = true, //show if applicable
  hasStepper = false,
  getCleanSubmissionData,
  getCleanInitialData,
  getFormFields,
  getSubmitDisplayError,
  getDesignFields,
}: {
  authoringProps?: Partial<tAuthoringInfoFieldProps>;
  crudType: FormCrudType;
  dataCache?: tFormType;
  defaultCache?: tFormCreateType;
  designer?: any; // TODO change to IDesignerContext;
  featureNameOverride?: string;
  formWidth?: number | string;
  fileButtonTitle?: string;
  fileTypes?: string;
  formTopic: string;
  hasFile?: boolean;
  hasAuthoringInfo?: boolean;
  instructions?: string;
  isModal?: boolean;
  isRoutable?: boolean;
  loadingShouldEnableCancel?: boolean;
  noFileSelectedMessage?: string;
  submitButtonText?: string;
  crudLabel?: string;
  uuid?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onLocalResponse?: (
    isSuccess: boolean,
    data: tFormType,
    message: string,
  ) => void;
  onResponse?: (
    isSuccess: boolean,
    data: tFormType,
    message: string,
    payload?: any,
  ) => void;
  onLoaded?: () => void;
  getHook?: any;
  getHookParams?: any;
  postHook?: any;
  postHookParams?: any;
  putHook?: any;
  putHookParams?: any;
  validationSchema?: any;
  defaultPostData?: any;
  defaultPutData?: any;
  forceSubmitDisabled?: boolean;
  shouldForceStep?: boolean;
  stepToForce?: number;
  shouldShowStepper?: boolean;
  shouldSuppressSubmit?: boolean;
  hasStepper?: boolean;
  getCleanInitialData?: (data: any) => any;
  getCleanSubmissionData?: (data: any) => any;
  getFormFields: (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ) => JSX.Element;
  getSubmitDisplayError?: (submitError: any) => JSX.Element;
  getDesignFields?: (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ) => JSX.Element | null;
}) {
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigateAlias = useNavigateAlias();
  const modalObj = useSelector(modal);
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isFileSelected, setIsFileSelected] = useState(
    crudType !== FormCrudType.create,
  );
  const [fileFormData, setFileFormData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);
  const [submitError, setSubmitError] = useState<string | JSX.Element>('');
  const abortController = useRef<any>(new AbortController());

  /**
   * Form Constants & Validation
   * @constant
   * @type {any}
   */
  const methods: UseFormReturn = useForm({
    // useMemo here so that when actual values are read in we "reset" the form data
    defaultValues: useMemo(() => {
      return initialData;
    }, [initialData]),
    mode: 'all',
    //REF  resolver: yupResolver(
    //   designer?.isEnabled ? yup.object().shape({}) : validationSchema
    // ),
    resolver: yupResolver(validationSchema),
  });
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    trigger,
    formState,
  } = methods;
  const { errors, isValid } = formState;
  const bookmarkFormData = useWatch({ control });

  const {
    addBookmark,
    addMetaDataToBookmark,
    getFormDataByKey,
    getMetaDataFromBookmark,
    getLastBookmark,
    clearAllBookmarks,
    clearForm,
    saveForm,
  } = useContext(BookmarksContext);

  //content form has non serializable data
  const isBookmarkable =
    formTopic !== 'RangeVolumesContent' && formTopic !== 'Class Entry'
      ? true
      : false;
  const testId = `${formTopic}-form`;
  const featureName = featureNameOverride || formTopic;

  //#region getters & setters

  const getErrorMessages = (theErrors: any) => {
    if (!theErrors) {
      return undefined;
    }
    let result: string[] = [];
    let field: string = '';

    function traverse(obj: any) {
      for (let key in obj) {
        if (key === 'message') {
          //result.push({ key, value: obj[key] });
          result.push(`${field} ${obj[key]}`);
          field = '';
        } else if (typeof obj[key] === 'object') {
          field = field + ' ' + key;
          traverse(obj[key]); // Recursively traverse nested objects
        }
      }
    }

    traverse(theErrors);
    return result;
  };
  /**
   * Returns form title
   * @return {string} Title
   */
  const getFormTitle = () => {
    if (crudLabel) {
      return `${crudLabel} ${featureName}`;
    }
    switch (crudType) {
      case FormCrudType.create:
        return `Create ${featureName}`;
      case FormCrudType.edit:
        return `Edit ${featureName}`;
      case FormCrudType.design:
        return `${featureName}`;
    }
    return featureName;
  };

  /**
   * Returns title icon
   * @return {JSX.Element|undefined} Title Icon
   */
  const getTitleIcon = () => {
    if (crudType === FormCrudType.design) {
      // return <ShapeLineIcon sx={{marginRight:'6px'}} />;
      //return <DrawIcon sx={{ marginRight: '6px' }} />;
      return <DesignServicesIcon sx={{ marginRight: '6px' }} />;
    }
    return undefined;
  };

  /**
   * Sets default state & form fields for file & size
   * @param {iListItemType} data Row data
   */
  const setFileDefaults = (data: iListItemType) => {
    if (hasFile && data.file) {
      setFileFormData(data['file']);
      setValue('size', data.file.size);
    }
  };
  //#endregion

  //#region handlers
  /**
   * Sets default state for row data
   * Persists data uuid and name
   * @param {iListItemType} data Row data
   */
  const handleInitialDataLoad = (data: iListItemType) => {
    if (isRoutable) {
      navigateAlias('', data.uuid, data.name, undefined, undefined, false);
    }

    if (getCleanInitialData) {
      const initData = getCleanInitialData(data);
      setInitialData(initData);
    } else {
      setInitialData(data);
    }

    setFileDefaults(data);
    setIsLoaded(true);
    if (onLoaded) {
      onLoaded();
    }
  };

  /**
   * Updates state for file upload progress
   * @param {ProgressEvent} progressEvent Progress data
   */
  const updateProgress = (progressEvent: ProgressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total,
    );
    setPercentComplete(progress);
  };

  /**
   * cancelDesign
   */
  const cancelDesign = () => {
    debugLog('[SharedFormWithProvider] cancel design');
    if (designer) {
      designer.sendMessage({
        type: 'cancelForm',
        topicId: formTopic,
      });
    }
  };

  /**
   * submitDesign
   * @param {*} formData
   * @param {boolean} isValid
   */
  const submitDesign = (formData: any, isValid: boolean) => {
    debugLog('[SharedFormWithProvider] submit design');
    const errorMessages = getErrorMessages(errors);
    //inject form errors
    if (designer) {
      designer.sendMessage({
        type: 'saveForm', //MessageType.saveForm
        meta: {
          ...formData,
          designer: {
            ...formData['designer'],
            validationErrors: errorMessages,
          },
        },
        topicId: formTopic,
      });
    }
    if (onClose) {
      onClose();
    }
  };

  /**
   * In designer, user can save bad values
   * data is errors obj, not full form data
   * @param data
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmitInvalid = async (data: any) => {
    if (designer?.isEnabled) {
      debugLog('[SharedFormWithProvider] onSubmitInvalid');
      setSubmitError('');
      if (clearForm) {
        clearForm(testId);
      }
      let cleanData = getValues();
      if (getCleanSubmissionData) {
        cleanData = getCleanSubmissionData(cleanData);
      }
      submitDesign(cleanData, false);
    }
  };

  /**
   * Clears form data persisted to bookmarks
   * Cleans data & submits form
   * Waits for API Response
   * Triggers success or fail display
   * @param {any} data Form data
   */
  const onSubmit = async (data: any) => {
    if (clearForm) {
      clearForm(testId);
    }
    //resets
    setSubmitError('');
    if (crudType === FormCrudType.view) {
      if (onClose) {
        onClose();
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let apiData: any = null;
      let submitData: any = null;
      try {
        if (getCleanSubmissionData) {
          data = getCleanSubmissionData(data);
        }

        //#region design
        //design must be added to parent form in order to be present
        if (crudType === FormCrudType.design) {
          if (designer?.isEnabled) {
            submitDesign(data, true);
          }
          return;
        }
        //#endregion design

        if (shouldSuppressSubmit) {
          debugLog('shouldSuppressSubmit', data);
          return;
        }

        let message = null;
        if (crudType === FormCrudType.create) {
          message = `${featureName} created successfully!`;
          if (hasFile) {
            setPercentComplete(0);
            setIsUploading(true);
            submitData = {
              ...data,
              file: fileFormData,
            };
            apiData = await postQuery.mutateAsync({
              ...submitData,
              onUploadProgress: updateProgress,
              signal: abortController.current.signal,
            });
          } else {
            submitData = {
              ...data,
            };
            // this is for special cases like RangeResourceHardware which need to pass extra payload params
            if (postHookParams) {
              apiData = await postQuery.mutateAsync({
                ...postHookParams,
                formData: submitData,
              });
            } else {
              apiData = await postQuery.mutateAsync({
                ...submitData,
              });
            }
          }
        } else {
          message = `${featureName} updated successfully!`;
          submitData = sanitizePayload(data, defaultPutData);
          apiData = await putQuery.mutateAsync({
            ...putHookParams,
            uuid: uuid,
            formData: submitData,
          });
        }

        if (onLocalResponse) {
          onLocalResponse(true, apiData, message);
        }
        if (onResponse) {
          onResponse(true, apiData, message, submitData);
        }
      } catch (error: any) {
        if (abortController.current?.signal?.aborted) {
          return;
        }
        if (getSubmitDisplayError) {
          setSubmitError(getSubmitDisplayError(error));
        } else {
          setSubmitError(ErrorMessageDetail(error, null, true));
        }
        if (onResponse) {
          onResponse(false, apiData, '', submitData);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };
  //#endregion

  //#region query hooks

  /**
   * Post Hook
   * @constant
   * @type {any}
   */
  const postQuery = postHook ? postHook(postHookParams) : null;
  if (postQuery) {
    // postHook may be undefined so only want to use the hook if it IS defined
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQueryDetails({
      queryObj: postQuery,
      loaderFunction: (isLoading) => {
        dispatch(setLoader(isLoading));
      },
      errorFunction: (errorState) => {
        // no toaster - alert handled separately
      },
      shouldDisplayToaster: false,
    });
  }

  /**
   * Put Hook
   * @constant
   * @type {any}
   */
  const putQuery = putHook ? putHook(putHookParams) : null;
  if (putQuery) {
    // putHook may be undefined so only want to use the hook if it IS defined
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQueryDetails({
      queryObj: putQuery,
      loaderFunction: (isLoading) => {
        dispatch(setLoader(isLoading));
      },
      errorFunction: (errorState) => {
        // no toaster - alert handled separately
      },
      shouldDisplayToaster: false,
    });
  }
  //#endregion

  const location = useLocation();

  const { setFormMethods } = useContext(FormControlUIContext);
  /** @constant
   * Stepper methods and data
   */
  const {
    isStepperEnabled,
    activeStep,
    orientation,
    steps,
    stepsCompleted,
    stepsDisabled,
    stepLabels,
    stepTitles,
    stepErrors,
    stepWidth,
    setCurrentStep,
  } = useContext(StepperContext);

  /**
   * Use Effect stores the form methods in context when form mounts
   */
  useEffect(() => {
    if (methods) {
      setFormMethods(methods);
    }
  }, [methods]);

  /**
   * useEffect bookmarks this route
   * when the form mounts
   */
  useEffect(() => {
    //REF if (!bookmarkEnabled) {
    //   return;
    // }
    if (!isBookmarkable) {
      return;
    }

    if (!isModal) {
      addBookmark({
        key: location.pathname,
        route: location.pathname,
        label: formTitle,
        meta: null,
        isModal: false,
      });
    } else {
      addBookmark({
        key: `${formTitle}${crudType}${uuid}`,
        route: location.pathname,
        label: formTitle,
        meta: dataCache,
        altModal: modalObj, //data required to pop the modal from ViewModal
        isModal: true,
      });
    }

    return () => {
      //MAYBE this would handle navigate away abortController.current.abort();
    };
  }, []);

  /**
   * Use Effect
   * Sets form data & loading state when crud type is established
   * form data comes from bookmarks, API response, or cached data injected via props
   */
  useEffect(() => {
    //if (!isModal) {
    //if location/key is default,
    //user either manually routed to this page OR refresh on current page

    //try to determine new location
    //if it matches last bookmark (top of stack), then rehydrate
    //if it doesnt match, assume manual routing away and clear bookmarks stack
    let shouldRehydrateFormData = true;
    if (location.key === 'default') {
      if (getLastBookmark) {
        const top = getLastBookmark();
        if (top && location.pathname !== top.route) {
          shouldRehydrateFormData = false;
          clearAllBookmarks();
        }
      }
    }

    if (isBookmarkable && shouldRehydrateFormData) {
      const bookmarkCache = getFormDataByKey ? getFormDataByKey(testId) : null;

      //restore form data for eith create form OR edit form
      //create form has no id
      if (bookmarkCache && (!uuid || bookmarkCache.uuid === uuid)) {
        setInitialData(bookmarkCache);
        setFileDefaults(bookmarkCache);
        return;
      }
    }
    //}

    if (crudType === FormCrudType.create) {
      if (defaultCache) {
        handleInitialDataLoad(defaultCache);
      } else {
        handleInitialDataLoad(defaultPostData);
      }
    } else {
      if (dataCache) {
        handleInitialDataLoad(dataCache);
      } else {
        //wait for me to load
        if (!uuid) {
          // cant load data with no uuid so close
          //solves an edge case where UUID can not be retrieved, but timing issue prevents this class from triggering onClose
          if (onClose) {
            onClose();
          }
        }
      }
    }
  }, [crudType]);

  /**
   * Use Effect
   * Saves form data to context
   */
  useEffect(() => {
    if (isBookmarkable) {
      if (Object.keys(bookmarkFormData).length > 0) {
        if (saveForm && bookmarkFormData) {
          saveForm(testId, bookmarkFormData);
        }
      }
    }
  }, [bookmarkFormData]);

  /**
   * Use Effect
   * Resets form when data loads and triggers validation
   */
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setIsLoaded(true);

      //initialize step
      if (isStepperEnabled && hasStepper) {
        if (shouldForceStep && stepToForce) {
          setCurrentStep(stepToForce);
        } else {
          if (!isBookmarkable) {
            setCurrentStep(0);
          } else {
            const bookmarkStep = getMetaDataFromBookmark('step');
            if (bookmarkStep) {
              setCurrentStep(bookmarkStep);
            } else {
              setCurrentStep(0);
            }
          }
        }
      }

      // do an initial validation for edit mode only
      if (crudType === FormCrudType.edit || crudType === FormCrudType.design) {
        trigger();
      }
    }
  }, [crudType, initialData, reset, trigger]);

  /**
   * Whether data is loading
   * @constant
   * @type {boolean}
   */
  const isLoading = postQuery?.isLoading || putQuery?.isLoading;

  /**
   * Children (form fields)
   * @constant
   * @type {JSX.Element}
   */
  const children =
    crudType === FormCrudType.design && getDesignFields
      ? getDesignFields(methods, {
          errors: formState.errors,
          isValid: formState.isValid,
        })
      : getFormFields(methods, {
          errors: formState.errors,
          isValid: formState.isValid,
        });

  /**
   * Title
   * @constant
   * @type {string}
   */
  const formTitle = getFormTitle();

  /**
   * Title Icon
   * @constant
   * @type {JSX.Element | undefined}
   */
  const titleStartIcon = getTitleIcon();

  //#region steps
  /**
   * Use Effect for when creating an item to capture "errors" when step changes fron initial load and field(s) are not touched/filled in
   */
  useEffect(() => {
    if (isStepperEnabled && hasStepper && crudType === FormCrudType.create) {
      trigger();
    }
  }, [activeStep]);

  const getStepTitle = () => {
    if (isStepperEnabled && hasStepper) {
      const suffix = ' ' + (activeStep + 1) + '/' + steps?.length;
      if (stepTitles && stepTitles.length > activeStep) {
        return stepTitles[activeStep] + suffix;
      }
      if (steps && steps.length > activeStep) {
        return steps[activeStep] + suffix;
      }
    }
    return '';
  };

  const handleStepChange = (newStep: number) => {
    addMetaDataToBookmark({ metaProperty: 'step', metaValue: newStep });
    setCurrentStep(newStep);
  };
  const StepNavigationButtons = () => {
    return (
      <div>
        <ButtonModalCancelUi
          id="prev-step"
          disabled={activeStep <= 0}
          onClick={() => {
            handleStepChange(activeStep - 1);
          }}
        >
          Prev
        </ButtonModalCancelUi>
        <ButtonModalCancelUi
          id="next-step"
          disabled={steps ? activeStep >= steps.length - 1 : true}
          onClick={() => {
            handleStepChange(activeStep + 1);
          }}
        >
          Next
        </ButtonModalCancelUi>
      </div>
    );
  };
  //#endregion

  return (
    <>
      {/* box so we can have vertical or horizontal stepper */}
      <Box
        sx={{
          display: 'flex',
          maxHeight: '100%', // so form will be correct height for scrolling when necessary
          overflow: 'hidden', // so only form will have scrollbar
        }}
      >
        {isStepperEnabled && hasStepper && shouldShowStepper && (
          <StepperUi
            activeStep={activeStep}
            orientation={orientation}
            steps={steps || []}
            completed={stepsCompleted || []}
            disabled={stepsDisabled || []}
            labels={stepLabels}
            hasErrors={stepErrors || []}
            width={stepWidth}
            onStepChange={handleStepChange}
          />
        )}
        {uuid && !dataCache && (
          <DataFetcher
            apiHook={getHook}
            payload={getHookParams ? getHookParams : { id: uuid }}
            onDataLoad={handleInitialDataLoad}
            onError={() => {
              if (onClose) {
                onClose();
              }
            }}
          />
        )}
        {isLoaded ? (
          <Form
            instructions={instructions}
            title={formTitle}
            subTitle={getStepTitle()}
            testId={testId}
            titleStartIcon={titleStartIcon}
            formWidth={formWidth} //!isModal ? formWidth : 880}
            sxProps={{
              margin: isModal
                ? hasStepper && shouldShowStepper
                  ? '12px'
                  : '0px'
                : '12px',
            }}
            showBorder={!isModal}
            // 8px below fixes top row getting clipped in Blueprint and VM Image forms
            formFields={
              <Grid container spacing={2} sx={{ paddingTop: '8px' }}>
                {hasFile && crudType === FormCrudType.create ? (
                  <Grid item xs={12}>
                    <FileUpload
                      buttonTitle={fileButtonTitle}
                      dataCache={fileFormData}
                      fileTypes={fileTypes}
                      isUploading={isUploading}
                      noFileSelectedMessage={noFileSelectedMessage}
                      percentLoaded={percentComplete}
                      onFileSelected={(file, selected) => {
                        setIsFileSelected(selected);
                        if (file && selected) {
                          setFileFormData(file);
                          setValue('name', file.name);
                          setValue('size', file.size);
                        } else {
                          setValue('size', 0);
                        }
                      }}
                    />
                  </Grid>
                ) : null}
                {children}
                {hasAuthoringInfo && (
                  <AuthoringInfoFields
                    crudType={crudType}
                    control={control}
                    errors={errors}
                    {...authoringProps}
                  />
                )}
              </Grid>
            }
            formButtons={
              //test for additional buttons requires empty react element to wrap
              //eslint-disable-next-line react/jsx-no-useless-fragment
              <>
                {isStepperEnabled && hasStepper ? (
                  <Box
                    id="form-buttons"
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    {crudType !== FormCrudType.view ? (
                      <>
                        <ButtonModalCancelUi
                          id="cancel-button"
                          disabled={
                            loadingShouldEnableCancel ? false : isLoading
                          }
                          onClick={() => {
                            abortController.current.abort();
                            if (crudType === FormCrudType.design) {
                              cancelDesign();
                            }
                            if (onCancel) {
                              if (clearForm) {
                                clearForm(testId);
                              }
                              onCancel();
                            }
                          }}
                        >
                          Cancel
                        </ButtonModalCancelUi>
                        <StepNavigationButtons />
                        <ButtonLoadingUi
                          id="submit-button"
                          startIcon={
                            submitButtonText === 'Deploy' ? (
                              <RocketLaunch />
                            ) : (
                              <Check />
                            )
                          }
                          disabled={
                            !designer?.isEnabled &&
                            (!isValid ||
                              (hasFile && !isFileSelected) ||
                              isLoading ||
                              forceSubmitDisabled)
                          }
                          loading={isLoading}
                        >
                          {submitButtonText}
                        </ButtonLoadingUi>
                      </>
                    ) : (
                      <>
                        <div style={{ minWidth: 120 }} />
                        <StepNavigationButtons />
                        <div style={{ minWidth: 120 }}>
                          <ButtonModalMainUi
                            id="close-button"
                            startIcon={null}
                            type="button"
                            onClick={() => {
                              if (onClose) {
                                onClose();
                              }
                            }}
                          >
                            Close
                          </ButtonModalMainUi>
                        </div>
                      </>
                    )}
                  </Box>
                ) : (
                  //test for crud type requires empty react element to wrap
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {crudType !== FormCrudType.view ? (
                      <>
                        <ButtonModalCancelUi
                          id="cancel-button"
                          disabled={
                            loadingShouldEnableCancel ? false : isLoading
                          }
                          onClick={() => {
                            abortController.current.abort();
                            if (crudType === FormCrudType.design) {
                              cancelDesign();
                            }
                            if (onCancel) {
                              if (clearForm) {
                                clearForm(testId);
                              }
                              onCancel();
                            }
                          }}
                        >
                          Cancel
                        </ButtonModalCancelUi>
                        <ButtonLoadingUi
                          id="submit-button"
                          startIcon={
                            submitButtonText === 'Deploy' ? (
                              <RocketLaunch />
                            ) : (
                              <Check />
                            )
                          }
                          disabled={
                            !designer?.isEnabled &&
                            (!isValid ||
                              (hasFile && !isFileSelected) ||
                              isLoading ||
                              forceSubmitDisabled)
                          }
                          loading={isLoading}
                        >
                          {submitButtonText}
                        </ButtonLoadingUi>
                      </>
                    ) : (
                      <>
                        <ButtonModalMainUi
                          id="close-button"
                          startIcon={null}
                          type="button"
                          onClick={() => {
                            if (onClose) {
                              onClose();
                            }
                          }}
                        >
                          Close
                        </ButtonModalMainUi>
                      </>
                    )}
                  </>
                )}
              </>
            }
            submitError={submitError}
            onSubmit={handleSubmit(onSubmit, onSubmitInvalid)}
            onCloseAlert={() => setSubmitError('')}
          />
        ) : null}
      </Box>
    </>
  );
}
export default SharedFormWithProvider;
