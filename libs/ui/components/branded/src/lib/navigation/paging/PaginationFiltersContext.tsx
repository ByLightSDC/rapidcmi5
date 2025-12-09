/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  authoredByMeFilter,
  defaultCpeFilters,
  defaultInputFilters,
  defaultUndefinedOptionLabel,
  defaultSearch,
  defaultMetadataTags,
  uuidFilter,
} from './paginationFiltersConstants';
import { pageFilters, pageSettings, setPageFilters, setPageSettings } from './paginationReducer';

export const pageProperty = 'page';
export const rowsPerPageProperty = 'rowsPerPage';
export const visibilityProperty = 'visible';

export interface LooseObject {
  [key: string]: any;
}
/**
 * Returns array of CPE field tooltips to display for filter icon
 * @param {{[key:string]: string}} currentFilters Current filtering values for page
 * @return {string[]} List of tooltips for CPE filter fields
 */
export const getCpeFiltersTooltips = (currentFilters: {
  [key: string]: string;
}) => {
  const cpeFilterTooltips: string[] = [];
  defaultCpeFilters.map((item) => {
    if (
      Object.prototype.hasOwnProperty.call(currentFilters, item.key) &&
      currentFilters[item.key] !== item.default &&
      currentFilters[item.key].length > 0
    ) {
      cpeFilterTooltips.push(`${item.label}: ${currentFilters[item.key]}`);
    }
  });
  return cpeFilterTooltips;
};

/**
 * @interface IPaginationFiltersContext
 * @prop {inputFilterType[]} visibleFilters Interactable filters presented to the user
 * @prop {{ [key: string]: string | string[] }} filterValues Values object passed to pagination query
 * @prop {string[]} filterTooltip Array of current page specific filters to tooltip
 * @prop {(key: string, value: string | string[], immediate: boolean, resetPageFlag: boolean) => void)} onInputFilterChange Handler to process filter change
 * @prop {(pageNumber: number) => void} onPageNumberChange Handles page number changed
 * @prop {(isVisible: boolean) => void} onVisibilityChange Handles filter visibilility changed
 * @prop {(numRowsPerPage: number) => void} onRowsPerPageChange  Handles filter rows per page changed
 * @prop {number} initialPage Initial page number pulled from cache, defaults to 0
 * @prop {number} initialRowsPerPage Initial rows per page pulled from cache, defaults to 0
 * @prop {boolean} isFilterVisible Whether filter is visible
 * @prop {boolean} isFiltersInit Whether pagination filters component has been rendered
 * @prop {(isInit: boolean) => void} setIsFiltersInit Set the status of pagination filters component
 * @prop {number} rowsPerPage Number of rows per page configuration for the topic/test id which can be overridden
 * @prop {boolean} resetPageFlag A flag used to trigger render, helps prevent API calls every time a filter char is changed
 */
interface IPaginationFiltersContext {
  visibleFilters: inputFilterType[];
  filterSxProps?: any;
  filterValues: { [key: string]: string | string[] };
  filterTooltip: string[];
  onInputFilterChange?: (
    key: string,
    value: string | string[],
    immediate: boolean,
    resetPageFlag: boolean,
  ) => void;
  onPageNumberChange?: (pageNumber: number) => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onRowsPerPageChange?: (numRowsPerPage: number) => void;
  initialPage: number;
  initialRowsPerPage: number;
  isFilterVisible: boolean;
  isFiltersInit: boolean;
  setIsFiltersInit?: (isInit: boolean) => void;
  rowsPerPage: number;
  resetPageFlag: boolean;
}

/**
 * @interface inputFilterType
 * @property {string} [key] Payload parameter for a filter
 * @property {string} [label] Label displayed above filter input
 * @property {string} [placeholder] Placeholder text to display when filter value not specified
 * @property {*} [options] Options to display for a filter input
 * @property {string | string[]} [default] Default value for a filter input
 * @property {boolean} [isCheckbox] Whether filter should be displayed as a checkbox
 * @property {boolean} [multiple=false] Whether to allow multiple selection of filter items
 * @property {string} [triggerPageReset=false] Whether changing a filter should trigger page to reset to 0
 */
export interface inputFilterType {
  key: string;
  label: string;
  placeholder?: string;
  options?: any;
  default?: string | string[];
  isCheckbox?: boolean;
  isDisabled?: boolean;
  multiple?: boolean;
  triggerPageReset?: boolean;
  divProps?: any;
}

/** @constant
 * Context for pagination filters
 *  @type {React.Context<IPaginationFiltersContext>}
 */
export const PaginationFiltersContext =
  createContext<IPaginationFiltersContext>({
    filterSxProps: {},
    filterValues: {},
    filterTooltip: [],
    resetPageFlag: false,
    visibleFilters: [],
    initialPage: 0,
    initialRowsPerPage: 0,
    isFilterVisible: false,
    isFiltersInit: false,
    rowsPerPage: 0,
  });

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 * @property {{[key: string]: string} => string[]} [getFilterTooltips] Optional Method to call for special page filters
 * @property {{ [key: string]: string }} hiddenFilters Hidden filters not presented to the user but passed to the pagination query
 * @property {inputFilterType[]} [visibleFilters = defaultInputFilters] Interactable filters presented to the user
 * @property {*} setIsFilterVisible Sets whether interactable filters are visible
 * @property {boolean} isFilterVisible Whether interactable filters are visible
 * @property {boolean} isFiltersInit Whether pagination filters has been initialized
 * @property {*} setIsFiltersInit Sets whether pagination filters has been initialized
 */
