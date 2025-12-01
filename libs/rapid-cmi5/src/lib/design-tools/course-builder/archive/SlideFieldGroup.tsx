// /* Branded */
// import {
//   FormControlCheckboxField,
//   FormControlTextField,
//   FormCrudType,
//   tFormFieldRendererProps,
//   FormControlSelectField,
//   DynamicSelectorFieldGroup,
//   ClearedUuidValue,
//   FormFieldArray,
//   FormControlIntegerField,
//   ViewExpander,
//   debugLog,
//   DelimStyle,
//   defaultQuestion,
// } from '@rangeos-nx/ui/branded';

// /* MUI */
// import Grid from '@mui/material/Grid';
// import MenuItem from '@mui/material/MenuItem';

// /* API Topic */
// import {
//   Topic,
//   useGetScenario,
//   queryKeyScenarios,
// } from '@rangeos-nx/ui/api/hooks';

// import { completionOptions, SlideTypeEnum } from '@rangeos-nx/types/cmi5';
// import {

//   getDisplayNameFromSlideType,

// } from './CourseBuilderTypes';
// import { QuizQuestionsFieldGroup } from './QuizQuestionsFieldGroup';

// import { useEffect } from 'react';
// import { getInfoText } from 'apps/rapid-cmi5-electron-frontend/src/app/utils/infoButtonText';

// /**
//  * @interface fieldGroupProps
//  * @extends tFormFieldRendererProps
//  * @property {FormCrudType} crudType Mode for displaying data
//  * @property {*} [formErrors] Top level form errors
//  */
// interface fieldGroupProps {
//   isCourseForm?: boolean;
//   isContentExpanded?: boolean;
//   onNotifyExpanded?: (isExpanded: boolean, touchId?: string) => void;
//   crudType: FormCrudType;
//   formErrors?: any;
//   formProps: tFormFieldRendererProps;
//   blockAuField?: string;
// }

// /**
//  * Slide Field Group
//  * @param props
//  * @returns
//  */
// export function SlidesFieldGroup(props: fieldGroupProps) {
//   const {
//     isContentExpanded = false,
//     onNotifyExpanded,
//     blockAuField,
//     crudType,
//     formErrors,
//     formProps,
//   } = props;
//   const { formMethods, indexedArrayField, indexedErrors, isModal } = formProps;
//   const { control, setValue, trigger, watch } = formMethods;

//   // SlideType level
//   const watchSlideType = watch(`${indexedArrayField}.type`);
//   const watchScenario = watch(`${blockAuField}.rangeosScenarioUUID`);

//   /**
//    *
//    * @param {string} topicId
//    * @param {any} item New value of field
//    */
//   const handleApplyScenario = (topicId: string, item: any) => {
//     if (blockAuField) {
//       setValue(`${blockAuField}.rangeosScenarioName`, item.meta.name);
//       setValue(`${blockAuField}.rangeosScenarioUUID`, item.meta.uuid);
//     }

//     //apply to all auto graders
//   };

//   //REF HOP Move this to a user initiated action
//   //const watchContent = watch(`${indexedArrayField}.content`);
//   // useEffect(() => {
//   //   if (
//   //     watchSlideType === SlideTypeEnum.Markdown &&
//   //     typeof watchContent === 'string'
//   //   ) {
//   //     if (watchContent.includes('\n') || watchContent.includes(`\\"`)) {
//   //       const cleanText = watchContent
//   //         .replace(/(\\n)/g, '\n')
//   //         .replace(/(\\")/g, '"');
//   //       setValue(`${indexedArrayField}.content`, cleanText);
//   //     }
//   //   }
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, [watchContent, indexedArrayField, setValue]);

//   //HOP moved this to parent
//   // useEffect(() => {
//   //   // trigger validation for newly rendered slide
//   // }, [currentSlideIndex, indexedArrayField, trigger]);

//   const sharedFormProps = {
//     formMethods,
//     //...formState,
//     crudType: crudType,
//     isModal: isModal,
//     readOnly: crudType === FormCrudType.view,
//     //isValid: isValid,
//     placeholder: '',
//   };

//   useEffect(() => {
//     console.log('watchScenario', watchScenario);
//   }, [watchScenario]);

