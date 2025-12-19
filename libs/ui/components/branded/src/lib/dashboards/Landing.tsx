// /* eslint-disable no-prototype-builtins */
// /* eslint-disable react-hooks/exhaustive-deps */

// /* Images List View */
// import { useContext, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router';
// import { useDispatch, useSelector } from 'react-redux';

// import { brandedTheme } from '../styles/muiTheme';
// import { brandedThemeDark } from '../styles/muiThemeDark';

// /* MUI */
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';

// /* Icons */
// import AddIcon from '@mui/icons-material/Add';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import ExtensionIcon from '@mui/icons-material/Extension';
// import { useNavBar } from '../hooks/useNavBar';
// import { useNavigateAlias } from '../hooks/useNavigateAlias';
// import { LoadingUi } from '../indicators/Loading';
// import CrudModals from '../modals/CrudModals';
// import { BookmarksContext } from '../navigation/bookmark/BookmarksContext';
// import { inputFilterType, PaginationFiltersContextProvider } from '../navigation/paging/PaginationFiltersContext';
// import PaginationListView, { PaginationListViewProps } from '../navigation/paging/PaginationListView';
// import { RowAction } from '../types/actionRowTypes';
// import BulkDeleteButton from './BulkDeleteButton';
// import { iListItemType } from './constants';
// import ContentHeader from './ContentHeader';
// import { ButtonModalMinorUi } from '../inputs/buttons/buttonsmodal';
// import ActionRow from '../forms/selection/ActionRow';
// import { rowsPerPageDefault, rowsPerPageOptionsDefault } from '../forms/selection/constants';

// import { themeColor, setModal, setLoader } from '../redux/commonAppReducer';
// import { FormCrudType } from '../redux/utils/types';
// import { ButtonMainUi } from '../utility/buttons';

// /**
//  * Default actions for a row
//  * @constant
//  * @type {RowAction[]}
//  * @default
//  */
// const defaultRowActions: RowAction[] = [
//   {
//     tooltip: 'Edit',
//     icon: <EditIcon fontSize="medium" />,
//   },
//   {
//     tooltip: 'Delete',
//     icon: <DeleteIcon fontSize="medium" />,
//   },
// ];

// /**
//  * Default values which will be passed to PaginationListView if not overridden by paginationProps passed to Landing component
//  * @const {object} defaultPaginationProps
//  * @property {boolean} [allowRefresh = false] Display Refresh button
//  * @property {number} [rowsPerPage] Number of items to show on one page in the paginated list view
//  * @property {boolean} [sendTokenHeader=false] Whether to include token in payload
//  * @property {boolean} [shouldDisplayFilters=true] Whether or not to show/allow filtering
//  * @property {boolean} [shouldPoll=false] Whether to poll
//  */
// const defaultPaginationProps: Partial<PaginationListViewProps> = {
//   allowRefresh: false,
//   rowsPerPage: rowsPerPageDefault,
//   rowsPerPageOptions: rowsPerPageOptionsDefault,
//   sendTokenHeader: false,
//   shouldDisplayFilters: true,
//   shouldPoll: false,
// };

