/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from 'react-query';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { PaginationFilters } from './PaginationFilters';
import { PaginationFiltersContext } from './PaginationFiltersContext';

/* MUI */
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { DividerProps } from '@mui/material/Divider';
import { Typography } from '@mui/material';

/*Icons */
import RefreshIcon from '@mui/icons-material/Refresh';
import ListView, { ListViewProps } from '../../data-display/ListView';
import { debugLogWarning } from '../../utility/logger';
import { authoredByMeFilter, paginationFiltersConfig } from './paginationFiltersConstants';
import TablePaginationUi from './TablePagination';
import DataFetcher from '../../forms/DataFetcher';
import { ButtonIcon } from '../../utility/buttons';
const defaultRowsPerPage = 100;

/**
 * @typedef pagelListStyleProps
 * @property {string} [marginTop='0px'] Margin for top of Page list (in pixels)
 * @property {number} [maxWidth] Max Width for list --- I don't see this used but BasicQueryList is currently sending it
 * @property {number} [verticalPageExtraHeight=136] Vertical height of elements outside page list
 * NOTE: add others as we need them
 */
export type pageListStyleProps = {
  marginTop?: string;
  maxWidth?: number;
  verticalPageExtraHeight?: number;
  verticalListViewExtraHeight?: number;
};

/**
 * @typedef {Object} PaginationListViewProps
 * @property {boolean} [allowRefresh = false] Whether to display refresh button that triggers reloading data
 * @property {*} apiHook API hook for getting the list of items
 * @property {DividerProps} [dividerProps] SX props passed to MUI divider
 * @property {*} [filters = defaultFilters] Hidden filters that the user does not see
 * @property {ListViewProps} [listViewProps] ListView props passed to ListView
 * @property {string} [testId] Test id
 * @property {string} [noDataFoundMsg = 'None found.'] Message displayed when no data is found
 * @property {string} [paginationLabel = ''] Pagination label
 * @property {number} [pollingInterval = 30000] Polling interval
 * @property {string} [pollingQueryKey] React query key to invalidate when polling is enforced OR when refresh button is clicked
 * @property {(item: any) => JSX.Element)} [renderItem] Render item for row
 * @property {JSX.Element} [rightMenuChildren] Elements to nest to the right of filter and refresh buttons
 * @property {number} [rowsPerPage = 10] Number of rows to display per page
 * @property {boolean} [sendTokenHeader] Whether to include token in payload
 * @property {boolean} [shouldDisplayFilters = false] Whether to display filters
 * @property {boolean} [shouldApplyContextFilters = true] Whether to apply the (visible) context filters
 * @property {boolean} [shouldPage = true] Whether to page
 * @property {boolean} [shouldPoll = false] Whether to poll
 * @property {pageListStyleProps} [styleProps] Styling Props used for overriding styles of subComponents
 * @property {string} [title] Title
 * @property {JSX.Element} [titleChildren] Elements passed to ListView, typically instead of title string. Aligns flex-start
 * @property {(isLoading: boolean) => void} [loaderFunction] Whether data is loading
 * @property {(error: string) => void} [onPageDataError] Method to call if an error occurs on loading of data
 * @property {(page: number) => void} [onPageChange] Current page number
 * @property {(data: any[], page: number) => void} [onPageData] Callback with current page data and total count
 * @property {(item: any) => void} [onRowSelect] Callback for row selected
 * @property {boolean} [isPerformant = true] Whether to render list items in a performant manner
 */
export type PaginationListViewProps = {
  allowRefresh?: boolean; //whether to allow refresh button that triggers reloading data
  apiHook: any;
  defaultPageData?: any[];
  dividerProps?: DividerProps;
  listViewProps?: Partial<ListViewProps>;
  filters?: any;
  testId?: string;
  noDataFoundMsg?: string;
  paginationLabel?: string;
  pollingInterval?: number;
  pollingQueryKey?: string;
  queryConfig?: any;
  renderItem?: (item: any, index?: number) => JSX.Element;
  rightMenuChildren?: JSX.Element;
  rowsPerPage?: number;
  rowsPerPageOptions?: any;
  sendTokenHeader?: boolean;
  shouldDisplayFilters?: boolean;
  shouldApplyContextFilters?: boolean;
  shouldPage?: boolean;
  shouldPoll?: boolean;
  shouldScroll?: boolean;
  styleProps?: pageListStyleProps;
  title?: string;
  titleChildren?: JSX.Element;
  loaderFunction?: (isLoading: boolean) => void;
  onPageDataError?: (error: string) => void;
  onPageChange?: (page: number) => void;
  onPageData?: (data: any[], totalCount: number) => void;
  onRowSelect?: (item: any) => void;
  isPerformant?: boolean;
};