//   return (
//     <div
//       className="scrollingDiv"
//       style={{
//         height: '100%',
//         //HOP maxHeight: availHeight,
//         overflowX: 'hidden',
//         overflowY: 'auto',
//       }}
//     >
//       <Grid
//         container
//         spacing={0.5}
//         sx={{ marginLeft: '12px', marginTop: '12px' }}
//         id={indexedArrayField} // this is used for scrolling when new array entry added
//       >
//         <>
//           <Grid item xs={6}>
//             <FormControlTextField
//               control={control}
//               placeholder="Slide Title"
//               name={`${indexedArrayField}.slideTitle`}
//               label="Slide Title"
//               error={Boolean(indexedErrors?.slideTitle)}
//               helperText={indexedErrors?.slideTitle?.message}
//               readOnly={crudType === FormCrudType.view}
//             />
//           </Grid>
//           {/* REF <Grid item xs={5}>
//               <FormControlSelectField
//                 control={control}
//                 name={`${indexedArrayField}.type`}
//                 required
//                 label="Slide Type"
//                 error={Boolean(indexedErrors?.type)}
//                 helperText={indexedErrors?.type?.message}
//                 readOnly={crudType === FormCrudType.view}
//                 sxProps={{ minWidth: '150px' }}
//               >
//                 {slideOptions.map((item) => (
//                   <MenuItem
//                     key={item}
//                     value={item}
//                     disabled={disabledSlideOptions.includes(item)}
//                   >
//                     {item}
//                   </MenuItem>
//                 ))}
//               </FormControlSelectField>
//             </Grid> */}
//         </>

