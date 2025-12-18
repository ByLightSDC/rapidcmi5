// import { useMemo } from 'react';
// import { useSelector } from 'react-redux';
// import { modal } from '@rapid-cmi5/ui/redux';
// /* Branded */
// import {
//   ActionRow,
//   MultipleSelectWrapper,
//   defaultInputFilters,
// } from '@rapid-cmi5/ui/branded';
// /* Constants */
// import { Topic, apiTopicsHookData } from '@rapid-cmi5/ui/api/hooks';
// import {
//   rowsPerPageDefault,
//   rowsPerPage_Certificate,
//   rowsPerPage_DnsZone,
// } from '../../../constants';
// const deleteDialogButtons = ['Cancel', 'Delete'];

// /**
//  * Returns the bulk-delete modal to be displayed based on topic
//  * @param {string} modalObjType type of modal
//  * @param {string | null} [topicId]
//  * @param {*} [payloadFilters] additional filters to pass to api hook
//  * @returns {React.ReactElement} or null
//  */
// const getBulkDeleteModal = (
//   modalObjType: string,
//   topicId?: string | null,
//   payloadFilters?: any,
// ) => {
//   if (modalObjType === '') {
//     return null;
//   }
//   if (modalObjType !== 'bulk-delete') {
//     return null;
//   }
//   if (!topicId) {
//     return null;
//   }
//   const topicHookData = apiTopicsHookData[topicId];
//   // don't allow user to change author filter -- it will always be on
//   const visibleFilters = defaultInputFilters;
//   const authorFilterIndex = visibleFilters.findIndex(
//     (item) => item.key !== 'author',
//   );
//   console.log('authorFilterIndex', authorFilterIndex);
//   //TODO Mare
//   // if (authorFilterIndex >= 0) {
//   //   visibleFilters[authorFilterIndex].default = 'true';
//   // }

//   //Custom Params based on topic
//   let rowsPerPage = rowsPerPageDefault;
//   if (topicId === Topic.Certificate) {
//     rowsPerPage = rowsPerPage_Certificate;
//   } else if (topicId === Topic.DnsZone) {
//     rowsPerPage = rowsPerPage_DnsZone;
//   }

//   if (topicHookData) {
//     return (
//       <MultipleSelectWrapper
//         apiHook={topicHookData.listApiHook}
//         dataIdField={'uuid'}
//         filters={payloadFilters}
//         modalIdPrefix="multidelete"
//         instructions="Click one or more items in the list to add them to your selection. Click DELETE when you are done."
//         pageLabel={`${topicId}:s`}
//         queryKey={topicHookData.queryKey}
//         renderItem={ActionRow}
//         rowsPerPage={rowsPerPage}
//         modalButtonText={deleteDialogButtons}
//         title={`Delete ${topicId}s`}
//         topicId={topicId}
//         visibleFilters={visibleFilters}
//       />
//     );
//   }
//   return null;
// };

// /**
//  * Handles Allowing multi delete of authored items from a dashboard
//  * @returns {React.ReactElement}
//  */
// export default function BulkDeleteModal() {
//   const modalObj = useSelector(modal);
//   const theBulkDeleteModal = useMemo(() => {
//     return getBulkDeleteModal(
//       modalObj.type,
//       modalObj.topic,
//       modalObj.meta?.listPayload,
//     );
//   }, [modalObj.type, modalObj.topic, modalObj.meta?.listPayload]);
//   return <div data-testid="bulk-delete-modal">{theBulkDeleteModal}</div>;
// }
