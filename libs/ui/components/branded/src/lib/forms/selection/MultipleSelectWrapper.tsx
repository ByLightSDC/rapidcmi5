/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import {
  CommonAppSelectionState,
  setLoader,
  modal,
  setModal,
  setMessage,
  useGetCacheMultipleSelection,
  useSetCacheMultipleSelection,
  FormCrudType,
} from '@rapid-cmi5/ui/redux';

import { ButtonMinorUi, Topic, useCache } from '@rapid-cmi5/ui/api/hooks';

/* MUI */
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

/* Icons */
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

/* Constants */
import { addBookmarkButtonId, rowsPerPageDefault } from './constants';
import { listStyles } from '../../data-display/ListView';
import ModalDialog from '../../modals/ModalDialog';
import { BookmarksContext } from '../../navigation/bookmark/BookmarksContext';
import {
  inputFilterType,
  PaginationFiltersContextProvider,
} from '../../navigation/paging/PaginationFiltersContext';
import PaginationListView from '../../navigation/paging/PaginationListView';
import { RowAction } from '../../types/actionRowTypes';
import ActionRow from './ActionRow';

const featureFlagMultipleSelectShift = true;

const dialogButtons = ['Cancel', 'Apply'];

const selectButtonId = -1;

/**
 * @typedef {*} tMultipleSelectWrapperProps
 * @property {*} [apiHook] Hook used to get selection list
 * @property {string} [chipField='name'] Data field to display as selected chip chipDisplayAliasProp
 * @property {string} [route] Base route to record landing
 * @property {string} [dataIdField='uuid'] Data field to use as identifier for selection
 * @property {*} [filters] Hook filters
 * @property {(instance: any) => JSX.Element} [getRowChildren] Extra column to insert in row render
 * @property {string} [instructions]
 * @property {string} [isModal=false]
 * @property {any[]} [listItems] List of items to display (rather than using api hook)
 * @property {number} [maxNumSelected] Limits number of items that can be selected
 * @property {JSX.Element} [menu] Menu that appears in upper right corner
 * @property {string} modalId Selection modal id
 * @property {string[]} modalButtonText Text for modal buttons
 * @property {string} [modalIdPrefix=multiselect] Override prefix for modal ID
 * @property {boolean} [disableOnEmptySelection = false] Whether to disable the "Apply" button if none selected
 * @property {string} [noDataFoundMsg] Message to display
 * @property {string} [pageLabel] Page Label
 * @property {string} [queryKey] Key used to resolve uuids to names, especially for nested data
 * @property {string} [renderItem] Custom render item for row
 * @property {string} [rowsPerPage] Rows Per Page
 * @property {string} [snapToFit] Not sure what this is
 * @property {*} [sortableColumns] Optional column(s) with filter information to allow sort
 *   example: see actionRowSortableColumns in ActionRow
 * @property {string} [styleProps] Style props passed to pagination component
 * @property {string} [testId] Test id
 * @property {string} [title='Select Items'] Dialog title
 * @property {string} [topicId] Topic used to pop modal views of list items
 * @property {inputFilterType[]} [visibleFilters] Override for Interactable filters presented to the user
 * @property {(selection: any) => void} [onApplySelection]
 * @property {(selection: any) => void} [onChangeSelection] REF NOT IMPLEMENTED
 * @property {(buttonIndex: number) => void} [onHandleAction] REF NOT IMPLEMENTED
 */
type tMultipleSelectWrapperProps = {
  allowCreateNew?: boolean;
  apiHook?: any;
  chipField?: string;
  dataIdField?: string;
  getRowChildren?: (instance: any) => JSX.Element;
  modalButtonText?: string[];
  modalIdPrefix?: string;
  disableOnEmptySelection?: boolean;
  filters?: any;
  instructions?: string;
  isModal?: boolean;
  isTopicEditable?: boolean;
  defaultPageData?: any[];
  maxNumSelected?: number;
  message?: string;
  menu?: JSX.Element;
  noDataFoundMsg?: string;
  pageLabel?: string;
  queryKey?: string;
  renderItem?: any;
  route?: string;
  rowsPerPage?: number;
  snapToFit?: boolean;
  sortableColumns?: any;
  styleProps?: any;
  testId?: string;
  title?: string;
  rowTitleFormat?: string;
  topicId?: string;
  visibleFilters?: inputFilterType[];
  onApplySelection?: (selection: any) => void;
};

/**
 * Condensed button style for Selection Modals
 */
export const sxSelectButtonprops = {
  height: '28px',
  borderRadius: '10px',
  minHeight: '0px',
};