// /**
//  * @typedef {object} tLandingProps
//  * @property {Topic} [topicId] Topic of dashboard items (used for bulk delete)
//  * @property {string} [contentHeaderTitle] Title displayed in content header
//  * @property {*} [contentHeaderChildren] Children to display within content header
//  * @property {*} [contentSxProps] Sx props for the appContent div surround the landing (example maxHeight: '50%' if not taking the whole page)
//  * @property {JSX.Element} [createIcon] Icon to display on create button
//  * @property {string} [createTitle] Title to display in create form
//  * @property {string} [deleteModalId] Id for modal dialog that prompts user to delete
//  * @property {string} [deletePrompt] Message to display when prompting user to delete
//  * @property {string} [deleteTitle] Title to display when prompting user to delete
//  * @property {string[]} deleteModalButtonText Override button text in delete modal
//  * @property {boolean} [confirmNameOnDelete=false] Whether to force typing of item name on delete to confirm
//  * @property {string} featureName Feature name displayed in title
//  * @property {string} [instructions]  Instructions that appear above list view
//  * @property {string} [progressMessage] Message to display when something is being up/downloaded...
//  * @property {JSX.Element | undefined} [moreButton] Additional button nested in row that returns user to previous screen
//  * @property {number} navBarSelIndex Index of navigation button selected when this landing topic is visible
//  * @property {string} navId Route for navigating to the list of items
//  * @property {Partial<PaginationListViewProps>} paginationProps Props which are just passed through to PaginationListView
//  * @property {string} noneFound Message that appears if no items are returned from API
//  * @property {string} queryKey React query key passed to pagination component for polling
//  * @property {string} [showPaginationListTitle=false] Whether to show title in pagination component
//  * @property {(item: any, index?: number) => JSX.Element} [renderItem] Method used to override list item renderer
//  * @property {string} [returnToLabel='All Components'] Button label that appears on return button below the list view
//  * @property {number} rowActionEditButtonId Index of edit action in the row actions list or -1 for disabled
//  * @property {number} rowActionViewButtonId Index of view action in the row actions list or -1 for disabled
//  * @property {number} rowActionDeleteButtonId Index of delete action in the row actions list or -1 for disabled
//  * @property {string} [deleteHook] Hook for deleting a list item
//  * @property {object} [deletePayload] Payload for delete API request
//  * @property {string} returnToRoute Route for navigating to previous screen
//  * @property { RowAction[]} [rowActions=[
//   {
//     tooltip: 'Edit',
//     icon: <EditIcon fontSize="medium" />,
//   },
//   {
//     tooltip: 'Delete',
//     icon: <DeleteIcon fontSize="medium" />,
//   },
// ]] List of action buttons to enable in the list row
//  * @property {JSX.Element} [rowIcon] Icon to display before the name
//  * @property {*} [sortableColumns] Optional column(s) with filter information to allow sort 
//    example: {name: {inputFilter: defaultSortBy, filterValue: defaultSortByOptions[3] }, //name
//              author: { inputFilter: defaultSortBy, filterValue: defaultSortByOptions[0] }, // author
//              date: { inputFilter: defaultSortBy, filterValue: defaultSortByOptions[2] }, // dateEdited
//            }
//  * @property {((iconType: string | undefined) => JSX.Element | undefined)} [rowIconFnx] Fxn to return icon to display before the name
//  * @property {string} getListHook Hook for retrieving list items
//  * @property {object} [getListPayload] Payload for list API request
//  * @property {inputFilterType[]} [visibleFilters] Override for Interactable filters presented to the user
//  * @property {{[key: string]: string} => string[]} [getFilterTooltips] Optional Method to call for special page filters
//  * @property {(instance: iListItemType) => JSX.Element} [getRowChildren=undefined] Retrieves additional render items to inject into row
//  * @property {(instance: iListItemType) => JSX.Element} [getRowChildrenTitle=undefined] Retrieves column header for custom row children
//  * @property {boolean} [isPaginationListViewPerformant = true] Whether the pagination list view should use a performant list
//  * @property {*} [rightMenuChildren] Optional menu items to include to right of normal filters/refresh 
//  * @property {*} [rightAltTopMenuChildren] Optional menu items to put in AppHeader by breadcrumbs
//  */
// type tLandingProps = {
//   topicId?: Topic;
//   appendModalIdToPayload?: boolean;
//   confirmNameOnDelete?: boolean;
//   contentHeaderTitle?: string;
//   contentSxProps?: any;
//   createIcon?: JSX.Element;
//   createNavId?: string; //OBS
//   createTitle?: string;
//   dataIdField?: string;
//   defaultPageData?: any[];
//   deleteModalId?: string;
//   deletePrompt?: string;
//   deleteTitle?: string;
//   deleteModalButtonText?: string[];
//   featureName: string;
//   instructions?: string;
//   instructionsChildren?: JSX.Element;
//   progressMessage?: string;
//   moreButton?: JSX.Element | undefined;
//   navBarSelIndex: number;
//   navId: string;
//   noneFound: string;
//   paginationProps?: Partial<PaginationListViewProps>;
//   queryKey?: string;
//   showContentHeader?: boolean;
//   showPaginationListTitle?: boolean;
//   renderItem?: (item: any, index?: number) => JSX.Element;
//   returnToLabel?: string | null;
//   rightMenuChildren?: any;
//   rightAltTopMenuChildren?: any;
//   rowActionEditButtonId?: number;
//   rowActionViewButtonId?: number;
//   rowActionDeleteButtonId?: number;
//   rowIconFxn?: (
//     iconType: string | undefined,
//     sxProps?: any,
//   ) => JSX.Element | undefined;
//   deleteHook?: any;
//   deletePayload?: any;
//   returnToRoute: string;
//   rowActions?: RowAction[];
//   rowActionWidth?: string;
//   rowIcon?: JSX.Element;
//   sortableColumns?: any;
//   contentHeaderChildren?: any;
//   getListHook: any;
//   getListPayload?: any;
//   titleChildren?: JSX.Element;
//   visibleFilters?: inputFilterType[];
//   getFilterTooltips?: (currentFilters: { [key: string]: string }) => string[];
//   getRowChildren?: (instance: iListItemType) => JSX.Element;
//   getRowChildrenTitle?: (instance: iListItemType) => JSX.Element;
//   getRowActions?: (instance: iListItemType) => Array<RowAction>;
//   getRowStatusChildren?: (instance: iListItemType) => JSX.Element;
//   onActionClick?: (data: iListItemType, buttonId: number) => void;
//   isPaginationListViewPerformant?: boolean;
// };

