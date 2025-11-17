import { Box } from '@mui/material';
import {
  ActionRow,
  ActionRowExpandable,
  ActionRowProps,
  iListItemType,
  inputFilterType,
  listStyles,
  PaginationFiltersContextProvider,
  PaginationListView,
  PaginationListViewProps,
  RowAction,
  rowsPerPageOptionsDefault,
} from '@rangeos-nx/ui/branded';

/**
 * iRowProps
 */
export interface iRowProps extends ActionRowProps {
  childProps: ActionRowProps;
  getListPayload: any;
  getListHook: any;
  getRowActions?: (instance: iListItemType) => Array<RowAction>;
  getRowChildren?: (
    instance: iListItemType,
    index?: number,
  ) => JSX.Element | undefined;
  getRowChildrenTitle?: (instance: iListItemType) => JSX.Element | undefined;
  getRowStatusChildren?: (instance: iListItemType) => JSX.Element | null;
  noDataFoundMsg?: string;
  touchKey: string;
  onChildRowActionSelect?: (buttonIndex: number, instance?: any) => void;
  onPageData: (data: any) => void;
  onSetIsExpanded: (isExpanded: boolean) => void;
  paginationProps?: Partial<PaginationListViewProps>;
  visibleFilters?: inputFilterType[];
}

const defaultPaginationProps: Partial<PaginationListViewProps> = {
  allowRefresh: false,
  rowsPerPage: 100,
  rowsPerPageOptions: rowsPerPageOptionsDefault,
  sendTokenHeader: false,
  shouldDisplayFilters: false,
  shouldPoll: false,
};

/**
 * Row will retrieving list of things and show in expanding/collapsing view
 * @param props
 * @returns
 */
export function ActionRowHook(props: iRowProps) {
  const {
    childProps,
    getRowActions,
    getRowChildren,
    getRowChildrenTitle,
    getListPayload,
    getListHook,
    minActionWidth = '120px',
    noDataFoundMsg = 'None found.',
    rowAuthorStyle,
    sortableColumns,
    touchKey,
    onPageData,
    onChildRowActionSelect,
    paginationProps,
    visibleFilters,
  } = props;

  const defaultItem = (instance: iListItemType, index?: number) => (
    <ActionRow
      data={instance}
      isTitleDisplay={index === -1}
      {...childProps}
      minActionWidth={minActionWidth}
      rowActions={getRowActions ? getRowActions(instance) : undefined}
      rowChildren={getRowChildren ? getRowChildren(instance, index) : undefined}
      rowChildrenTitle={
        getRowChildrenTitle ? getRowChildrenTitle(instance) : undefined
      }
      rowAuthorStyle={rowAuthorStyle}
      sortableColumns={sortableColumns}
      onActionSelect={(buttonIndex: number) => {
        if (onChildRowActionSelect) {
          onChildRowActionSelect(buttonIndex, instance);
        }
      }}
      onRowSelect={() => {
        if (onChildRowActionSelect) {
          onChildRowActionSelect(0, instance);
        }
      }}
    />
  );

  const expansionChildren = (
    <Box sx={{ marginLeft: '24px' }}>
      <PaginationFiltersContextProvider
        filterSxProps={{}}
        hiddenFilters={getListPayload}
        visibleFilters={visibleFilters}
        testId={touchKey}
      >
        <PaginationListView
          isPerformant={false}
          apiHook={getListHook}
          testId={touchKey}
          title={''}
          noDataFoundMsg={noDataFoundMsg}
          pollingQueryKey={undefined}
          loaderFunction={(isLoading) => {
            //FUTURE dispatch(setLoader(isLoading));
          }}
          {...defaultPaginationProps}
          {...paginationProps}
          renderItem={defaultItem}
          onPageData={onPageData}
        />
      </PaginationFiltersContextProvider>
    </Box>
  );

  return (
    <ActionRowExpandable
      expansionChildren={expansionChildren}
      touchRowCacheKey={touchKey}
      {...props}
    ></ActionRowExpandable>
  );
}
export default ActionRowHook;
