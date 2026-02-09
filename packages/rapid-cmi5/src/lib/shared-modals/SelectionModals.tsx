// import { useMemo } from 'react';
// import { useSelector } from 'react-redux';



// /* Constants */
// import {
//   rowsPerPageDefault,
// } from '../constants';
// import { ActionRow, actionRowSortableColumns, modal, SelectWrapper, useGetCacheSelection } from '@rapid-cmi5/ui';


// /**
//  * Returns the form to be displayed based on modalObj.type
//  * @returns {React.ReactElement} or null
//  */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// export const getSingleSelectModal = (
//   modalObjType?: string,
//   topicId?: string | null,
//   cache?: any,
//   filters?: any,
//   modalTitle?: string,
//   shouldSkipQuery?: any,
//   defaultPageData?: any[],
// ) => {
//   if (modalObjType !== 'select' || !topicId) {
//     return null;
//   }

//   //Custom Params based on topic
//   let rowsPerPage = rowsPerPageDefault;

//   if (topicHookData || (shouldSkipQuery && defaultPageData)) {
//     return (
//       <SelectWrapper
//         allowCreateNew={!shouldSkipQuery}
//         apiHook={shouldSkipQuery ? null : topicHookData.listApiHook}
//         defaultPageData={shouldSkipQuery ? defaultPageData : []}
//         filters={filters}
//         isTopicEditable={!shouldSkipQuery}
//         pageLabel={`${topicId}:s`}
//         queryKey={queryKey}
//         renderItem={ActionRow}
//         rowsPerPage={rowsPerPage}
//         sortableColumns={actionRowSortableColumns}
//         title={modalTitle || `Select ${topicId}`}
//         topicId={topicId}
//         visibleFilters={[]}
//       />
//     );
//   }
//   return null;
// };

// /**
//  * Selection Modals component
//  * Component renders list views in a modal dialog where items can be selected
//  * See SelectWrapper
//  * Forms can include this component in their render elements
//  * Or create a custom component to display selection lists for only the modals they require
//  * @type {tSelectionModalsProps}
//  * @returns {React.ReactElement} List view that supports selecting list items, cancel, and apply
//  */
// export default function SelectionModals() {
//   //this hook must persist at all times, otherwise console error
//   const getSelectionCache = useGetCacheSelection();

//   const modalObj = useSelector(modal);

//   /* eslint-disable react-hooks/exhaustive-deps */
//   const theSingleSelectModal = useMemo(() => {
//     const defaultPageItems = undefined;
//     return getSingleSelectModal(
//       modalObj.type,
//       modalObj.topic,
//       getSelectionCache,
//       modalObj.meta?.filters,
//       modalObj.meta?.modalTitle,
//       modalObj.meta?.shouldSkipQuery,
//       defaultPageItems,
//     );
//   }, [
//     modalObj.type,
//     modalObj.topic,
//     modalObj.meta?.filters,
//     modalObj.meta?.shouldSkipQuery,
//   ]);

//   return <div data-testid="selection-modals">{theSingleSelectModal}</div>;
// }