// /**
//  * Landing Component for List Views
//  * Renders a listview using PaginationListView component
//  * Handles list item Create, Edit, and Delete
//  * Handles form navigation
//  * @type {tLandingProps}
//  * @returns {React.ReactElement} List view with options to create, edit, and delete list items
//  */
// export function Landing<ListItemType extends iListItemType>(
//   props: tLandingProps,
// ) {
//   const {
//     topicId,
//     appendModalIdToPayload = false,
//     createIcon = <AddIcon />,
//     createNavId = 'create',
//     createTitle,
//     confirmNameOnDelete = false,
//     dataIdField = 'uuid',
//     defaultPageData,
//     deleteModalId,
//     deletePrompt,
//     deleteTitle = 'Delete Item',
//     deleteModalButtonText,
//     featureName,
//     getRowActions,
//     instructions = '',
//     instructionsChildren,
//     progressMessage,
//     moreButton,
//     navBarSelIndex,
//     navId,
//     noneFound,
//     paginationProps = {},
//     queryKey = '',
//     showPaginationListTitle = false,
//     showContentHeader = true,
//     renderItem,
//     returnToLabel = 'All Components',
//     rightMenuChildren,
//     rightAltTopMenuChildren,
//     rowActionEditButtonId = -1,
//     rowActionViewButtonId = -1,
//     rowActionDeleteButtonId = -1,
//     rowActionWidth,
//     rowIconFxn,
//     titleChildren,
//     contentHeaderChildren,
//     getListHook,
//     getListPayload,
//     visibleFilters,
//     deleteHook,
//     deletePayload,
//     returnToRoute,
//     rowActions = defaultRowActions,
//     getFilterTooltips,
//     getRowChildren,
//     getRowChildrenTitle,
//     getRowStatusChildren,
//     rowIcon,
//     sortableColumns,
//     contentHeaderTitle = featureName,
//     contentSxProps = {},
//     onActionClick,
//     isPaginationListViewPerformant = true,
//   } = props;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const navigateAlias = useNavigateAlias();
//   const theme = useSelector(themeColor);
//   const iconColor =
//     theme === 'dark'
//       ? brandedThemeDark.palette['primary'].main
//       : brandedTheme.palette['primary'].main;
//   const { clearAllBookmarks } = useContext(BookmarksContext);

//   /**
//    * Get render elements for row children
//    * @param {iListItemType} instance The list item data
//    * @return {JSX.Element} The render element
//    */
//   const handleGetRowChildren = (instance: iListItemType): JSX.Element => {
//     if (!getRowChildren) {
//       return <></>;
//     }
//     return getRowChildren(instance);
//   };

//   const handleGetRowChildrenTitle = (instance: iListItemType): JSX.Element => {
//     if (!getRowChildrenTitle) {
//       return <></>;
//     }
//     return getRowChildrenTitle(instance);
//   };

//   const handleGetRowStatusChildren = (
//     instance: iListItemType,
//   ): JSX.Element | null => {
//     if (!getRowStatusChildren) {
//       return null;
//     }
//     return getRowStatusChildren(instance);
//   };

//   /**
//    * Navigate to create form
//    * @param {iListItemType} instance The list item data
//    */
//   const handleCreateSelect = () => {
//     navigate(`${location.pathname}/${createNavId}`);
//   };

//   /**
//    * Navigate to previous view
//    * @param {iListItemType} instance The list item data
//    */
//   const handleReturn = () => {
//     navigate(returnToRoute);
//   };

