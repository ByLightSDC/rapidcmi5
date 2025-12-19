// import { useState } from 'react';
// import { OverflowTypography } from '../data-display/OverflowTypography';
// import DataCacheOrFetcher from '../forms/DataCacheOrFetcher';

// /**
//  * Props for DashboardUuidField
//  * @type Props
//  * @property {any} apiHook Hook for getting individual item by uuid
//  * @property {string} fieldUuid UUiD for field associated with current Resource Item being displayed
//  * @property {any} [filters] Optional filters to apply to api hook call
//  * @property {string} queryKey Key for query cache
//  */
// type Props = {
//   fieldUuid: string;
//   apiHook: any;
//   filters?: any;
//   queryKey: string;
// };

// /**
//  * Provides display Name from an associated UUID field
//  * @param {Props} props
//  * @returns {React.ReactElement}
//  */
// export function DashboardUuidNameField(props: Props) {
//   const { apiHook, fieldUuid, filters = {}, queryKey } = props;

//   //#region ghost c2 server data
//   const [isLoading, setIsLoading] = useState(Boolean(fieldUuid));
//   const [fieldName, setFieldName] = useState(fieldUuid || ' ');

//   // Data Handlers
//   const handleDataLoad = (data: any) => {
//     setIsLoading(false);
//     setFieldName(data?.name || fieldUuid);
//   };

//   const handleDataError = (error: any) => {
//     //   // ignore - just means we won't have a name to display
//     setIsLoading(false);
//   };
//   //#endregion

//   return (
//     <>
//       {isLoading && fieldUuid && (
//         <DataCacheOrFetcher
//           apiHook={apiHook}
//           payload={filters}
//           queryKey={queryKey}
//           shouldSuppressToaster={true}
//           onDataLoad={handleDataLoad}
//           onError={handleDataError}
//         />
//       )}
//       <OverflowTypography
//         title={fieldName}
//         sxProps={{
//           textTransform: 'uppercase',
//         }}
//       />
//     </>
//   );
// }
// export default DashboardUuidNameField;
