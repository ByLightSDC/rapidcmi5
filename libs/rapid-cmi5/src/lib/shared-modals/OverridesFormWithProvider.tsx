// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable no-prototype-builtins */
// import { useContext, useEffect, useMemo, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useLocation, useParams } from 'react-router';
// import {
//   FormProvider,
//   useForm,
//   UseFormReturn,
//   useWatch,
// } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { AppDispatch } from '../../../redux/store';
// import { setLoader } from '@rapid-cmi5/ui/redux';

// /* Shared */
// import MultiSelectionModals from './MultiSelectionModals';
// import SelectionModals from './SelectionModals';
// import {
//   ErrorMessageDetail,
//   diffPayload,
//   sanitizePayload,
// } from '@rapid-cmi5/ui/validation';

// /* Branded */
// import {
//   AuthoringInfoFields,
//   BookmarksContext,
//   ButtonLoadingUi,
//   ButtonModalMainUi,
//   ButtonModalMinorUi,
//   DataFetcher,
//   Form,
//   FormCrudType,
//   FormStateType,
//   StepperContext,
//   StepperUi,
//   FormControlUIContext,
//   iListItemType,
//   tAuthoringInfoFieldProps,
//   useNavigateAlias,
// } from '@rapid-cmi5/ui/branded';

// /* MUI */
// import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid';

// /* Icons */
// import RocketLaunch from '@mui/icons-material/RocketLaunch';

// /* Topic */
// import {
//   useGetRangeResourceScenarioOverrides,
//   usePutRangeResourceScenario,
//   useQueryDetails,
// } from '@rapid-cmi5/ui/api/hooks';
// import { ScenarioOverridesOverride } from '@rapid-cmi5/frontend/clients/devops-api';
// const defaultFormWidth = 880;

// /**
//  * Form component
//  * Displays form fields and handles user interaction
//  * @template tFormType List item type returned from API requests
//  * @template tFormCreateType Payload type for post API request
//  * @template tFormUpdateType Payload type for put API request
//  *
//  * @param {Partial<tAuthoringInfoFieldProps>} [authoringProps] Props for Authoring Field Component
//  * @param {*} [dataCache] Form data from cache
//  * @param {*} [defaultCache] Override for default payload for post (rarely used)
//  * @param {FormCrudType} crudType APi request method type
//  * @param {number} [formWidth] Width for form
//  * @param {string} [instructions] Any instructions to include at top of form
//  * @param {boolean} [isModal] Whether form is presented in a modal
//  * @param {string} [featureNameOverride] Name of feature - used to title Form depending on crudType
//  * @param {string} [crudLabel] Label to use instead of crud type along with featureNameOverride or topic for form title (e.g. Upload -> Upload Container)
//  * @param {string} [uuid] UUID of data to populate the form
//  * @param {() => void} [onCancel] Method to cancel the form
//  * @param {() => void} [onClose] Method to close the form
//  * @param {(isSuccess: boolean, data: tFormType) => void} [onResponse] Callback when success response is received after form submission
//  * @param {*} [getHook] API hook for retrieving item
//  * @param {*} [validationSchema] Form yup validation schema
//  * @param {*} [defaultPostData] Default post data fields
//  * @param {*} [defaultPutData] Default put data fields
//  * @param {boolean} [hasStepper=false] Whether form should look at stepper context (ex. so nested form won't inherit from another's settings)
//  * @param {(data: any) => any} [getCleanInitialData Method to sanitize initial form data
//  * @param {(data: any) => any} [getCleanSubmissionData] Method to sanitize form data for submit
//  * @param {*} [getFormFields] Method to retrieve fields unique to the form
//  * @returns {React.ReactElement}
//  */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// export function OverridesFormWithProvider<
//   tFormType,
//   tFormUpdateType,
//   tOverrideType,
// >({
//   authoringProps = { includeVersioning: false },
//   dataCache,
//   crudType = FormCrudType.edit,
//   formWidth = defaultFormWidth,
//   formTopic,
//   instructions,
//   isModal = false,
//   overrideProperty,
//   featureNameOverride,
//   crudLabel,
//   uuid = '',
//   onCancel,
//   onResponse,
//   onClose,
//   getHook,
//   validationSchema,
//   defaultPutData,
//   hasStepper = false,
//   getCleanSubmissionData,
//   getCleanInitialData,
//   getFormFields,
//   shouldSuppressSubmit = false,
// }: {
//   authoringProps?: Partial<tAuthoringInfoFieldProps>;
//   crudType: FormCrudType;
//   dataCache?: tFormType;
//   formWidth?: number;
//   formTopic: string;
//   instructions?: string;
//   isModal?: boolean;
//   overrideProperty: string;
//   featureNameOverride?: string;
//   crudLabel?: string;
//   uuid?: string;
//   shouldSuppressSubmit?: boolean;
//   onCancel?: () => void;
//   onClose?: () => void;
//   onResponse?: (isSuccess: boolean, data: tFormType, message: string) => void;
//   getHook?: any;
//   validationSchema?: any;
//   defaultPostData?: any;
//   defaultPutData?: any;
//   hasStepper?: boolean;
//   getCleanInitialData?: (data: any) => any;
//   getCleanSubmissionData?: (data: any) => any;
//   getFormFields: (
//     formMethods: UseFormReturn,
//     formState: FormStateType,
//   ) => JSX.Element;
// }) {
//   const dispatch: AppDispatch = useDispatch();
//   const navigateAlias = useNavigateAlias();
//   const { rangeId, scenarioId } = useParams();
//   const [isFinalized, setIsFinalized] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [initialData, setInitialData] = useState<any>(null);
//   const [mergedData, setMergedData] = useState<any>(null);
//   const [overridesData, setOverridesData] = useState<any>(null);
//   const [submitError, setSubmitError] = useState<string | JSX.Element>('');
//   const {
//     addBookmark,
//     addMetaDataToBookmark,
//     getFormDataByKey,
//     clearAllBookmarks,
//     clearForm,
//     getLastBookmark,
//     saveForm,
//   } = useContext(BookmarksContext);