//   /**
//    * Handle action button click
//    * @param {iListItemType} data The list item data
//    * @param {number} buttonId The action index
//    */
//   const handleActionClick = (data: iListItemType, buttonId: number) => {
//     switch (buttonId) {
//       case rowActionEditButtonId:
//         navigateAlias(
//           `${location.pathname}/${data.uuid || data.auId}`,
//           data.uuid || data.auId,
//           data.name,
//           FormCrudType.edit,
//         );
//         break;
//       case rowActionViewButtonId:
//         navigateAlias(
//           `${location.pathname}/${data.uuid || data.auId}`,
//           data.uuid || data.auId,
//           data.name,
//           FormCrudType.view,
//         );
//         break;
//       case rowActionDeleteButtonId:
//         if (deleteModalId) {
//           dispatch(
//             setModal({
//               type: deleteModalId,
//               id: data.uuid || data.auId || '',
//               name: data.name || '',
//               meta: { author: data.author || '' },
//             }),
//           );
//         }
//         break;
//       default:
//         if (onActionClick) {
//           onActionClick(data, buttonId);
//         }
//         break;
//     }
//   };

//   /**
//    * Returns custom icon based on row data
//    * If we need to look up icon based on different properties in the future, we can add property as a param
//    * @param {any} data Row data containing iconType
//    * @return {JSX.Element} Mui Icon
//    */
//   const getIconType = (data: any) => {
//     if (rowIconFxn) {
//       return rowIconFxn(data?.iconType, { color: iconColor, fontSize: '24px' });
//     }
//     return <ExtensionIcon />;
//   };

//   useNavBar(navBarSelIndex);

//   /** @constant
//    * Default list item render
//    *  @type {JSX.Element}
//    */
//   const defaultItem = (instance: iListItemType, index?: number) => (
//     <ActionRow
//       data={instance}
//       dataIdField={dataIdField}
//       isTitleDisplay={index === -1}
//       minActionWidth={rowActionWidth || undefined}
//       rowActions={getRowActions ? getRowActions(instance) : rowActions}
//       rowIcon={rowIcon || getIconType(instance)}
//       sortableColumns={sortableColumns}
//       rowChildren={handleGetRowChildren(instance)}
//       rowChildrenTitle={handleGetRowChildrenTitle(instance)}
//       rowStatusChildren={handleGetRowStatusChildren(instance)}
//       onActionSelect={(buttonIndex: number) => {
//         handleActionClick(instance, buttonIndex);
//       }}
//       /*FIX ensure expanding rows dont do this */
//       onRowSelect={(data?: any) => {
//         if (rowActionEditButtonId >= 0) {
//           // launch edit form for editable item
//           handleActionClick(data, rowActionEditButtonId);
//         } else if (rowActionViewButtonId >= 0) {
//           // launch view form for view only items (example: currently Range Specification)
//           handleActionClick(data, rowActionViewButtonId);
//         }
//       }}
//     />
//   );

//   /**
//    * Get uuid or placeholder uuid
//    * @param instance
//    * @returns
//    */
//   const getDataIdFieldValue = (instance: { [key: string]: any }) => {
//     if (Object.prototype.hasOwnProperty.call(instance, dataIdField)) {
//       return instance[dataIdField] as string;
//     }
//     return '';
//   };

//   /**
//    * Returns a styled list render item, either the default or an override
//    * @param {iListItemType} instance Row Data
//    * @param {number} [index] row index
//    * @return {JSX.Element} Render elements
//    */
//   const styledItem = (instance: ListItemType, index?: number) => {
//     // don't display row if name / uuid OR alternate data id field are missing
//     if (instance.name || instance.uuid || getDataIdFieldValue(instance)) {
//       return renderItem
//         ? renderItem(instance, index)
//         : defaultItem(instance, index);
//     }

//     return (
//       // empty "element" so nothing will display
//       <></>
//     );
//   };

//   /**
//    * Use Effect clears all bookmark data when landing mounts,
//    * also moves rightAltTopMenuChildren to AppHeader on mount and removes it when unmounting
//    */
//   useEffect(() => {
//     clearAllBookmarks();
//     if (rightAltTopMenuChildren) {
//       const moveElement = document.getElementById('rightTopMenuItems');
//       const destinationDiv = document.getElementById('breadcrumb-right');
//       if (destinationDiv && moveElement) {
//         destinationDiv.appendChild(moveElement);
//       }
//     }
//     return () => {
//       if (rightAltTopMenuChildren) {
//         const moveElement = document.getElementById('rightTopMenuItems');
//         const destinationDiv = document.getElementById('rightMenuItemsHolder');
//         // checking for "firstChild" here because of a timing issue
//         // - "new" landing may already be mounting which has it's rightTopMenuItems (while old is still unmounting)
//         if (moveElement && destinationDiv && !destinationDiv.firstChild) {
//           destinationDiv.appendChild(moveElement);
//         }
//         const breadcrumbViewingDiv =
//           document.getElementById('breadcrumb-right');
//         if (breadcrumbViewingDiv && breadcrumbViewingDiv.firstChild) {
//           breadcrumbViewingDiv?.removeChild(breadcrumbViewingDiv.firstChild);
//         }
//       }
//     };
//   }, []);

