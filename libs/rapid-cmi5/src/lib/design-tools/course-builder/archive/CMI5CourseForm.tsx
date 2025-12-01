// import { UseFormReturn } from 'react-hook-form';
// import * as yup from 'yup';

// /* Branded */
// import {
//   FormControlTextField,
//   FormFieldArray,
//   FormCrudType,
//   FormStateType,
//   SharedFormWithProvider,
//   tFormFieldRendererProps,
//   FormControlCheckboxField,
//   FormControlSelectField,
//   DynamicSelectorFieldGroup,
//   ClearedUuidValue,
//   defaultCourseData,
// } from '@rangeos-nx/ui/branded';

// /* MUI */
// import Grid from '@mui/material/Grid';

// /* API Topic */
// import {
//   Topic,
//   usePostCourseFile,
//   useGetCourseFile,
//   useGetScenario,
//   queryKeyScenarios,
// } from '@rangeos-nx/ui/api/hooks';
// import { CourseData, SlideTypeEnum } from '@rangeos-nx/types/cmi5';
// import { getInfoText } from 'apps/rapid-cmi5-electron-frontend/src/app/utils/infoButtonText';
// import { useContext } from 'react';
// import { CourseBuilderContext } from './CourseBuilderContext';
// import { IDesignerContext } from './CourseBuilderTypes';
// import { SlidesFieldGroup } from './SlideFieldGroup';
// import { useSelector } from 'react-redux';
// import {
//   currentAu,
//   currentBlock,
// } from 'apps/rapid-cmi5-electron-frontend/src/app/redux/courseBuilderReducer';

// type tFormProps = {
//   crudType: FormCrudType;
//   dataCache?: CourseData;
//   defaultCache?: CourseData;
//   isModal?: boolean;
//   title?: string;
//   uuid?: string;
//   onCancel?: () => void;
//   onClose?: () => void;
//   onResponse?: (isSuccess: boolean, data: CourseData) => void;
//   postHook?: any;
//   putHook?: any;
//   getHook?: any;
// };

// /**
//  * Displays CMI5CourseForm Form
//  * @param {tFormProps} props Component Prop
//  *  @returns {JSX.Element} React Component
//  */
// export default function CMI5CourseForm(props: tFormProps) {
//   const { crudType, isModal } = props;
//   const formTopic = Topic.CMI5Course;
//   const designer = useContext(CourseBuilderContext);

//   const currentAuIndex = useSelector(currentAu);
//   const currentBlockIndex = useSelector(currentBlock);

//   //we will only let you edit the current au
//   const blockAuField = `blocks[${currentBlockIndex}].aus[${currentAuIndex}]`;

//   const validationSchema = yup.object().shape({
//     //courseId: yup.string().required('Course Id is required'),
//   });

//   /**
//    * Returns form fields unique to this form
//    * @param {UseFormReturn} formMethods React hook form methods
//    * @param {FormStateType} formState React hook form state fields (ex. errors, isValid)
//    * @return {JSX.Element} Render elements
//    */
//   const getFormFields = (
//     formMethods: UseFormReturn,
//     formState: FormStateType,
//   ): JSX.Element => {
//     const { control, watch } = formMethods;
//     const { errors, isValid } = formState;

//     const sharedFormProps = {
//       isModal: isModal,
//       isValid: isValid,
//       readOnly: crudType === FormCrudType.view,
//       placeholder: '',
//     };

//     const currentAuName = watch(`${blockAuField}.auName`);

//     return (
//       <>
//         <Grid item xs={6}>
//           <FormControlTextField
//             control={control}
//             error={Boolean(errors?.courseTitle)}
//             helperText={errors?.courseTitle?.message}
//             name="courseTitle"
//             //required
//             label="Course Title"
//             readOnly={crudType === FormCrudType.view}
//           />
//         </Grid>
//         <Grid item xs={4}>
//           <FormControlTextField
//             control={control}
//             error={Boolean(errors?.courseId)}
//             helperText={errors?.courseId?.message}
//             infoText={getInfoText('cmiCourse', 'courseId')}
//             name="courseId"
//             //required
//             label="Course Id"
//             readOnly={crudType === FormCrudType.view}
//           />
//         </Grid>
//         <Grid item xs={11.5}>
//           <FormControlTextField
//             control={control}
//             error={Boolean(errors?.courseDescription)}
//             helperText={errors?.courseDescription?.message}
//             name="courseDescription"
//             label="Course Description"
//             readOnly={crudType === FormCrudType.view}
//           />
//         </Grid>
//         <Grid item xs={6}>
//           <FormControlTextField
//             control={control}
//             name={`${blockAuField}.auName`}
//             //required
//             label="Assignable Unit Name"
//             readOnly={crudType === FormCrudType.view}
//           />
//         </Grid>
//         <Grid item xs={6}>
//           <DynamicSelectorFieldGroup
//             allowClear={true}
//             clearedUuidValue={ClearedUuidValue.Undefined}
//             apiHook={useGetScenario}
//             crudType={crudType}
//             formProps={{
//               formMethods,
//               fieldName: `${blockAuField}.rangeosScenarioUUID`,
//               indexedArrayField: `${blockAuField}.rangeosScenarioUUID`,
//               indexedErrors: null,
//               placeholder: '',
//               readOnly: crudType === FormCrudType.view,
//             }}
//             inspectorProps={{}}
//             itemLabel="Scenario"
//             queryKey={queryKeyScenarios}
//             selectionTargetId={Topic.CMI5Course}
//             shouldApplySelections={true}
//             shouldShowLabelText={true}
//             topicId={Topic.Scenario}
//           />
//         </Grid>

//         <Grid item xs={11}>
//           <FormFieldArray
//             defaultIsExpanded={false}
//             errors={errors}
//             formMethods={formMethods}
//             allowAdd={false}
//             allowReOrder={true}
//             arrayFieldName={`${blockAuField}.slides`}
//             arrayRenderItem={(props: tFormFieldRendererProps) => {
//               return (
//                 <SlidesFieldGroup
//                   blockAuField={blockAuField}
//                   isCourseForm={true}
//                   crudType={crudType}
//                   formErrors={errors}
//                   formProps={props}
//                 />
//               );
//             }}
//             defaultValues={{
//               type: SlideTypeEnum.Markdown,
//               slideTitle: '',
//               content: undefined,
//             }}
//             isExpandable={true}
//             title={`${currentAuName} Slides`}
//             {...sharedFormProps}
//           />
//         </Grid>
//       </>
//     );
//   };

//   return (
//     <SharedFormWithProvider<CourseData, CourseData, CourseData>
//       {...props}
//       designer={designer as IDesignerContext}
//       postHook={usePostCourseFile}
//       getHook={useGetCourseFile}
//       hasAuthoringInfo={false} //TODO maybe
//       formTopic={formTopic}
//       formWidth={'900px'}
//       validationSchema={validationSchema}
//       defaultPostData={defaultCourseData}
//       defaultPutData={defaultCourseData}
//       getFormFields={getFormFields}
//     />
//   );
// }