//   const testId = `${formTopic}-overrides-form`;
//   const featureName = featureNameOverride || formTopic;

//   //#region getters & setters
//   /**
//    * Returns form title
//    * @return {string} Title
//    */
//   const getFormTitle = () => {
//     if (crudLabel) {
//       return `${crudLabel} ${featureName}`;
//     }
//     switch (crudType) {
//       case FormCrudType.edit:
//         return `Override ${featureName}`;
//     }
//     return featureName;
//   };

//   //#endregion

//   const finalizeDataLoaded = (data: iListItemType) => {
//     if (getCleanInitialData) {
//       setMergedData(getCleanInitialData(data));
//     } else {
//       setMergedData(data);
//     }

//     setIsLoaded(true);
//     setIsFinalized(true);
//   };

//   //#region handlers
//   /**
//    * Sets default state for row data
//    * Persists data uuid and name
//    * @param {iListItemType} data Row data
//    */
//   const handleInitialDataLoad = (data: iListItemType) => {
//     //store og data
//     setInitialData(data);

//     //for properties in the default payload
//     navigateAlias('', data.uuid, data.name, undefined, undefined, false);

//     //book mark data
//     let shouldRehydrateFormData = true;
//     if (location.key === 'default') {
//       const top = getLastBookmark();
//       if (top && location.pathname !== top.route) {
//         shouldRehydrateFormData = false;
//         clearAllBookmarks();
//       }
//     }

//     //rehydrate form data
//     if (shouldRehydrateFormData && crudType !== FormCrudType.view) {
//       const bookmarkCache = getFormDataByKey ? getFormDataByKey(testId) : null;
//       if (bookmarkCache) {
//         finalizeDataLoaded(bookmarkCache);
//         return;
//       }
//     }

//     //merge overrides with db data for the topic to inject into form
//     if (overrideProperty && overridesData?.hasOwnProperty(overrideProperty)) {
//       const uuids = overridesData[overrideProperty];
//       if (data.uuid && uuids.hasOwnProperty(data.uuid)) {
//         const overrideValues = uuids[data.uuid];
//         const newData: { [key: string]: any } = { ...data };
//         Object.keys(overrideValues).map((key) => {
//           newData[key] = overrideValues[key];
//           return true;
//         });
//         finalizeDataLoaded(newData);
//         return;
//       }
//     }
//     finalizeDataLoaded(data);
//   };

