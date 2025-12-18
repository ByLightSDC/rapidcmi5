/* eslint-disable react/jsx-no-useless-fragment */
import { yupResolver } from '@hookform/resolvers/yup';
import Grid from '@mui/material/Grid2';
import { Alert, Box, Stack } from '@mui/material';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useForm, UseFormReturn, useWatch } from 'react-hook-form';

/* Icons */
import Check from '@mui/icons-material/Check';
import { AxiosError } from 'axios';
import { useToaster, ButtonLoadingUi } from '@rapid-cmi5/ui/api/hooks';
import { FormCrudType } from '@rapid-cmi5/ui/redux';
import { LoadingUi } from '../indicators/Loading';
import { ButtonModalCancelUi, ButtonModalMainUi } from '../inputs/buttons/buttonsmodal';
import { FormStateType } from '../types/form';
import { FormControlUIContext } from './FormControlUIContext';
import Form from './Form';

/**
* @typedef {Object} MiniFormProps
 * @property {number} [autoSaveDebounceTime = 3000] debounce auto save timer (milliseconds)
 * @property {FormCrudType} [crudType] Whther form is editable
 * @property {*} [dataCache] default data to populate form with
 * @property {(data: any) => void} [doAction] submit button action, typically save
 * @property {number | string} [formWidth] width 
 * @property {(formMethods: UseFormReturn, formState: FormStateType) => JSX.Element} getFormFields
 * @property {string} [formTitle] Title
 * @property {boolean} [shouldAutoSave] Whether form should auto save
 * @property {boolean} [shouldDisplaySave] Whether form should display cancel and save buttons
 * @property {boolean} [shouldCheckIsDirty] Whether form should disable save button if form fields arent dirty
 * @property {boolean} [showPaper] Whether form style should color paper, if false, form inherits parent background
 * @property {string} [submitButtonText] Submit button text
 * @property {string} [failToasterMessage] Toaster to display if submit action fails
 * @property {string} [successToasterMessage] Toaster to display if submit action is successful
 * @property {JSX.Element} [titleEndChildren] 
 * @property {any} [validationSchema] Form validation yup schema
 * @property {void} [onCancel] Method to call to cancel form
 * @property {void} [onClose] Method to call to close form
 * @property {(isSuccess: boolean, data: any, message: string) => void} [onResponse] 

 */
export type MiniFormProps = {
  autoSaveDebounceTime?: number;
  crudType?: FormCrudType;
  dataCache?: any;
  doAction?: (data: any) => void;
  formWidth?: number | string;
  instructions?: string;
  getFormFields: (
    formMethods: UseFormReturn,
    formState: FormStateType,
  ) => JSX.Element;
  formTitle?: string;
  loadingButtonText?: string;
  shouldAutoSave?: boolean;
  shouldDisplaySave?: boolean;
  shouldCheckIsDirty?: boolean;
  showInternalError?: boolean;
  shouldShowAutoSaveIndicator?: boolean;
  showPaper?: boolean;
  submitButtonText?: string;
  failToasterMessage?: string;
  successToasterMessage?: string;
  titleEndChildren?: JSX.Element;
  validationSchema?: any;
  onCancel?: () => void;
  onClose?: () => void;
  onResponse?: (isSuccess: boolean, data: any, message: string) => void;
};

