/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
/* eslint-disable react/jsx-no-useless-fragment */
import { useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setLoader,
  modal,
  setModal,
  setMessage,
  FormCrudType,
} from '@rangeos-nx/ui/redux';
import { useLocation, useNavigate } from 'react-router';

/* Shared */
import { ActionRow } from './ActionRow';
import {
  useClearCacheSelection,
  useGetCacheSelection,
  useSetCacheSelection,
} from '@rangeos-nx/ui/redux';

/* Types */
import { RowAction } from '../../types/actionRowTypes';

/* MUI */
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

/* Icons */
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

/* Constants */
import {
  useCache,
  ButtonMinorUi,
  ButtonLoadingUi,
} from '@rangeos-nx/ui/api/hooks';
import { ButtonModalCancelUi } from '../../inputs/buttons/buttonsmodal';
import ModalDialog from '../../modals/ModalDialog';
import { BookmarksContext } from '../../navigation/bookmark/BookmarksContext';
import {
  tBookmark,
  bookmarkCue,
} from '../../navigation/bookmark/bookmarksReducer';
import {
  inputFilterType,
  PaginationFiltersContextProvider,
} from '../../navigation/paging/PaginationFiltersContext';
import PaginationListView from '../../navigation/paging/PaginationListView';
import { rowsPerPageDefault, addBookmarkButtonId } from './constants';
import { sxSelectButtonprops } from './MultipleSelectWrapper';
const dialogButtons = ['Cancel', 'Apply'];
const selectButtonId = -1;

/**
 * @typedef {*} tSelectWrapperProps
 * @property {*} apiHook Hook used to get selection list
 * @property {*} [filters] Payload Filters
 * @property {(instance: any) => JSX.Element} [getRowChildren]
 * @property {string} [instructions]
 * @property {string} [isModal=true] Whether selections should be presented on a modal dialog
 * @property {boolean} [isTopicEditable=true] Whether to allow user to edit row item
 * @property {JSX.Element} [menu] Menu that appears in upper right corner
 * @property {string} modalId Selection modal id
 * @property {string} [noDataFoundMsg] Message to display
 * @property {string[]} [nonModalButtonText] Buttons to show on nonModal view
 * @property {string} [pageLabel] Page Label
 * @property {string} [queryKey] Query key used to resolve selected uuid to name
 * @property {string} [renderItem] Render Item
 * @property {string} [rowsPerPage] Rows Per Page
 * @property {*} [sortableColumns] Optional column(s) with filter information to allow sort
 *   example: see actionRowSortableColumns in ActionRow
 * @property {string} [styleProps] Style props passed to pagination component
 * @property {string} [testId] Test id
 * @property {string} [topicId] Topic used to pop modal views of list items
 * @property {(selection: any) => void} [title]
 * @property {inputFilterType[]} [visibleFilters] Override for Interactable filters presented to the user
 * @property {(selection: any) => void} [onApplySelection]
 * @property {(selection: any) => void} [onChangeSelection]
 * @property {(buttonIndex: number) => void} [onHandleAction]
 * @property {(buttonIndex: number,selection: any) => void} [onHandleNonModalAction]
 */
type tSelectWrapperProps = {
  allowCreateNew?: boolean;
  apiHook: any;
  dataIdField?: string;
  defaultPageData?: any[];
  filters?: any;
  getRowChildren?: (instance: any) => JSX.Element;
  instructions?: string;
  isModal?: boolean;
  isTopicEditable?: boolean;
  menu?: JSX.Element;
  noDataFoundMsg?: string;
  // nonModalButtonText?: string[];
  // onHandleNonModalAction?: (buttonIndex: number, selection: any) => void;
  pageLabel?: string;
  queryKey?: string;
  renderItem?: any;
  route?: string;
  rowsPerPage?: number;
  sortableColumns?: any;
  styleProps?: any;
  testId?: string;
  title?: string;
  topicId?: string;
  visibleFilters?: inputFilterType[];
  primaryButtonText?: string;
  onApplySelection?: (selection: any) => void;
  onChangeSelection?: (selection: any) => void;
  onHandleAction?: (buttonIndex: number) => void;
  nonModalProps?: {
    nonModalButtonText: string[];
    onHandleNonModalAction: (buttonIndex: number, selection: any) => void;
  };
};

/**
 * Displays List View for Selecting an Item
 * @param {tSelectWrapperProps} props
 * @return {JSX.Element} React Component
 */