//   /**
//    * Persists overrides in state
//    * @param {ScenarioOverridesOverride} data Row data
//    */
//   const handleInitialOverridesDataLoad = (data: ScenarioOverridesOverride) => {
//     setOverridesData({ ...data });
//   };

//   /**
//    * Clears form data persisted to bookmarks
//    * Cleans data & submits form
//    * Waits for API Response
//    * Triggers success or fail display
//    * @param {any} data Form data
//    */
//   const onSubmit = async (data: any) => {
//     if (clearForm) {
//       clearForm(testId);
//     }
//     //resets
//     setSubmitError('');
//     if (crudType === FormCrudType.view) {
//       if (onClose) {
//         onClose();
//       }
//     } else {
//       let apiData: any = null;
//       try {
//         //prep fields for submission, for example convert convenience arrays to expanded ips
//         if (getCleanSubmissionData) {
//           data = getCleanSubmissionData(data);
//         }
//         //REF
//         //console.log('data', data);

//         //remove any properties not contained in the default PUT payload
//         const sanitizedData: tOverrideType = sanitizePayload(
//           data,
//           defaultPutData,
//         );

//         //REF
//         //console.log('mergedData', mergedData);
//         //console.log('sanitizedData', sanitizedData);

//         //diff form values against initial resource data
//         //we only need to submit the differences
//         const submitData = overridesData;
//         const diffData = diffPayload(initialData, sanitizedData);

//         //REF
//         //console.log('diffData', diffData);
//         //console.log('overrideProperty', overrideProperty);

//         //this throws an error
//         if (!submitData.hasOwnProperty(overrideProperty)) {
//           submitData[overrideProperty] = {};
//         }
//         submitData[overrideProperty][data.uuid] = diffData;

//         if (shouldSuppressSubmit) {
//           console.log('submitData', submitData);
//           return;
//         }

//         apiData = await putQuery.mutateAsync({
//           rangeId: rangeId,
//           uuid: scenarioId,
//           formData: { overrides: submitData },
//         });

//         if (onResponse) {
//           onResponse(true, apiData, `${featureName} updated successfully!`);
//         }
//       } catch (error: any) {
//         setSubmitError(ErrorMessageDetail(error, null, true));
//         if (onResponse) {
//           onResponse(false, apiData, '');
//         }
//       }
//     }
//   };
//   //#endregion

//   /**
//    * Use Effect
//    * Sets form data & loading state when cached data injected via props
//    */
//   useEffect(() => {
//     if (dataCache) {
//       handleInitialDataLoad(dataCache);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dataCache]);

//   //#region query hooks
//   /**
//    * Put Hook
//    * @constant
//    * @type {any}
//    */
//   const putQuery = usePutRangeResourceScenario();
//   if (putQuery) {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     useQueryDetails({
//       queryObj: putQuery,
//       loaderFunction: (isLoading) => {
//         dispatch(setLoader(isLoading));
//       },
//       errorFunction: (errorState) => {
//         // no toaster - alert handled separately
//       },
//       shouldDisplayToaster: false,
//     });
//   }
//   //#endregion

//   /**
//    * Form Constants & Validation
//    * @constant
//    * @type {any}
//    */
//   const methods: any = useForm({
//     defaultValues: useMemo(() => {
//       return mergedData;
//     }, [mergedData]),
//     mode: 'all',
//     resolver: yupResolver(validationSchema),
//   });
//   const { control, handleSubmit, reset, trigger, formState } = methods;

//   const { errors, isValid } = formState;
//   const bookmarkFormData = useWatch({ control });
//   const location = useLocation();

//   const { setFormMethods } = useContext(FormControlUIContext);

//   /**
//    * Use Effect stores the form methods in context when form mounts
//    */
//   /* eslint-disable react-hooks/exhaustive-deps */
//   useEffect(() => {
//     setFormMethods(methods);

//     if (!isModal) {
//       addBookmark({
//         key: location.pathname,
//         route: location.pathname,
//         label: formTitle,
//         meta: null,
//         isModal: false,
//       });
//     }
//   }, []);

