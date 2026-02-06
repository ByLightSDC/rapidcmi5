// import { useMemo } from 'react';
// import { useSelector } from 'react-redux';
// /* Branded */
// import {
//   ActionRow,
//   MultipleSelectWrapper,
//   actionRowSortableColumns,
//   modal,
// } from '@rapid-cmi5/ui';

// /* Constants */
// import {
//   rowsPerPageDefault,
// } from '../constants';

// /**
//  * Returns the form to be displayed based on modalObj.type
//  * @returns {React.ReactElement} or null
//  */
// export const getMultiSelectModal = (
//   modalObjType: string,
//   topicId?: string | null,
//   apiHook?: any,
//   queryKey?: any,
//   shouldSkipQuery?: any,
//   defaultPageData?: any[],
// ) => {
//   if (modalObjType === '') {
//     return null;
//   }

//   if (modalObjType !== 'multi-select') {
//     return null;
//   }

//   if (!topicId) {
//     return null;
//   }

//   //Custom Params based on topic
//   let rowsPerPage = rowsPerPageDefault;

//   if ((shouldSkipQuery && defaultPageData)) {
//     return (
//       <MultipleSelectWrapper
//         allowCreateNew={!shouldSkipQuery}
//         apiHook={apiHook}
//         dataIdField={'uuid'}
//         defaultPageData={shouldSkipQuery ? defaultPageData : []}
//         isTopicEditable={!shouldSkipQuery}
//         pageLabel={`${topicId}:s`}
//         queryKey={queryKey}
//         renderItem={ActionRow}
//         rowsPerPage={rowsPerPage}
//         sortableColumns={actionRowSortableColumns}
//         title={`Select ${topicId}s`}
//         topicId={topicId}
//         visibleFilters={[]} //no filters for non queried lists
//       />
//     );
//   }
//   return null;
// };

// /**
//  * Handles View / Selection modals for Package Form
//  * @returns {React.ReactElement}
//  */
// export default function MultiSelectionModals() {
//   const modalObj = useSelector(modal);

//   const theMultiSelectModal = useMemo(() => {
//     const defaultPageItems = undefined;
//     return getMultiSelectModal(
//       modalObj.type,
//       modalObj.topic,
//       modalObj.meta?.shouldSkipQuery,
//       defaultPageItems,
//     );
//   }, [modalObj.type, modalObj.topic, modalObj.meta?.shouldSkipQuery]);

//   return (
//     <div data-testid="multiple-selection-modals">{theMultiSelectModal}</div>
//   );
// }