interface tProviderProps {
  children?: any;
  dispatch?: any;
  filterSxProps?: any;
  getFilterTooltips?: (currentFilters: { [key: string]: string }) => string[];
  hiddenFilters: { [key: string]: string };
  testId?: string;
  visibleFilters?: inputFilterType[];
  setIsFilterVisible: any;
  isFilterVisible: boolean;
}

/**
 * React context for pagination filters
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const PaginationFiltersContextProvider: any = (
  props: tProviderProps,
) => {
  const {
    children,
    filterSxProps,
    getFilterTooltips,
    testId = '',
    visibleFilters = defaultInputFilters,
    hiddenFilters,
  } = props;
  const pageFiltersSel = useSelector(pageFilters);
  const pageSettingsSel = useSelector(pageSettings);
  const dispatch: any = useDispatch();

  /**
   * Determines if the given value represents the "default - Any" value
   * @param {*} value Current value (for multi-select this is an array)
   * @returns
   */
  const isDefaultUndefinedFilter = (value: any) => {
    return (
      value === defaultUndefinedOptionLabel ||
      (Array.isArray(value) &&
        value.length > 0 &&
        value[0] === defaultUndefinedOptionLabel)
    );
  };

  const getDefaultPageSettingValue = (
    property: string,
    defaultVal: any,
  ): any => {
    if (
      testId &&
      pageSettingsSel &&
      Object.prototype.hasOwnProperty.call(pageSettingsSel, testId) &&
      Object.prototype.hasOwnProperty.call(pageSettingsSel[testId], property)
    ) {
      return pageSettingsSel[testId][property];
    }
    return defaultVal;
  };

  //Merge hidden filter values with visible filter defaults
  const initValues: LooseObject = { ...hiddenFilters };
  for (let i = 0; i < visibleFilters.length; i++) {
    const key = visibleFilters[i].key;
    if (!isDefaultUndefinedFilter(visibleFilters[i].default)) {
      initValues[key] = visibleFilters[i].default;
    }
  }

  //Merge persisted redux filters selected by testId
  if (Object.prototype.hasOwnProperty.call(pageFiltersSel, testId)) {
    for (const [key, value] of Object.entries(pageFiltersSel[testId])) {
      initValues[key] = value;
    }
  }

  // Get Initial Page Number Value
  const initialPage = getDefaultPageSettingValue(pageProperty, 0);

  // Get Initial Filter Visibility Setting
  const initialVisibility = getDefaultPageSettingValue(
    visibilityProperty,
    false,
  );

  // Get Initial Rows Per Page Setting
  const initialRowsPerPage = getDefaultPageSettingValue(rowsPerPageProperty, 0);

  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [isFilterVisible, setIsFilterVisible] = useState(initialVisibility);
  const [isFiltersInit, setIsFiltersInit] = useState(false);
  const [resetPageFlag, setResetPageFlag] = useState(false);
  const [filterValues, setFilterValues] = useState({ ...initValues });

  const localFilterValues = useRef<any>({ ...initValues });

  // Time out for applying delayed filters like search
  const notifyTimeout = useRef<NodeJS.Timeout>();

  /**
   * Each time a filter character is typed, reset timer
   * Timeout causes page to load with new filters
   */
  const delayApply = useCallback(() => {
    if (Object.keys(localFilterValues.current).length > 0) {
      if (notifyTimeout.current !== undefined) {
        clearTimeout(notifyTimeout.current);
      }
      notifyTimeout.current = setTimeout(() => {
        if (testId) {
          dispatch(
            setPageFilters({
              property: testId,
              value: localFilterValues.current,
            }),
          );
          //reset page when delayed filter applied
          dispatch(
            setPageSettings({
              topic: testId,
              property: pageProperty,
              value: 0,
            }),
          );
        }
        //update filters passed to query
        setFilterValues(localFilterValues.current);
        //trigger render
        setResetPageFlag(!resetPageFlag);
      }, 500);
    }
  }, [resetPageFlag, dispatch, testId]);

  /**
   * Creates a tooltip for the filters button that indicates how many filters are in use and what they are
   */
  const filterTooltip = useMemo(() => {
    if (getFilterTooltips) {
      return getFilterTooltips(filterValues);
    }

    const defaultTooltips: string[] = [];

    if (
      Object.prototype.hasOwnProperty.call(
        filterValues,
        defaultMetadataTags.key,
      ) &&
      filterValues[defaultMetadataTags.key].length > 0
    ) {
      defaultTooltips.push(`Tags: ${filterValues[defaultMetadataTags.key]}`);
    }
    if (
      Object.prototype.hasOwnProperty.call(filterValues, defaultSearch.key) &&
      filterValues[defaultSearch.key].length > 0
    ) {
      defaultTooltips.push(`Search: ${filterValues[defaultSearch.key]}`);
    }
    if (
      Object.prototype.hasOwnProperty.call(
        filterValues,
        authoredByMeFilter.key,
      ) &&
      filterValues[authoredByMeFilter.key] === 'true'
    ) {
      defaultTooltips.push(authoredByMeFilter.label);
    }
    if (
      Object.prototype.hasOwnProperty.call(filterValues, uuidFilter.key) &&
      filterValues[uuidFilter.key].length > 0
    ) {
      defaultTooltips.push(
        `{${uuidFilter.label}}: ${filterValues[uuidFilter.key]}`,
      );
    }
    // CPE fields are on several topic pages - so handling checks here
    const cpeFilterTooltips = getCpeFiltersTooltips(filterValues);
    if (cpeFilterTooltips.length > 0) {
      defaultTooltips.push(...cpeFilterTooltips);
    }
    return defaultTooltips;
  }, [filterValues]);

  /**
   * Handles filter change
   * @param key
   * @param value
   * @param immediate
   * @param triggerResetPage
   * @returns
   */
  const onInputFilterChange = (
    key: string,
    value: string | string[],
    immediate: boolean,
    triggerResetPage: boolean,
  ) => {
    let newFilterValue = value;
    // handle special cases for multi-select
    // if ANY (defaultUndefinedOptionLabel) is selected AND there are other selections
    //   (newFilterValue.length > 1)
    //  - reset list to ANY if that's what is being added (position of ANY > 0)
    //  - or take Any out of the list when others are added after ANY (position of ANY = 0)
    if (Array.isArray(value)) {
      if (newFilterValue.length === 0) {
        newFilterValue = [defaultUndefinedOptionLabel];
      } else if (newFilterValue.length > 1) {
        if (value.indexOf(defaultUndefinedOptionLabel) > 0) {
          // resetting to Any
          newFilterValue = [defaultUndefinedOptionLabel];
        } else {
          // take Any out of the list if it's in first position
          newFilterValue = value.filter(
            (item: string) => item !== defaultUndefinedOptionLabel,
          );
        }
      }
    }

    localFilterValues.current = {
      ...localFilterValues.current,
      [key]: newFilterValue,
    };

    if (immediate) {
      if (notifyTimeout.current !== undefined) {
        clearTimeout(notifyTimeout.current);
      }
      if (isDefaultUndefinedFilter(newFilterValue)) {
        if (
          Object.prototype.hasOwnProperty.call(localFilterValues.current, key)
        ) {
          delete localFilterValues.current[key];
        }
      }
      if (testId) {
        dispatch(
          setPageFilters({
            property: testId,
            value: localFilterValues.current,
          }),
        );
      }
      //update filters passed to query
      setFilterValues(localFilterValues.current);
      //triggers render
      if (triggerResetPage) {
        setResetPageFlag(!resetPageFlag);
      }
      return;
    }
    delayApply();
  };

  const onPageNumberChange = (pageNumber: number) => {
    if (notifyTimeout.current !== undefined) {
      clearTimeout(notifyTimeout.current);
    }

    if (testId) {
      dispatch(
        setPageSettings({
          topic: testId,
          property: pageProperty,
          value: pageNumber,
        }),
      );
    }
  };

  const onRowsPerPageChange = (numRowsPerPage: number) => {
    setRowsPerPage(numRowsPerPage);
    if (testId) {
      dispatch(
        setPageSettings({
          topic: testId,
          property: rowsPerPageProperty,
          value: numRowsPerPage,
        }),
      );
    }
  };

  const onVisibilityChange = (isVisible: boolean) => {
    setIsFilterVisible(isVisible);
    if (testId) {
      dispatch(
        setPageSettings({
          topic: testId,
          property: visibilityProperty,
          value: isVisible,
        }),
      );
    }
  };

  /**
   * Cleans Up Timeout
   */
  useEffect(() => {
    return () => {
      if (notifyTimeout.current !== undefined) {
        clearTimeout(notifyTimeout.current);
      }
    };
  }, []);

  return (
    <PaginationFiltersContext.Provider
      value={{
        filterSxProps: filterSxProps,
        filterValues: filterValues,
        filterTooltip: filterTooltip,
        resetPageFlag: resetPageFlag,
        visibleFilters: visibleFilters,
        onInputFilterChange: onInputFilterChange,
        onPageNumberChange: onPageNumberChange,
        onRowsPerPageChange: onRowsPerPageChange,
        onVisibilityChange: onVisibilityChange,
        initialPage: initialPage,
        initialRowsPerPage: initialRowsPerPage,
        isFilterVisible: isFilterVisible,
        isFiltersInit: isFiltersInit,
        setIsFiltersInit: setIsFiltersInit,
        rowsPerPage: rowsPerPage,
      }}
    >
      {children}
    </PaginationFiltersContext.Provider>
  );
};