export function SelectWrapper(props: tSelectWrapperProps) {
  const navigate = useNavigate();

  const {
    allowCreateNew = true,
    dataIdField = 'uuid',
    defaultPageData,
    topicId = '',
    apiHook,
    filters = {},
    getRowChildren,
    instructions = 'Click an item in the list to select it. Click APPLY when you are done.',
    isModal = true,
    isTopicEditable = true,
    menu,
    noDataFoundMsg = 'No items found',
    // nonModalButtonText,
    // onHandleNonModalAction,
    nonModalProps,
    pageLabel = '',
    queryKey,
    renderItem = ActionRow,
    route,
    rowsPerPage = rowsPerPageDefault,
    sortableColumns,
    styleProps = { formWidth: '100%' },
    testId = 'select-' + topicId,
    title = 'Select Items',
    visibleFilters,
    onApplySelection,
    onChangeSelection,
    onHandleAction,
  } = props;

  //modal
  const selectModalId = `select-${topicId.toLowerCase()}`;

  const createRoute = route ? route + '/create' : undefined;
  const editRoute = route;

  /**
   * Get render elements for row children
   * @param {iListItemType} instance The list item data
   * @return {JSX.Element} The render element
   */
  const handleGetRowChildren = (instance: any): JSX.Element => {
    if (!getRowChildren) {
      return <></>;
    }
    return getRowChildren(instance);
  };

  const StyledRow: any = renderItem;
  const dispatch = useDispatch();
  const location = useLocation();
  const modalObj = useSelector(modal);
  const bookmarkData: tBookmark[] = useSelector(bookmarkCue);
  const setSelectionCache = useSetCacheSelection();
  const getSelectionCache = useGetCacheSelection();
  const clearSelectionCaches = useClearCacheSelection();
  const cache = getSelectionCache(selectModalId);
  const queryCache = useCache();
  const [currentSelection, setCurrentSelection] = useState<any>(null);
  const [currentName, setCurrentName] = useState('');
  const [pageData, setPageData] = useState<any[]>([]);
  const rowActions: RowAction[] = isTopicEditable
    ? [
        {
          tooltip: 'Edit',
          icon: <EditIcon fontSize="medium" />,
          hidden: !editRoute,
        },
      ]
    : [];

  const isOpen = modalObj.topic === topicId;

  const {
    addModalToBookmark,
    clearCreatedFromBookmark,
    clearModalFromBookmark,
    getLastBookMarkRecordId,
    restoreModal,
  } = useContext(BookmarksContext);

  const [excludeId, setExcludeId] = useState(getLastBookMarkRecordId());
  /**
   * Handles action button click
   * If apply clicked (1) apply local state to redux state
   * @param {number} buttonIndex Button Index
   */
  const handleAction = async (buttonIndex: number) => {
    switch (buttonIndex) {
      case 1:
        if (currentSelection) {
          setSelectionCache(
            selectModalId,
            currentSelection[dataIdField],
            currentSelection,
            modalObj.meta,
          );
        } else {
          clearSelectionCaches([selectModalId]);
        }

        if (onApplySelection) {
          onApplySelection(currentSelection);
        }
        dispatch(
          setMessage({
            type: selectModalId,
            message: 'apply',
            meta: modalObj.meta,
          }),
        );

        break;
      default:
        break;
    }

    //clear modal & newly created object from bookmark before closing dialog
    clearCreatedFromBookmark();
    clearModalFromBookmark();

    const foundModal = restoreModal();
    if (!foundModal) {
      dispatch(setModal({ type: '', id: null, name: null }));
    }

    if (onHandleAction) {
      onHandleAction(buttonIndex);
    }
  };

  const handleNonModalAction = async (button: number) => {
    if (nonModalProps?.onHandleNonModalAction) {
      nonModalProps.onHandleNonModalAction(button, currentSelection);
    }
  };

  const handleDeleteSelection = (chipToDelete: any) => {
    setCurrentSelection(null);
  };

  const handleRowClick = (data: any, buttonId: number) => {
    switch (buttonId) {
      case selectButtonId:
        setCurrentSelection(data);
        break;
      case 0: //edit action button
        //Persist selection modal in bookmarks
        addModalToBookmark({ ...modalObj });

        if (editRoute) {
          navigate(editRoute + data.uuid);
        }

        break;
      case addBookmarkButtonId:
        //Persist selection modal in bookmarks
        addModalToBookmark({ ...modalObj });
        break;
    }
  };

  const handleChildRowClick = (data: any, buttonId: number) => {
    switch (buttonId) {
      case 0:
        setCurrentSelection(data);
        break;
    }
  };

  const handleResolveCurrentName = () => {
    if (!currentSelection) {
      setCurrentName('');
      return;
    }

    let itemName = currentSelection?.name
      ? currentSelection?.name
      : currentSelection[dataIdField];

    if (itemName === 'Unknown Name') {
      //Look Up Name From Page Data

      const selIndex = pageData
        ? pageData.findIndex(
            (obj: any) => obj[dataIdField] === currentSelection[dataIdField],
          )
        : -1;

      if (selIndex >= 0) {
        itemName = pageData[selIndex].name || pageData[selIndex][dataIdField];
      } else {
        //Look Up Name From React Query If It Isn't Already Resolved
        if (queryKey) {
          const cacheData: any = queryCache.getIdFromArray(
            queryKey,
            currentSelection[dataIdField],
            dataIdField,
          );
          if (cacheData) {
            itemName = cacheData?.name;
          }
        } else {
          console.warn('No query key found for looking up name');
        }
      }
    }
    setCurrentName(itemName);
  };

  /**
   * Transfers cache into local selection state
   * Applies newly created objects in bookmarks system to current selection
   */
  const handleCacheUpdated = () => {
    // we have to re-feed selection with recently created objects from bookmarks
    if (bookmarkData && bookmarkData?.length >= 1) {
      const bookmarkCreated =
        bookmarkData[bookmarkData.length - 1].meta?.created;
      if (bookmarkCreated) {
        setCurrentSelection(bookmarkCreated);
        return; //only one selection so return after applying newly created
      }
    }

    if (cache) {
      if (cache?.meta) {
        setCurrentSelection(cache?.meta);
      } else {
        setCurrentSelection({ uuid: cache.id, name: cache.id });
      }
    } else {
      setCurrentSelection(null);
    }
  };

  //Set selection on change
  useEffect(() => {
    handleCacheUpdated();
  }, [cache]);

  useEffect(() => {
    handleResolveCurrentName();
    if (onChangeSelection) {
      onChangeSelection(currentSelection);
    }
  }, [currentSelection]);

  useEffect(() => {
    //REF name change here
    //this may be required in order for name to appear correctly after changing selections using DynamicSelector
    //do not remove without testing!
  }, [currentName]);

  /**
   * Use Effect resolves unknown names when page data loads
   */
  useEffect(() => {
    handleResolveCurrentName();
  }, [pageData]);

  /**
   * Callback triggered when current page data loads
   *  @param {any[]} data Page data
   * @param {number} totalCount Total number of records, regardless of paging
   */
  const onPageData = (data: any[], totalCount: number) => {
    setPageData(data);
  };

  // height so that chip area doesn't jump when first item is selected
  const noneSelectedLabelHeight = '30px';

  const minViewHeight = '320px';
  const viewWidth = '820px';
  const noMenuExtraPageHeight = 312;
  const withMenuExtraPageHeight = 347;
  const verticalPageExtraHeight = menu
    ? withMenuExtraPageHeight
    : noMenuExtraPageHeight;
  // Dialog margins (top+bottom) @64 + content padding @20 + footer @70 + header @60 + other padding @8 + selected or none alert/instr @90 = 312
  // if there's a "menu" need to subtract 35 more = 347

  const selectListExtraHeight = verticalPageExtraHeight + 40;
  //  pageListExtraHeight + (pagination padding @8 /steps @32 + filters (handled inside paginationList)= 40)

  // don't display filter label if only showing range/scenario ids (example: for deployed GhostMachines - publish traffic profile)
  const showFilterLabel =
    Object.keys(filters).length > 0 &&
    !(
      Object.keys(filters).length === 1 &&
      Object.prototype.hasOwnProperty.call(filters, 'rangeId')
    ) &&
    !(
      Object.keys(filters).length === 2 &&
      Object.prototype.hasOwnProperty.call(filters, 'rangeId') &&
      Object.prototype.hasOwnProperty.call(filters, 'scenarioId')
    );
  const view = (
    <div
      style={{
        width: isModal ? viewWidth : '100%',
        minHeight: isModal ? minViewHeight : undefined,
      }}
    >
      <>
        {pageData?.length > 0 && (
          <Alert
            sx={{ borderColor: '#7DC581', borderWidth: '2px', width: '100%' }}
            severity="success"
          >
            <AlertTitle>Selected</AlertTitle>
            {currentName ? (
              <Chip
                data-testid="selected-item"
                label={currentName}
                variant="outlined"
                onDelete={handleDeleteSelection}
              />
            ) : (
              <Typography
                id="none"
                variant="body2"
                sx={{ height: noneSelectedLabelHeight }}
              >
                None Selected. {instructions}
              </Typography>
            )}
          </Alert>
        )}
      </>
      {showFilterLabel && Object.keys(filters).length > 0 && (
        <Typography id="filters" sx={{ color: 'text.hint' }}>
          Filters:{JSON.stringify(filters)}
        </Typography>
      )}
      {menu}
      <PaginationFiltersContextProvider
        testId={testId}
        visibleFilters={visibleFilters}
      >
        <PaginationListView
          apiHook={apiHook}
          defaultPageData={defaultPageData}
          listViewProps={{
            shouldShowColumnHeaders: true,
          }}
          filters={filters}
          testId={testId}
          noDataFoundMsg={noDataFoundMsg}
          //REF paginationLabel={pageLabel}
          rowsPerPage={rowsPerPage}
          shouldDisplayFilters={true}
          styleProps={{
            marginTop: '8px',
            verticalPageExtraHeight: verticalPageExtraHeight,
            verticalListViewExtraHeight: selectListExtraHeight,
          }}
          loaderFunction={(isLoading) => {
            dispatch(setLoader(isLoading));
          }}
          onPageData={onPageData}
          renderItem={(data: any, index?: number) => {
            // currently only for ansible playbooks selecting parent
            if (excludeId && excludeId === data.uuid) {
              return <div style={{ height: '.1px' }} />; // skip excluded id -- height non-zero so perfornamt list doesn't reset it
            }
            return (
              <StyledRow
                currentSelection={
                  currentSelection ? currentSelection[dataIdField] : null
                }
                data={data}
                dataIdField={dataIdField}
                isSelected={
                  currentSelection
                    ? currentSelection[dataIdField] === data[dataIdField]
                    : null
                }
                isTitleDisplay={index === -1}
                rowChildren={handleGetRowChildren(data)}
                rowTitle={data.name || undefined}
                rowAuthor={data.author}
                rowDate={data.dateEdited}
                rowActions={rowActions}
                showSelectedStyles={true}
                showSingleSelectedStyles={true}
                sortableColumns={sortableColumns}
                onActionSelect={(buttonIndex: number) =>
                  handleRowClick(data, buttonIndex)
                }
                onChildActionSelect={(childData: any, buttonIndex: number) =>
                  handleChildRowClick(childData, buttonIndex)
                }
                onRowSelect={(data?: any) =>
                  handleRowClick(data, selectButtonId)
                }
              />
            );
          }}
          title=""
          titleChildren={
            <>
              {createRoute && allowCreateNew && (
                <ButtonMinorUi
                  id="create"
                  size="small"
                  startIcon={<AddIcon />}
                  disabled={location.pathname.includes(createRoute)}
                  onClick={() => {
                    //Persist selection modal in bookmarks
                    addModalToBookmark({ ...modalObj });

                 
                      if (createRoute) {
                        navigate(createRoute);
                      }
                    }
                  }
                  sxProps={{
                    ...sxSelectButtonprops,
                    marginLeft: '12px',
                    marginBottom: '8px',
                  }}
                >
                  Create New
                </ButtonMinorUi>
              )}
            </>
          }
        />
      </PaginationFiltersContextProvider>
    </div>
  );

  return (
    <div
      data-testid="selections"
      style={{
        width: styleProps?.formWidth ?? '100%',
      }}
    >
      {isModal ? (
        <ModalDialog
          buttons={dialogButtons}
          dialogProps={{ fullWidth: true, open: isOpen }}
          sxProps={{ margin: '0px 24px' }}
          maxWidth="md"
          testId={testId}
          title={title}
          alertMessage=""
          alertTitle=""
          handleAction={handleAction}
        >
          {view}
        </ModalDialog>
      ) : (
        <>
          {view}
          {nonModalProps?.nonModalButtonText &&
            nonModalProps.nonModalButtonText.length > 0 && (
              <Box
                key="actions"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  float: 'right',
                }}
              >
                {nonModalProps.nonModalButtonText?.map(
                  (button: string, index: number) => {
                    if (index === nonModalProps.nonModalButtonText.length - 1) {
                      return (
                        <ButtonLoadingUi
                          key={'button_' + index}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleNonModalAction(index);
                          }}
                          disabled={
                            !(
                              currentSelection?.uuid &&
                              currentSelection.uuid !== ''
                            )
                          }
                          loading={false} // isLoading
                          type="button"
                        >
                          {button}
                        </ButtonLoadingUi>
                      );
                    }

                    return (
                      <ButtonModalCancelUi
                        key={`button_${index}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleNonModalAction(index);
                        }}
                      >
                        {button}
                      </ButtonModalCancelUi>
                    );
                  },
                )}
              </Box>
            )}
        </>
      )}
    </div>
  );
}