//   /** @constant
//    * Stepper methods and data
//    */
//   const {
//     isStepperEnabled,
//     activeStep,
//     orientation,
//     steps,
//     stepsCompleted,
//     stepsDisabled,
//     stepLabels,
//     stepTitles,
//     stepErrors,
//     stepWidth,
//     setCurrentStep,
//   } = useContext(StepperContext);

//   /**
//    * Use Effect
//    * Saves form data to context
//    */
//   useEffect(() => {
//     if (isFinalized && crudType !== FormCrudType.view) {
//       if (saveForm && bookmarkFormData) {
//         saveForm(testId, bookmarkFormData);
//       }
//     }
//   }, [bookmarkFormData]);

//   /**
//    * Use Effect
//    * Resets form when data loads and triggers validation
//    */
//   useEffect(() => {
//     if (mergedData) {
//       reset(mergedData);
//       setIsLoaded(true);
//       // do an initial validation for edit mode only
//       if (crudType === FormCrudType.edit) {
//         trigger();
//       }
//     }
//   }, [crudType, mergedData, reset, trigger]);

//   //#endregion

//   /**
//    * Whether data is loading
//    * @constant
//    * @type {boolean}
//    */
//   const isLoading = putQuery?.isLoading;

//   /**
//    * Children (form fields)
//    * @constant
//    * @type {JSX.Element}
//    */
//   const children = getFormFields(
//     methods,
//     // form state pieces must be passed individually from within the state in order to be defined
//     { errors: formState.errors, isValid: formState.isValid },
//   );

//   /**
//    * Title
//    * @constant
//    * @type {string}
//    */
//   const formTitle = getFormTitle();

//   //#region steps
//   const getStepTitle = () => {
//     if (isStepperEnabled && hasStepper) {
//       const suffix = ' ' + (activeStep + 1) + '/' + steps?.length;
//       if (stepTitles && stepTitles.length > activeStep) {
//         return stepTitles[activeStep] + suffix;
//       }
//       if (steps && steps.length > activeStep) {
//         return steps[activeStep] + suffix;
//       }
//     }
//     return '';
//   };

//   const handleStepChange = (newStep: number) => {
//     addMetaDataToBookmark({ metaProperty: 'step', metaValue: newStep });
//     setCurrentStep(newStep);
//   };
//   const StepNavigationButtons = () => {
//     return (
//       <div>
//         <ButtonModalMinorUi
//           id="prev-step"
//           disabled={activeStep <= 0}
//           onClick={() => {
//             handleStepChange(activeStep - 1);
//           }}
//         >
//           Prev
//         </ButtonModalMinorUi>
//         <ButtonModalMinorUi
//           id="next-step"
//           disabled={steps ? activeStep >= steps.length - 1 : true}
//           onClick={() => {
//             handleStepChange(activeStep + 1);
//           }}
//         >
//           Next
//         </ButtonModalMinorUi>
//       </div>
//     );
//   };
//   //#endregion

//   return (
//     <>
//       {/* box so we can have vertical or horizontal stepper */}
//       <Box
//         sx={{
//           display: 'flex',
//           maxHeight: '100%', // so form will be correct height for scrolling when necessary
//           overflow: 'hidden', // so only form will have scrollbar
//         }}
//       >
//         {isStepperEnabled && hasStepper && (
//           <StepperUi
//             activeStep={activeStep}
//             orientation={orientation}
//             steps={steps || []}
//             completed={stepsCompleted || []}
//             disabled={stepsDisabled || []}
//             labels={stepLabels}
//             hasErrors={stepErrors || []}
//             // title={formTitle}
//             width={stepWidth}
//             onStepChange={setCurrentStep}
//           />
//         )}