//   /**
//    * Needed to update list after defaultPageData updates
//    */
//   useEffect(() => {
//     //console.log('list data changed', defaultPageData);
//   }, [defaultPageData, defaultPageData?.length]);

//   return (
//     <div id="app-content" style={contentSxProps}>
//       {rightAltTopMenuChildren && (
//         <div id="rightMenuItemsHolder">
//           <div id="rightTopMenuItems">{rightAltTopMenuChildren}</div>
//         </div>
//       )}
//       {deleteModalId && (
//         <CrudModals
//           apiHook={deleteHook}
//           appendModalIdToPayload={appendModalIdToPayload}
//           confirmNameOnDelete={confirmNameOnDelete}
//           hookPayload={deletePayload}
//           modalButtonText={deleteModalButtonText}
//           promptModalId={deleteModalId}
//           promptMessage={
//             deletePrompt || 'Are you sure you want to delete this item?'
//           }
//           promptTitle={deleteTitle || 'Delete Item'}
//           testId={deleteModalId || 'delete'}
//         />
//       )}
//       {showContentHeader && (
//         <ContentHeader title={contentHeaderTitle}>
//           {contentHeaderChildren}
//         </ContentHeader>
//       )}
//       <Box className={'contentBox'} id="content">
//         {instructionsChildren && instructionsChildren}
//         {instructions && (
//           <Typography
//             id="instructions"
//             sx={{
//               color: (theme: any) => `${theme.card.instructionsColor}`,
//               padding: '8px',
//             }}
//           >
//             {instructions}
//           </Typography>
//         )}
//         {progressMessage && (
//           <Box>
//             <LoadingUi message={progressMessage} />
//           </Box>
//         )}
//         <PaginationFiltersContextProvider
//           filterSxProps={{
//             position: 'absolute', //this allows filters to toggle without rearranging layout below
//             marginTop: '-48px', //this height dependent upon the vertical space between bottom of app header and top line of ListView
//             zIndex: 9998,
//           }}
//           hiddenFilters={getListPayload}
//           visibleFilters={visibleFilters}
//           getFilterTooltips={getFilterTooltips}
//           testId={navId}
//         >
//           <PaginationListView
//             isPerformant={isPaginationListViewPerformant}
//             apiHook={getListHook}
//             defaultPageData={defaultPageData}
//             testId={queryKey || navId}
//             title={`${showPaginationListTitle ? featureName : ''}`}
//             noDataFoundMsg={noneFound}
//             //REF paginationLabel={`${featureName}:`}
//             pollingQueryKey={queryKey}
//             loaderFunction={(isLoading) => {
//               dispatch(setLoader(isLoading));
//             }}
//             {...defaultPaginationProps}
//             renderItem={styledItem}
//             rightMenuChildren={
//               <>
//                 {rightMenuChildren}
//                 <BulkDeleteButton topicId={topicId} />
//               </>
//             }
//             titleChildren={
//               //test for createNavId requires empty react element to wrap
//               // eslint-disable-next-line react/jsx-no-useless-fragment
//               <>
//                 {createTitle && (
//                   <ButtonMainUi
//                     //marginBottom: '4px' to align with filters
//                     sxProps={{ marginLeft: '4px', marginBottom: '4px' }}
//                     startIcon={createIcon}
//                     onClick={handleCreateSelect}
//                   >
//                     {createTitle}
//                   </ButtonMainUi>
//                 )}
//                 {titleChildren}
//               </>
//             }
//             {...paginationProps}
//           />
//         </PaginationFiltersContextProvider>
//         {
//           <Box className={'footer-nav'} id="footer_nav">
//             {returnToLabel && (
//               <ButtonModalMinorUi
//                 startIcon={<ArrowBackIosIcon />}
//                 onClick={handleReturn}
//               >
//                 {returnToLabel}
//               </ButtonModalMinorUi>
//             )}
//             {moreButton && moreButton}
//           </Box>
//         }
//       </Box>
//     </div>
//   );
// }
// export default Landing;