//         {watchSlideType === SlideTypeEnum.Scenario && (
//           <>
//             <Grid item xs={8}>
//               <DynamicSelectorFieldGroup
//                 allowClear={true}
//                 clearedUuidValue={ClearedUuidValue.Undefined}
//                 apiHook={useGetScenario}
//                 crudType={crudType}
//                 formProps={{
//                   formMethods,
//                   fieldName: 'blocks[0].aus[0].rangeosScenarioUUID',
//                   indexedArrayField: 'blocks[0].aus[0].rangeosScenarioUUID',
//                   indexedErrors: formErrors?.rangeosScenarioUUID,
//                   placeholder: '',
//                   readOnly: crudType === FormCrudType.view,
//                 }}
//                 inspectorProps={{}}
//                 queryKey={queryKeyScenarios}
//                 selectionTargetId={Topic.CMI5Course}
//                 shouldApplySelections={false}
//                 //shouldShowLabelText={true}
//                 topicId={Topic.Scenario}
//                 onApplySelection={handleApplyScenario}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <FormControlCheckboxField
//                 control={control}
//                 name={`${indexedArrayField}.content.promptClassId`}
//                 label="Prompt User for Class ID"
//                 infoText={getInfoText('cmiCourse', 'promptClass')}
//                 checkboxProps={{
//                   disabled: crudType === FormCrudType.view,
//                 }}
//               />
//             </Grid>
//             <Grid item xs={8}>
//               <FormControlTextField
//                 control={control}
//                 placeholder=""
//                 name={`${indexedArrayField}.content.introTitle`}
//                 label="Intro Title"
//                 readOnly={crudType === FormCrudType.view}
//               />
//             </Grid>
//             <Grid item xs={8}>
//               <FormControlTextField
//                 control={control}
//                 placeholder=""
//                 name={`${indexedArrayField}.content.introContent`}
//                 label="Intro Content"
//                 multiline
//                 readOnly={crudType === FormCrudType.view}
//               />
//             </Grid>
//           </>
//         )}
//         {watchSlideType === SlideTypeEnum.Markdown && (
//           <Grid item xs={11.5}>
//             <ViewExpander
//               defaultIsExpanded={false}
//               shouldIndicateMore={true}
//               shouldStartWithDivider={false}
//               title="Content"
//             >
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content`}
//                 minRows={isModal ? 1 : 20}
//                 maxRows={isModal ? 4 : 20}
//                 //required
//                 label="Content"
//                 readOnly={true}
//                 multiline={true}
//                 sxProps={{}}
//               />
//             </ViewExpander>
//           </Grid>
//         )}
//         {(watchSlideType === SlideTypeEnum.Quiz ||
//           watchSlideType === SlideTypeEnum.CTF) && (
//           <>
//             <Grid item xs={4}>
//               <FormControlTextField
//                 control={control}
//                 placeholder="Activity Id"
//                 name={`${indexedArrayField}.content.cmi5QuizId`}
//                 label="Activity Id"
//                 error={Boolean(indexedErrors?.content?.cmi5QuizId)}
//                 helperText={indexedErrors?.content?.cmi5QuizId?.message}
//                 readOnly={crudType === FormCrudType.view}
//                 required
//               />
//             </Grid>
//             <ViewExpander
//               defaultIsExpanded={isContentExpanded}
//               expandTestId="author-quiz" // match touch list id
//               shouldIndicateMore={true}
//               shouldStartWithDivider={false}
//               title={`${getDisplayNameFromSlideType(watchSlideType)} Content`}
//               onNotifyExpanded={onNotifyExpanded}
//             >
//               <>
//                 {watchSlideType === SlideTypeEnum.Quiz && (
//                   <>
//                     <Grid item xs={8}>
//                       <FormControlTextField
//                         control={control}
//                         placeholder="Activity Title"
//                         name={`${indexedArrayField}.content.title`}
//                         label="Activity Title"
//                         error={Boolean(indexedErrors?.content?.title)}
//                         helperText={indexedErrors?.content.title?.message}
//                         readOnly={crudType === FormCrudType.view}
//                       />
//                     </Grid>

//                     <Grid item xs={4} />
//                     <Grid item xs={8}>
//                       <FormControlSelectField
//                         control={control}
//                         name={`${indexedArrayField}.content.completionRequired`}
//                         required
//                         label="Completion"
//                         error={Boolean(
//                           indexedErrors?.content?.completionRequired,
//                         )}
//                         helperText={
//                           indexedErrors?.content?.completionRequired?.message
//                         }
//                         readOnly={crudType === FormCrudType.view}
//                       >
//                         {completionOptions.map((item) => (
//                           <MenuItem key={item} value={item}>
//                             {item}
//                           </MenuItem>
//                         ))}
//                       </FormControlSelectField>
//                     </Grid>
//                   </>
//                 )}
//                 <Grid item xs={2.5}>
//                   <FormControlIntegerField
//                     {...formMethods}
//                     control={control}
//                     error={Boolean(indexedErrors?.content?.passingScore)}
//                     helperText={indexedErrors?.content?.passingScore?.message}
//                     //infoText={interfaceIndexHelperText}
//                     name={`${indexedArrayField}.content.passingScore`}
//                     label="Passing Score%"
//                     readOnly={crudType === FormCrudType.view}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={11}>
//                   <FormFieldArray
//                     errors={indexedErrors?.content}
//                     allowReOrder={true}
//                     allowSingleItemView={true}
//                     arrayFieldName={`${indexedArrayField}.content.questions`}
//                     arrayRenderItem={(props: tFormFieldRendererProps) => {
//                       return (
//                         <QuizQuestionsFieldGroup
//                           crudType={crudType}
//                           //formErrors={errors}
//                           formProps={props}
//                           slideType={watchSlideType}
//                         />
//                       );
//                     }}
//                     defaultValues={defaultQuestion}
//                     defaultIsExpanded={false}
//                     defaultSingleItemView={true}
//                     expandId={`${indexedArrayField}.content.questions`}
//                     isExpandable={true}
//                     title="Questions"
//                     {...formProps}
//                   />
//                 </Grid>
//               </>
//             </ViewExpander>
//           </>
//         )}
//         {watchSlideType === SlideTypeEnum.JobeInTheBox && (
//           <>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.slideTitle`}
//                 minRows={1}
//                 maxRows={4}
//                 //required
//                 label="Intro Title"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//                 sxProps={{ height: '30%' }}
//               />
//             </Grid>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.description`}
//                 minRows={1}
//                 maxRows={4}
//                 //required
//                 label="Description"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//                 sxProps={{ height: '30%' }}
//               />
//             </Grid>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.student`}
//                 minRows={4}
//                 maxRows={12}
//                 //required
//                 label="Student Code"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//                 sxProps={{ height: '30%' }}
//               />
//             </Grid>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.evaluator`}
//                 minRows={4}
//                 maxRows={12}
//                 //required
//                 label="Evaluator"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//                 sxProps={{ height: '30%' }}
//               />
//             </Grid>
//           </>
//         )}
//         {watchSlideType === SlideTypeEnum.SourceDoc && (
//           <>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.introContent`}
//                 minRows={1}
//                 maxRows={8}
//                 label="Introduction"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//               />
//             </Grid>
//             <Grid item xs={11.5}>
//               <FormControlTextField
//                 control={control}
//                 name={`${indexedArrayField}.content.sourceDoc`}
//                 minRows={1}
//                 maxRows={8}
//                 required
//                 label="HTML"
//                 readOnly={crudType === FormCrudType.view}
//                 multiline={true}
//               />
//             </Grid>
//           </>
//         )}
//       </Grid>
//     </div>
//   );
// }