//         {rangeId && scenarioId && (
//           <DataFetcher
//             apiHook={useGetRangeResourceScenarioOverrides}
//             loadingMessage="Overrides..."
//             payload={{
//               rangeId: rangeId,
//               id: scenarioId,
//             }}
//             onDataLoad={handleInitialOverridesDataLoad}
//             onError={() => {
//               if (onClose) {
//                 onClose();
//               }
//             }}
//           />
//         )}
//         {overridesData && uuid && !dataCache && (
//           <DataFetcher
//             apiHook={getHook}
//             loadingMessage="Defaults..."
//             payload={{
//               rangeId: rangeId,
//               scenarioId: scenarioId,
//               id: uuid,
//             }}
//             onDataLoad={handleInitialDataLoad}
//             onError={() => {
//               if (onClose) {
//                 onClose();
//               }
//             }}
//           />
//         )}
//         {isLoaded ? (
//           <FormProvider {...methods}>
//             <Form
//               instructions={instructions}
//               title={formTitle}
//               subTitle={getStepTitle()}
//               testId={testId}
//               formWidth={formWidth}
//               sxProps={{
//                 margin: isModal ? (hasStepper ? '12px' : '0px') : '12px',
//               }}
//               showBorder={!isModal}
//               formFields={
//                 <Grid container spacing={2} sx={{ marginTop: '0px' }}>
//                   {children}
//                   <AuthoringInfoFields
//                     crudType={crudType}
//                     control={control}
//                     errors={errors}
//                     {...authoringProps}
//                   />
//                 </Grid>
//               }
//               formButtons={
//                 //test for additional buttons requires empty react element to wrap
//                 //eslint-disable-next-line react/jsx-no-useless-fragment
//                 <>
//                   {isStepperEnabled && hasStepper ? (
//                     <Box
//                       id="form-buttons"
//                       sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         width: '100%',
//                       }}
//                     >
//                       {crudType !== FormCrudType.view ? (
//                         <>
//                           <ButtonModalMinorUi
//                             id="cancel-button"
//                             disabled={isLoading}
//                             onClick={() => {
//                               if (onCancel) {
//                                 if (clearForm) {
//                                   clearForm(testId);
//                                 }
//                                 onCancel();
//                               }
//                             }}
//                           >
//                             Cancel
//                           </ButtonModalMinorUi>
//                           <StepNavigationButtons />
//                           <ButtonLoadingUi
//                             id="submit-button"
//                             startIcon={<RocketLaunch />}
//                             disabled={!isValid || isLoading}
//                             loading={isLoading}
//                           >
//                             Deploy
//                           </ButtonLoadingUi>
//                         </>
//                       ) : (
//                         <>
//                           <div style={{ minWidth: 120 }} />
//                           <StepNavigationButtons />
//                           <div style={{ minWidth: 120 }}>
//                             <ButtonModalMainUi
//                               id="close-button"
//                               startIcon={null}
//                               type="button"
//                               onClick={() => {
//                                 if (onClose) {
//                                   onClose();
//                                 }
//                               }}
//                             >
//                               Close
//                             </ButtonModalMainUi>
//                           </div>
//                         </>
//                       )}
//                     </Box>
//                   ) : (
//                     //test for crud type requires empty react element to wrap
//                     // eslint-disable-next-line react/jsx-no-useless-fragment
//                     <>
//                       {crudType !== FormCrudType.view ? (
//                         <>
//                           <ButtonModalMinorUi
//                             id="cancel-button"
//                             disabled={isLoading}
//                             onClick={() => {
//                               if (onCancel) {
//                                 if (clearForm) {
//                                   clearForm(testId);
//                                 }
//                                 onCancel();
//                               }
//                             }}
//                           >
//                             Cancel
//                           </ButtonModalMinorUi>
//                           <ButtonLoadingUi
//                             id="submit-button"
//                             startIcon={<RocketLaunch />}
//                             disabled={!isValid || isLoading}
//                             loading={isLoading}
//                           >
//                             Deploy
//                           </ButtonLoadingUi>
//                         </>
//                       ) : (
//                         <ButtonModalMainUi
//                           id="close-button"
//                           startIcon={null}
//                           type="button"
//                           onClick={() => {
//                             if (onClose) {
//                               onClose();
//                             }
//                           }}
//                         >
//                           OK
//                         </ButtonModalMainUi>
//                       )}
//                     </>
//                   )}
//                 </>
//               }
//               submitError={submitError}
//               onSubmit={handleSubmit(onSubmit)}
//               onCloseAlert={() => setSubmitError('')}
//             />
//           </FormProvider>
//         ) : null}
//         {!isModal && (
//           <>
//             <MultiSelectionModals />
//             <SelectionModals />
//           </>
//         )}
//       </Box>
//     </>
//   );
// }
// export default OverridesFormWithProvider;