export function MiniForm({
  autoSaveDebounceTime = 3000,
  crudType = FormCrudType.edit,
  dataCache,
  doAction,
  getFormFields,
  formTitle,
  formWidth,
  instructions,
  loadingButtonText = 'Loading',
  showInternalError = false,
  showPaper = false,
  shouldCheckIsDirty,
  submitButtonText = 'Save',
  failToasterMessage,
  shouldAutoSave = false,
  shouldDisplaySave = true,
  shouldShowAutoSaveIndicator = true,
  successToasterMessage,
  titleEndChildren,
  validationSchema,
  onCancel,
  onClose,
  onResponse,
}: MiniFormProps) {
  const [initialData, setInitialData] = useState<any>(null);
  const { setFormMethods } = useContext(FormControlUIContext);
  const [submitError, setSubmitError] = useState<string | JSX.Element>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const displayToaster = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncer = useRef<NodeJS.Timeout>();

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
  const { errors, isValid, isDirty, isSubmitSuccessful, dirtyFields } =
    formState;

  /**
   * Debug UE
   */
  // useEffect(() => {
  //    console.log('isValid', isValid);
  //    console.log('isSubmitSuccessful', isSubmitSuccessful);
  //    console.log('isDirty', isDirty);
  //    console.log('dirtyFields', dirtyFields);
  // }, [isValid, isDirty, isSubmitSuccessful, dirtyFields]);

  //#region handlers
  /**
   * Sets default state for row data
   * Persists data uuid and name
   * @param {iListItemType} data Row data
   */
  const handleInitialDataLoad = (data: any) => {
    setInitialData(data);
    setIsLoaded(true);
  };

  /**
   * Children (form fields)
   * @constant
   * @type {JSX.Element}
   */
  const children = getFormFields(methods, {
    errors: formState.errors,
    isValid: formState.isValid,
  });

  /**
   * Save form values
   */
  const autoSave = useCallback(() => {
    if (doAction) {
      doAction(getValues());
      setIsSubmitting(false);
    }
  }, [getValues, doAction]);

  /**
   * Clears form data persisted to bookmarks
   * Cleans data & submits form
   * Waits for API Response
   * Triggers success or fail display
   * @param {any} data Form data
   */
  const onSubmit = useCallback(
    async (data: any) => {
      //resets
      setSubmitError('');
      if (crudType === FormCrudType.view) {
        if (onClose) {
          onClose();
        }
      } else {
        setIsSubmitting(true);
        try {
          if (doAction) {
            await doAction(data);
          }

          if (onResponse) {
            if (successToasterMessage) {
              displayToaster({
                message: successToasterMessage,
                severity: 'success',
              });
            }
            onResponse(true, data, '');
          }
          setIsSubmitting(false);
        } catch (error: any) {
          if (onResponse) {
            if (error instanceof AxiosError) {
              if (error.response?.data?.message) {
                setSubmitError(error.response.data.message);
                if (failToasterMessage) {
                  displayToaster({
                    message: error.response.data.message,
                    severity: 'error',
                  });
                }
                return;
              }
            }

            if (error.message) {
              setSubmitError(error.message);
              if (failToasterMessage) {
                displayToaster({
                  message: error.message,
                  severity: 'error',
                });
              }
            } else {
              if (failToasterMessage) {
                setSubmitError(failToasterMessage);
                displayToaster({
                  message: failToasterMessage,
                  severity: 'error',
                });
              } else {
                setSubmitError(JSON.stringify(error));
              }
            }

            onResponse(false, data, '');
          }
          setIsSubmitting(false);
        }
      }
    },
    [
      crudType,
      displayToaster,
      doAction,
      failToasterMessage,
      onClose,
      onResponse,
      successToasterMessage,
    ],
  );

  const onSubmitInvalid = async (data: any) => {
    // placeholder
  };

  /**
   * Clean up timers
   */
  useEffect(() => {
    return () => {
      if (debouncer.current !== undefined) {
        clearTimeout(debouncer.current);
      }
    };
  }, []);

  /**
   * Use Effect stores the form methods in context when form mounts
   */
  useEffect(() => {
    if (methods) {
      setFormMethods(methods);
    }
  }, [methods]);

  /**
   * Use Effect
   * Resets form when data loads and triggers validation
   */
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setIsLoaded(true);
      // do an initial validation for edit mode only
      if (crudType === FormCrudType.edit || crudType === FormCrudType.design) {
        trigger();
      }
    }
  }, [crudType, initialData, reset, trigger]);

  /**
   * Use Effect
   * Sets form data & loading state when crud type is established
   * form data comes from bookmarks, API response, or cached data injected via props
   */
  useEffect(() => {
    if (dataCache) {
      handleInitialDataLoad(dataCache);
    }
  }, [dataCache]);

  /**
   * will trigger data to be reset to success values
   * this is needed to update dirty flags after submission
   * so submit disables
   */
  useEffect(() => {
    if (isSubmitSuccessful) {
      handleInitialDataLoad(getValues());
    }
  }, [isSubmitSuccessful]);

  // Watch all form values, but only trigger re-render in this component
  const allFormValues = useWatch({ control });
  /**
   * UE to handle auto save when ANY change is made in the form
   */
  useEffect(() => {
    if (shouldAutoSave) {
      if (isDirty) {
        if (autoSaveDebounceTime > 0) {
          setIsSubmitting(true);
          if (debouncer.current !== undefined) {
            clearTimeout(debouncer.current);
          }
          debouncer.current = setTimeout(() => {
            autoSave();
          }, autoSaveDebounceTime);
        } else {
          autoSave();
        }
      } else {
        if (debouncer.current !== undefined) {
          clearTimeout(debouncer.current);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, allFormValues]);

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
        {isLoaded && (
          <Form
            instructions={instructions}
            title={formTitle}
            subTitle=""
            //TODO testId={testId}
            //TODO titleStartIcon={titleStartIcon}
            titleEndChildren={titleEndChildren}
            formWidth={formWidth} //!isModal ? formWidth : 880}
            sxProps={{
              margin: '12px',
            }}
            showBorder={showPaper}
            showPaper={showPaper}
            // 8px below fixes top row getting clipped in Blueprint and VM Image forms
            formFields={
              <Grid
                container
                spacing={2}
                sx={{ paddingTop: '8px', width: '100%' }}
              >
                {children}
                {showInternalError && submitError && (
                  <Alert
                    onClose={() => {
                      setSubmitError('');
                    }}
                    color="error"
                  >
                    {submitError}
                  </Alert>
                )}
              </Grid>
            }
            formButtons={
              //test for additional buttons requires empty react element to wrap
              //eslint-disable-next-line react/jsx-no-useless-fragment

              <>
                {crudType !== FormCrudType.view && shouldDisplaySave ? (
                  <Stack direction="row" spacing={1}>
                    <ButtonModalCancelUi
                      id="cancel-button"
                      disabled={isSubmitting}
                      onClick={() => {
                        if (reset) {
                          reset(initialData);
                        }
                        if (onCancel) {
                          onCancel();
                        }
                      }}
                    >
                      Cancel
                    </ButtonModalCancelUi>
                    <ButtonLoadingUi
                      id="submit-button"
                      startIcon={<Check />}
                      disabled={
                        !isValid ||
                        isSubmitting ||
                        (shouldCheckIsDirty && !isDirty)
                      }
                      loading={isSubmitting}
                      loadingText={loadingButtonText}
                    >
                      {submitButtonText}
                    </ButtonLoadingUi>
                  </Stack>
                ) : (
                  <>
                    {shouldAutoSave &&
                      shouldShowAutoSaveIndicator &&
                      !shouldDisplaySave &&
                      isSubmitting && <LoadingUi message="Saving" />}
                    {onClose && (
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
                    )}
                  </>
                )}
              </>
            }
            submitError={submitError}
            onSubmit={handleSubmit(onSubmit, onSubmitInvalid)}
            onCloseAlert={() => setSubmitError('')}
          />
        )}
      </Box>
    </>
  );
}
export default MiniForm;