/**
 * Displays List View for Selecting Multiple Items
 * @param {tMultipleSelectWrapperProps} props
 * @return {JSX.Element} React Component
 */
export function MultipleSelectWrapper(props: tMultipleSelectWrapperProps) {
  const {
    allowCreateNew,
    topicId = '',
    apiHook,
    chipField = 'name', //alias property
    dataIdField = 'uuid',
    filters = {},
    getRowChildren,
    instructions = 'Click one or more items in the list to add them to your selection. Click APPLY when you are done.',
    isModal = true,
    isTopicEditable = true,
    defaultPageData,
    maxNumSelected = -1, //no max
    menu,
    modalButtonText = dialogButtons,
    modalIdPrefix = 'multiselect',
    disableOnEmptySelection = false,
    noDataFoundMsg = 'No items found',
    pageLabel = '',
    queryKey,
    renderItem = ActionRow,
    route,
    rowsPerPage = rowsPerPageDefault,
    snapToFit = true,
    sortableColumns,
    styleProps = { formWidth: '100%' },
    testId = modalIdPrefix + '-' + topicId,
    title = 'Select Items',
    rowTitleFormat = '',
    visibleFilters,
    onApplySelection,
  } = props;

  //modal
  const selectModalId = `${modalIdPrefix}-${topicId.toLowerCase()}`;

  /**
   * Get render elements for row children
   * @param {any} instance The list item data
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
  const navigate = useNavigate();
  const modalObj = useSelector(modal);
  const queryCache = useCache();
  const setMultiSelectionCache = useSetCacheMultipleSelection();
  const getMultiSelectionCache = useGetCacheMultipleSelection();
  const cache = getMultiSelectionCache(selectModalId);
  const [pageData, setPageData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isMaxLimit, setIsMaxLimit] = useState(false);
  const [shouldResolveNames, setShouldResolveNames] = useState(true);
  const rowActions: RowAction[] = isTopicEditable
    ? [
        {
          tooltip: 'Edit',
          icon: <EditIcon fontSize="medium" />,
          hidden: !route,
        },
      ]
    : [];
  const [renderFlag, setRenderFlag] = useState(true);
  const selection = useRef<any[]>([]);
  const {
    bookmarks,
    addModalToBookmark,
    clearCreatedFromBookmark,
    clearModalFromBookmark,
    getLastBookMarkRecordId,
    restoreModal,
  } = useContext(BookmarksContext);

  const [excludeId, setExcludeId] = useState(getLastBookMarkRecordId());

  /**
   * Transfers cache into local selection state
   * Applies newly created objects in bookmarks system to current selection
   */
  const handleCacheUpdated = () => {
    let cacheArr: any[] = [];
    if (cache && cache.selections.length > 0) {
      cacheArr = [...cache.selections];
    }

    if (bookmarks && bookmarks?.length >= 1) {
      const bookmarkCreated = bookmarks[bookmarks.length - 1].meta?.created;
      if (bookmarkCreated) {
        cacheArr.push({
          key: selectModalId,
          id: bookmarkCreated.uuid,
          meta: bookmarkCreated,
          type: selectModalId,
        });
      }
    }

    selection.current = cacheArr;
    setRenderFlag(!renderFlag);
  };

  /**
   * Use Effect triggers initializing current selection
   */
  useEffect(() => {
    handleCacheUpdated();
  }, [cache?.selections?.length]);

  /**
   * Use Effect resolves unknown names when selection changes
   * sets limit flag if max number of selected items is reached
   */
  useEffect(() => {
    handleResolveNames();
    if (maxNumSelected >= 0) {
      if (selection.current.length >= maxNumSelected) {
        setIsMaxLimit(true);
      }
    }
  }, [renderFlag]);

  /**
   * Use Effect resolves unknown names when page data loads
   */
  useEffect(() => {
    handleResolveNames();
  }, [pageData]);

  const delay = (milliseconds: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  };

  /**
   * Handles action button click
   * If apply clicked (1) apply local state to redux state
   * @param {number} buttonIndex Button Index
   */
  const handleAction = async (buttonIndex: number) => {
    switch (buttonIndex) {
      case 1: //APPLY button
        setMultiSelectionCache(selectModalId, selection.current);
        if (onApplySelection) {
          onApplySelection(selection.current);
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

    // REF
    // if (buttonIndex === 1 && selectModalId === 'multiselect-ansible role') {
    //   console.log('test-delay', selectModalId);
    //   await delay(4000);
    // }

    //clear modal & newly created object from bookmark before closing dialog
    clearCreatedFromBookmark();
    clearModalFromBookmark();

    const foundModal = restoreModal();

    //dont clear meta so page can query last meta data associated with selection
    if (!foundModal) {
      dispatch(setModal({ type: '', id: null, name: null }));
    }
  };

  /**
   * Add all records from the current page into the selection if they are not already selected
   */
  const handleAddAll = () => {
    for (let i = 0; i < pageData.length; i++) {
      const id = pageData[i][dataIdField] || pageData[i];
      const selIndex = selection.current.findIndex(
        (obj: CommonAppSelectionState) => obj.id === id,
      );

      if (selIndex >= 0) {
        //Already Selected, Do Nothing
      } else {
        if (maxNumSelected >= 0 && selection.current.length >= maxNumSelected) {
          break;
        }
        if (excludeId && excludeId === id) {
          continue; // skip this one
        }
        selection.current.push({
          key: selectModalId,
          id: id,
          meta: pageData[i],
          type: selectModalId,
        });
      }
    }

    setRenderFlag(!renderFlag);
  };

  /**
   * Clear all records from the selection
   */
  const handleClearAll = () => {
    selection.current = [];
    setRenderFlag(!renderFlag);
  };

  /**
   * Add a single item into selection
   * @param {any} data Row data
   */
  const handleAppendSelection = (data: any) => {
    const id = data[dataIdField] || data;
    const selIndex = selection.current.findIndex(
      (obj: CommonAppSelectionState) => obj.id === id,
    );

    if (selIndex >= 0) {
      //Already Selected, Deselect
      handleDeleteSelection(selIndex);
    } else {
      if (maxNumSelected >= 0 && selection.current.length >= maxNumSelected) {
        return;
      }

      selection.current.push({
        key: selectModalId,
        id: id,
        meta: data,
        type: selectModalId,
      });
      setRenderFlag(!renderFlag);
    }
  };

  /**
   * Delete a single item from selection
   * @param {any} chipToDelete Index of chip to remove from selection
   */
  const handleDeleteSelection = (chipToDelete: any) => {
    //REF setCurrentSelection((oldArray) =>
    //   oldArray.filter((_, index) => index !== chipToDelete)
    // );
    selection.current.splice(chipToDelete, 1);
    setRenderFlag(!renderFlag);
  };

  /**
   * Resolve names for selected items that don't include name in their meta data
   * This occurs when edit forms are viewed because we don't make special API calls to extract the information
   * Since the pagination component already loads the page data
   * Names are pulled from the page data when it triggers a callback on data loaded
   * Once all names are resolved, a flag is set to prevent processing again
   * It only needs to run one time, as long as both page data and selection are mounted
   */
  //TODO Mico
  const handleResolveNames = () => {
    if (shouldResolveNames && selection.current?.length > 0) {
      let shouldUpdate = false;
      let numToResolve = 0;
      for (let i = 0; i < selection.current.length; i++) {
        if (selection.current[i].meta?.name === 'Unknown Name') {
          numToResolve++;
          //see if you can find the name in the current page data
          const selIndex = pageData
            ? pageData.findIndex(
                (obj: any) => obj[dataIdField] === selection.current[i].id,
              )
            : -1;
          if (selIndex >= 0) {
            numToResolve--;

            const resolveName =
              pageData[selIndex].name || pageData[selIndex][dataIdField];
            let newMeta = { ...selection.current[i].meta, name: resolveName };
            let newObj = {
              ...selection.current[i],
              meta: newMeta,
              name: resolveName,
            };

            selection.current[i] = newObj;
            shouldUpdate = true;
          } else {
            if (queryKey) {
              const cacheData: any = queryCache.getIdFromArray(
                queryKey,
                selection.current[i][dataIdField],
                dataIdField,
              );
              if (cacheData) {
                numToResolve--;
                const resolveNameFromQueryCache = cacheData?.name;
                let newMeta = {
                  ...selection.current[i].meta,
                  name: resolveNameFromQueryCache,
                };
                let newObj = {
                  ...selection.current[i],
                  meta: newMeta,
                  name: resolveNameFromQueryCache,
                };
                selection.current[i] = newObj;
                shouldUpdate = true;
              }
            }
          }
        }
      }
      if (numToResolve === 0) {
        setShouldResolveNames(false);
      }
      if (shouldUpdate) {
        //REF setRenderFlag(!renderFlag);
      }
    }
  };

  // keep track of last row clicked for "shift" select
  const [lastRowClicked, setLastRowClicked] = useState<number | null>(null);

  /**
   * Turns row(s) on/off based on status of row clicked and whether shifh key is on
   *  @param {any} data Index of chip to remove from selection
   *  @param {number} buttonId Index of chip to remove from selection
   * @param {boolean} shiftKeyOn Whether shift key is currently being held down
   */
  const handleRowClick = (
    data: any,
    buttonId: number,
    shiftKeyOn?: boolean,
  ) => {
    const rowIsCurrentlySelected = (rowId: string) => {
      return selection.current.findIndex((item) => item.id === rowId) >= 0;
    };

    switch (buttonId) {
      case selectButtonId:
        if (!featureFlagMultipleSelectShift) {
          handleAppendSelection(data);
        } else {
          const rowIndex = pageData.findIndex(
            (item) => item[dataIdField] === data[dataIdField],
          );
          // protect from bad data - row not found on page
          if (rowIndex >= 0) {
            if (lastRowClicked !== null && shiftKeyOn) {
              const start = Math.min(lastRowClicked, rowIndex);
              const end = Math.max(lastRowClicked, rowIndex);
              if (rowIsCurrentlySelected(data[dataIdField])) {
                // turn rows off
                for (let i = start; i <= end; i++) {
                  const rowData = pageData[i];
                  if (rowIsCurrentlySelected(rowData[dataIdField])) {
                    handleAppendSelection(rowData);
                  }
                }
              } else {
                // turn rows on
                for (let i = start; i <= end; i++) {
                  const rowData = pageData[i];
                  if (!rowIsCurrentlySelected(rowData[dataIdField])) {
                    handleAppendSelection(rowData);
                  }
                }
              }
            } else {
              // no shift - handle normally
              handleAppendSelection(data);
            }
            setLastRowClicked(rowIndex);
          }
        }
        break;
      case 0:
        if (route) {
          //Edit Row
          //Persist selection modal in bookmarks
          addModalToBookmark({ ...modalObj });
          //Navigate to new route
          handleNavigateTo(FormCrudType.edit, route + '/' + data.uuid, data);
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
        handleAppendSelection(data);
        break;
    }
  };

  /**
   * Callback triggered when current page data loads
   *  @param {any[]} data Page data
   * @param {number} totalCount Total number of records, regardless of paging
   */
  const onPageData = (data: any[], totalCount: number) => {
    setPageData(data);
    setTotalCount(totalCount);
    // changing page means we cannot be handling as shift from previous selection
    setLastRowClicked(null);
  };

  // height so that chip area doesn't jump when first item is selected
  const noneSelectedLabelHeight = instructions ? '13px' : '29px';

  const minViewHeight = '320px';
  const viewHeight = '480px';
  const viewWidth = '820px';

  const noSelectionAlertHeight = 92;
  const selectionAlertHeight = 112;
  const verticalPageExtraHeight = 222;
  // Dialog margins (top+bottom) @64 + content padding @20 + footer @70 + header @60 + other padding @8 = 222
  const pageListExtraHeight =
    selection.current?.length > 0
      ? verticalPageExtraHeight + selectionAlertHeight // 334
      : verticalPageExtraHeight + noSelectionAlertHeight; // 314

  const selectListExtraHeight = pageListExtraHeight + 40;
  //  pageListExtraHeight + (pagination padding @8 /steps @32 + filters (handled inside paginationList)= 40)
  //  selectListHeight is listHeight + (pagination padding/steps @32 + buttons & filters which could be open @76 = 108)

  const handleNavigateTo = (
    navCrud: FormCrudType,
    route: string,
    data?: any,
  ) => {
    navigate(route);
  };

  const titleChildren = (
    <Box sx={{ paddingBottom: '8px', paddingLeft: '12px' }}>
      <ButtonMinorUi
        id="add-all"
        disabled={isMaxLimit || selection.current.length >= totalCount}
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddAll}
        sxProps={sxSelectButtonprops}
      >
        Add All
      </ButtonMinorUi>
      <ButtonMinorUi
        id="clear-all"
        disabled={!selection.current || selection.current.length === 0}
        size="small"
        startIcon={<DeleteIcon />}
        onClick={handleClearAll}
        sxProps={sxSelectButtonprops}
      >
        Clear All
      </ButtonMinorUi>
      {route && allowCreateNew && (
        <ButtonMinorUi
          id="create"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            //persist selection modal to bookmarks
            addModalToBookmark({ ...modalObj });
            handleNavigateTo(FormCrudType.create, route + '/create');
          }}
          sxProps={sxSelectButtonprops}
        >
          Create New
        </ButtonMinorUi>
      )}
    </Box>
  );

  const view = (
    <div
      style={{
        width: viewWidth,
        height: snapToFit ? 'calc(100vh)' : viewHeight,
        minHeight: minViewHeight,
        //REF this breaks layout maxHeight: viewHeight,
      }}
    >
      {/*menu*/}
      {pageData?.length > 0 && (
        <Alert
          sx={{
            borderColor: '#7DC581',
            borderWidth: '2px',
            maxHeight: 118,
            width: 'auto',
          }}
          severity="success"
        >
          <AlertTitle>Selected</AlertTitle>
          {selection.current.length > 0 ? (
            // looping over the selections requires a fragment
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {selection.current.map(
                (selection: CommonAppSelectionState, index: number) => {
                  const chipLabel = selection?.meta
                    ? selection.meta[chipField]
                    : undefined;
                  return (
                    <Chip
                      tabIndex={index}
                      key={index}
                      label={chipLabel ?? selection?.id}
                      variant="outlined"
                      onDelete={() => handleDeleteSelection(index)}
                    />
                  );
                },
              )}
            </>
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
      {isMaxLimit && (
        <Box sx={{ margin: '12px' }}>
          <Alert severity="info" sx={{ width: 'auto' }}>
            You may ONLY select up to {maxNumSelected}.
          </Alert>
        </Box>
      )}
      {Object.keys(filters).length > 0 && (
        <Typography
          variant="caption"
          id="instructions"
          sx={{ color: 'text.hint' }}
        >
          Filters:{JSON.stringify(filters)}
        </Typography>
      )}
      {(apiHook || defaultPageData) && (
        <PaginationFiltersContextProvider
          testId={testId}
          visibleFilters={visibleFilters}
        >
          <PaginationListView
            apiHook={apiHook}
            defaultPageData={defaultPageData}
            listViewProps={{
              shouldShowColumnHeaders: true,
              // sxProps: { maxHeight: selectListHeight },
            }}
            filters={filters}
            testId={testId}
            noDataFoundMsg={noDataFoundMsg}
            //REF paginationLabel={pageLabel}
            rowsPerPage={rowsPerPage}
            styleProps={{
              marginTop: '8px',
              verticalPageExtraHeight: pageListExtraHeight,
              verticalListViewExtraHeight: selectListExtraHeight,
            }}
            loaderFunction={(isLoading) => {
              dispatch(setLoader(isLoading));
            }}
            onPageData={onPageData}
            renderItem={(data: any, index?: number) => {
              // currently only for ansible playbooks selecting parent
              if (
                topicId === Topic.AnsiblePlaybook &&
                excludeId &&
                excludeId === data.uuid
              ) {
                return <div style={{ height: '.1px' }} />; // skip parent -- height non-zero so perfornamt list doesn't reset it
              }
              const selIndex = selection.current.findIndex(
                (obj: CommonAppSelectionState) => obj.id === data[dataIdField],
              );

              return (
                <StyledRow
                  data={data}
                  dataIdField={dataIdField}
                  isSelected={selIndex >= 0}
                  isTitleDisplay={index === -1}
                  rowAuthor={data.author}
                  rowChildren={handleGetRowChildren(data)}
                  //REF rowTitle={rowTitle}
                  rowTitleStyle={listStyles.columnName}
                  rowDate={data.dateEdited}
                  rowActions={rowActions}
                  showMultiSelectedStyles={true}
                  sortableColumns={sortableColumns}
                  onActionSelect={(buttonIndex: number) =>
                    handleRowClick(data, buttonIndex)
                  }
                  onChildActionSelect={(childData: any, buttonIndex: number) =>
                    handleChildRowClick(childData, buttonIndex)
                  }
                  onRowSelect={(data?: any, shiftKeyOn?: boolean) =>
                    handleRowClick(data, selectButtonId, shiftKeyOn)
                  }
                />
              );
            }}
            shouldDisplayFilters={true}
            title=""
            titleChildren={titleChildren}
          />
        </PaginationFiltersContextProvider>
      )}
    </div>
  );

  const isOpen = modalObj.topic === topicId;
  return (
    <div
      data-testid="selections"
      style={{ width: styleProps?.formWidth ?? '100%' }}
    >
      {isModal ? (
        <ModalDialog
          buttons={modalButtonText}
          disableSubmit={
            disableOnEmptySelection && selection.current.length === 0
          }
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
        <>{view}</>
      )}
    </div>
  );
}
export default MultipleSelectWrapper;
