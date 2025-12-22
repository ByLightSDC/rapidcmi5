// import { useEffect, useMemo } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { modal, setModal } from '@rapid-cmi5/ui';
// /* eslint-disable react-hooks/exhaustive-deps */
// import {
//   DetailWrapper,
//   DynamicPropertyProvider,
//   StepperContextProvider,
//   hasModal,
// } from '@rapid-cmi5/ui';


// /* Topics */
// import { Topic } from '@rapid-cmi5/ui';
// /**
//  * View Modals component
//  * Component renders forms in a modal dialog
//  * Forms can include this component in their render elements
//  * Or create a custom component to render only the modals they require
//  * @returns {React.ReactElement}
//  */
// export default function ViewModals() {
//   const dispatch: AppDispatch = useDispatch();
//   const modalObj = useSelector(modal);
//   const hasModalBool = useSelector(hasModal);

//   const handleClose = () => {
//     dispatch(setModal({ type: '', id: null, name: null }));
//   };

//   const getForm = () => {
//     if (modalObj.type !== 'view' || !modalObj.topic) {
//       return null;
//     }
//     const topicId = modalObj.topic;

//     const topicData = getMenuOptionData(topicId);
//     if (topicData && topicData.form) {
//       return topicData;
//     }
//     return null;
//   };

//   /**
//    * useEffect clears any modal when this component is unmountedd
//    * this component is mounted in each form
//    * it does not clear if there is a modal associated with the current bookmark
//    */

//   useEffect(() => {
//     return function cleanup() {
//       //REF for debugging
//       //console.log('Unmount ViewModals');
//       if (featureFlagCleanUpModals && !hasModalBool && modalObj.type !== '') {
//         dispatch(setModal({ type: '', id: null, name: null }));
//       }
//     };
//   }, []);

//   /**
//    * useEffect
//    */
//   useEffect(() => {
//     //
//   }, [modalObj.type, modalObj.topic]);
//   const theFormData = useMemo(() => getForm(), [modalObj.type, modalObj.topic]);
//   /* eslint-disable react/jsx-no-useless-fragment */
//   const detail = useMemo(() => {
//     return (
//       <>
//         {theFormData?.form && (
//           <DetailWrapper
//             crudType={modalObj.crudType}
//             dataCache={modalObj.meta}
//             uuid={modalObj.meta?.uuid || modalObj.id}
//             formOrWizardType={theFormData?.form}
//             isModal={true}
//             onModalClose={handleClose}
//             shouldBlockInteraction={
//               modalObj.topic === Topic.GhostTraffic ? false : undefined
//             } // need to propagate modal mouse click/up/down on this modal for so we can close timepicker poppers
//           />
//         )}
//       </>
//     );
//   }, [theFormData?.form]);

//   return (
//     <div data-testid="view-modals">
//       {theFormData?.form && (
//         // fragment needed to do steps test
//         // eslint-disable-next-line react/jsx-no-useless-fragment
//         <>
//           {theFormData?.steps ? (
//             <StepperContextProvider
//               isStepperEnabled={true}
//               defaultStep={0}
//               defaultStepErrors={[false, false, false]}
//               stepsDisabled={[false, false, false]}
//               steps={theFormData?.steps}
//               stepLabels={theFormData?.stepLabels}
//               stepTitles={theFormData?.stepTitles}
//               stepWidth={theFormData?.stepWidth}
//             >
//               {modalObj?.topic === Topic.ContainerSpec ||
//               modalObj?.topic === Topic.AnsiblePlaybook ||
//               modalObj?.topic === Topic.GhostTrafficProfile ? (
//                 <DynamicPropertyProvider crudType={modalObj.crudType}>
//                   {detail}
//                 </DynamicPropertyProvider>
//               ) : (
//                 <>{detail}</>
//               )}
//             </StepperContextProvider>
//           ) : (
//             <>
//               {modalObj?.topic === Topic.AnsiblePlaybook ||
//               modalObj?.topic === Topic.GhostTrafficProfile ? (
//                 <DynamicPropertyProvider crudType={modalObj.crudType}>
//                   {detail}
//                 </DynamicPropertyProvider>
//               ) : (
//                 <>{detail}</>
//               )}
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