const defaultFilters = {};
const defaultMarginTop = 0;
const defaultPageExtraHeight = 136;
// App Header & breadcrumbs @70 + content padding @20 + footer @46 = 136
const defaultListViewExtraHeight = defaultPageExtraHeight + 34;
// defaultPageExtraHeight + pagination padding/steps @34  NOTE: filter area height calculated dynamically
const defaultFilterHeight = 44;

export function PaginationListView({
  allowRefresh = false,
  apiHook,
  defaultPageData = [],
  dividerProps,
  listViewProps,
  filters = defaultFilters, //these are hidden filters that the user does not see
  pollingInterval = 30000,
  pollingQueryKey,
  rightMenuChildren,
  testId,
  noDataFoundMsg = 'None found.',
  paginationLabel = '',
  queryConfig = {},
  renderItem,
  rowsPerPage = defaultRowsPerPage,
  rowsPerPageOptions,
  sendTokenHeader = false,
  shouldDisplayFilters = false,
  shouldApplyContextFilters = true,
  shouldPage = true,
  shouldPoll = false,
  shouldScroll = true,
  styleProps,
  title = '',
  titleChildren,
  loaderFunction,
  onPageDataError,
  onPageChange,
  onPageData,
  onRowSelect,
  isPerformant = true,
}: PaginationListViewProps) {
  const {
    filterValues,
    initialPage = 0,
    initialRowsPerPage = -1,
    isFilterVisible,
    isFiltersInit,
    resetPageFlag,
    onPageNumberChange,
    onRowsPerPageChange,
  } = useContext(PaginationFiltersContext);

  //Init
  const [displayPage, setDisplayPage] = useState(initialPage);
  const [displayRowsPerPage, setDisplayRowsPerPage] = useState(
    initialRowsPerPage !== 0 ? initialRowsPerPage : rowsPerPage,
  );

  const [isInit, setIsInit] = useState(
    defaultPageData.length === 0 ? false : true,
  );
  const [isLoading, setIsLoading] = useState(
    defaultPageData.length === 0 ? true : false,
  );

  //Pagination
  const [isPaginated, setIsPaginated] = useState(
    defaultPageData.length === 0 ? true : false,
  );
  const [totalCount, setTotalCount] = useState(defaultPageData.length);
  const [pageData, setPageData] = useState<any[]>(defaultPageData);
  const [payload, setPayload] = useState(null);

  //#region height
  const maxPageListHeight = styleProps?.verticalPageExtraHeight
    ? `calc(100vh - ${styleProps.verticalPageExtraHeight}px)`
    : `calc(100vh - ${defaultPageExtraHeight}px)`;

  const [listSubtractHeight, setListSubtractHeight] = useState(
    styleProps?.verticalListViewExtraHeight
      ? styleProps.verticalListViewExtraHeight + defaultFilterHeight
      : defaultListViewExtraHeight + defaultFilterHeight,
  );

  // to keep list height from jumping too much between paging
  const minListHeight = useMemo(() => {
    return (pageData.length || 0) * 38 + 'px';
  }, [pageData.length]);

  // list height = page - listViewExtraHeight - Filter area height
  const defaultListViewProps: Partial<ListViewProps> = {
    shouldShowColumnHeaders: true,
    sxProps: {
      maxHeight: shouldScroll
        ? `calc(100vh - ${listSubtractHeight}px)`
        : undefined,
    },
  };

  useEffect(() => {
    if (isFiltersInit) {
      const filterElement = document.getElementById('pagination-filters');

      if (filterElement?.clientHeight) {
        const listExtraHeight =
          styleProps?.verticalListViewExtraHeight ?? defaultListViewExtraHeight;
        setListSubtractHeight(listExtraHeight + filterElement.clientHeight);
      }
    }
  }, [isFiltersInit, isFilterVisible, styleProps?.verticalListViewExtraHeight]);
  //#endregion

  //Polling
  const pollingMessage = 'Refresh @ ' + pollingInterval / 1000.0 + 's';
  const queryClient = useQueryClient();

  const handleLoading = useCallback(
    (isLoading: any) => {
      //not sure why this is required to make dispatch occur correctly
      setIsLoading(isLoading);
      if (loaderFunction) {
        loaderFunction(isLoading);
      }
    },
    [setIsLoading, loaderFunction],
  );

  const handleDataLoaded = useCallback((data: any) => {
    if (data) {
      let newPageData: any[];
      let newTotalCount = 0;
      if (data.hasOwnProperty('data')) {
        newPageData = data?.data;
        newTotalCount = data?.totalCount;
      } else {
        setIsPaginated(false);
        if (data?.length > 0) {
          newPageData = data;
          newTotalCount = data?.length;
        } else {
          newPageData = [];
          newTotalCount = 0;
        }
      }

      setTotalCount(newTotalCount);
      setPageData(newPageData);
      if (onPageData) {
        onPageData(newPageData, newTotalCount);
      }
    }
  }, []);

  const handleRefresh = () => {
    if (pollingQueryKey) {
      queryClient.invalidateQueries(pollingQueryKey);
    } else {
      debugLogWarning('Query Key missing');
    }
  };

  // we only need to rerender when payload inputs change
  const dataFetcherMemo = useMemo(() => {
    return (
      <DataFetcher
        apiHook={apiHook}
        payload={payload}
        shouldSuppressToaster={onPageDataError ? true : false}
        onDataLoad={handleDataLoaded}
        onError={onPageDataError ? onPageDataError : undefined}
        onLoading={handleLoading}
      />
    );
  }, [payload, apiHook, onPageDataError, handleDataLoaded, handleLoading]);

  //Test
  useEffect(() => {
    if (!apiHook && defaultPageData) {
      setTotalCount(defaultPageData.length);
      setPageData(defaultPageData);
      setIsLoading(false);
    }
  }, [defaultPageData, defaultPageData.length]);

  useEffect(() => {
    if (isInit) {
      if (!apiHook && defaultPageData.length > 0 && onPageData) {
        onPageData(defaultPageData, defaultPageData.length);
      }
      setDisplayPage(0);
    }
  }, [resetPageFlag]);

  useEffect(() => {
    //TRY FIRST
    if (!apiHook) {
      return;
    }

    let reqOptions = {
      // we can avoid applying default filters from context.
      // example- when we want to override the default sort by behavior and we aren’t showing visible filters
      ...filters,
      shouldPoll: shouldPoll ? pollingInterval : shouldPoll,
    };

    // sometimes we do NOT want (visible) context filtering
    if (shouldApplyContextFilters) {
      reqOptions = {
        ...reqOptions,
        ...filterValues,
      };
    }

    if (displayRowsPerPage >= 0 && shouldPage) {
      reqOptions['offset'] = displayPage * displayRowsPerPage;
      reqOptions['limit'] = displayRowsPerPage;
    }

    // special case - translate author filter to current user's email address or clear api filter
    if (
      Object.prototype.hasOwnProperty.call(filterValues, authoredByMeFilter.key)
    ) {
      if (filterValues[authoredByMeFilter.key] === 'true') {
        reqOptions[authoredByMeFilter.key] = paginationFiltersConfig.author;
      } else {
        reqOptions[authoredByMeFilter.key] = undefined;
      }
    }

    //some of endpoints require an auth token
    if (sendTokenHeader) {
      // reqOptions['authToken'] = queryHooksConfig.headers.Authorization;
    }

    reqOptions['queryConfig'] = queryConfig;

    setPayload(reqOptions);
    setIsInit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, displayPage, displayRowsPerPage]);

  const getPollAndRefreshChildren = () => {
    return (
      <>
        {shouldPoll && (
          <>
            <Typography
              align="right"
              sx={{
                maxHeight: '1.5rem',
                color: 'text.hint',
                width: 'auto',
              }}
              variant="body2"
            >
              {pollingMessage}
            </Typography>
            <ButtonIcon
              id="Refresh"
              name="Refresh"
              tooltip="Refresh"
              props={{
                onClick: (event) => {
                  // prevent bubble up to another possible element
                  event.stopPropagation();
                  handleRefresh();
                },
              }}
            >
              <RefreshIcon fontSize="medium" />
            </ButtonIcon>
          </>
        )}
        {!shouldPoll && allowRefresh && (
          <>
            <ButtonIcon
              id="Refresh"
              name="Refresh"
              tooltip="Refresh"
              props={{
                onClick: (event) => {
                  // prevent bubble up to another possible element
                  event.stopPropagation();
                  handleRefresh();
                },
              }}
            >
              <RefreshIcon fontSize="medium" />
            </ButtonIcon>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div // DO NOT CHANGE TO BOX!!! breaks auto height
        className="list-container"
        style={{
          //REFbackgroundColor:(theme) => `${theme.palette.background.default}`,
          minHeight: minListHeight,
          height: 'auto',
          maxHeight: shouldScroll ? maxPageListHeight : undefined,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: styleProps?.marginTop ?? defaultMarginTop,
            width: '100%',
            height: 'auto',
          }}
          data-testid="pagination-list-view"
        >
          {isInit && apiHook && dataFetcherMemo}
          <>
            {!isLoading && (
              <ListView
                isPerformant={isPerformant}
                dividerProps={dividerProps}
                testId={testId}
                items={pageData}
                renderItem={renderItem}
                titleRow={
                  <>
                    {shouldDisplayFilters ? (
                      <PaginationFilters
                        title={title}
                        titleChildren={titleChildren}
                      >
                        <>
                          {getPollAndRefreshChildren()}
                          {rightMenuChildren && rightMenuChildren}
                        </>
                      </PaginationFilters>
                    ) : (
                      <div
                        className="content-row-stretch"
                        style={{ marginTop: '-2px', marginBottom: '4px' }}
                      >
                        {titleChildren}
                        <Typography
                          sx={{
                            minWidth: 'auto',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {title}
                        </Typography>
                        <div className="content-row-icons-end">
                          {getPollAndRefreshChildren()}
                          {rightMenuChildren && rightMenuChildren}
                        </div>
                      </div>
                    )}
                  </>
                }
                onRowSelect={onRowSelect}
                {...defaultListViewProps}
                {...listViewProps}
              />
            )}

            {/*
            When totalCount is -1, that indicates the server does not know the actual total count.
            For example, keycloak users.
            */}
            {shouldPage && (totalCount > 0 || totalCount === -1) && (
              <TablePaginationUi
                id={testId}
                label={paginationLabel}
                page={displayPage}
                rowsPerPage={isPaginated ? displayRowsPerPage : totalCount}
                rowsPerPageOptions={
                  isPaginated ? rowsPerPageOptions : undefined
                }
                totalCount={totalCount}
                onPageChange={(page) => {
                  //persist it redux
                  if (onPageNumberChange) {
                    onPageNumberChange(page);
                  }
                  // notify parent
                  if (onPageChange) {
                    onPageChange(page);
                  }
                  //local state
                  setDisplayPage(page);
                }}
                onRowsPerPageChange={(rowsPerPageSel) => {
                  if (onRowsPerPageChange) {
                    onRowsPerPageChange(rowsPerPageSel);
                  }
                  //local state
                  setDisplayRowsPerPage(rowsPerPageSel);
                  setDisplayPage(0);
                }}
              />
            )}
          </>
        </Box>
      </div>

      {isInit && !isLoading && totalCount === 0 && (
        <Box sx={{ margin: '12px' }}>
          <Alert severity="info" sx={{ padding: '12px', maxWidth: '480px' }}>
            {noDataFoundMsg}
          </Alert>
        </Box>
      )}
    </>
  );
}

export default PaginationListView;
