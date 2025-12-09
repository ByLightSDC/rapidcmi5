/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect } from 'react';

import {
  PaginationFiltersContext,
  inputFilterType,
} from './PaginationFiltersContext';

import {
  defaultUndefinedOptionLabel,
  paginationFiltersConfig,
} from './paginationFiltersConstants';

/* MUI */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/* Icon */
import FilterListIcon from '@mui/icons-material/FilterList';
import Checkbox from '@mui/material/Checkbox';
import { ButtonTooltip, ButtonIcon } from '@rangeos-nx/ui/api/hooks';
import { useDisplayFocus } from '../../hooks/useDisplayFocus';
import { SelectorMainUi } from '../../inputs/selectors/selectors';
import { TextFieldMainUi } from '../../inputs/textfields/textfields';

/**
 * @typedef {Object} PaginationFilterProps
 * @property {string} [children] Children to present to the right of the filters
 * @property {string} [title] Title to present to the left of the filters
 * @property {string} [titleChildren] Title elements to present to the left of the filters
 * @property {{ [key: string]: string }} [hiddenFilters] Filter keys and values that are hidden to the user
 * @property {inputFilterType[]} [inputFilters] List of interactable filters to present to the user
 */
type PaginationFilterProps = {
  children?: JSX.Element | undefined;
  title?: string;
  titleChildren?: JSX.Element;
  hiddenFilters?: { [key: string]: string };
  inputFilters?: inputFilterType[];
};

/**
 * Presents row of interactable filters for paginated data
 * Gets and sets filter values in the context
 * @see PaginationFiltersContext
 * @param {PaginationFilterProps} Component props
 * @return {JSX.Element} React component
 */
export function PaginationFilters(props: PaginationFilterProps) {
  const { children, title, titleChildren } = props;
  const {
    filterValues,
    filterTooltip,
    isFilterVisible,
    setIsFiltersInit,
    onVisibilityChange,
    visibleFilters,
    onInputFilterChange,
  } = useContext(PaginationFiltersContext);

  const focusHelper = useDisplayFocus();

  const onSetFilter = (
    key: string,
    value: string | string[],
    isImmediate: boolean,
    triggerResetPage: boolean,
  ) => {
    if (onInputFilterChange) {
      onInputFilterChange(key, value, isImmediate, triggerResetPage);
    }
  };

  const getFilterCurrentValueOrDefault = (
    key: string,
    defaultVal?: string | string[],
    multipleSelect = false,
  ) => {
    if (filterValues.hasOwnProperty(key)) {
      return filterValues[key];
    }
    return defaultVal || multipleSelect ? [defaultUndefinedOptionLabel] : '';
  };

  const onToggleFilterVisibility = (event: any) => {
    if (onVisibilityChange) {
      event.stopPropagation();
      onVisibilityChange(!isFilterVisible);
    }
  };

  useEffect(() => {
    if (setIsFiltersInit) {
      setIsFiltersInit(true);
    }
  }, []);

  useEffect(() => {
    if (paginationFiltersConfig.currentFilter.length > 0) {
      focusHelper.focusOnElementById(paginationFiltersConfig.currentFilter);
    }
  }, [paginationFiltersConfig.currentFilter]);

  return (
    <div
      id="pagination-filters" // so parent can get height whether filters are open or not
      onClick={(event) => {
        event?.stopPropagation();
      }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end', //controls whether create and filters button left side or right side
        alignItems: 'center', //controls how filter button and create align vertically
        //not needed height: 'auto', //this cant be 100%
      }}
      //jC is horiz
      //       //backgroundColor:'pink',
      //       //width: '100%', //MG not sure what this does
      //       alignItems: alignFilterButton, //align filter button top
      //       padding: '2px', //prevent filter button hover clipping
    >
      <div
        style={
          {
            //not needed display: 'flex',
            //this can't apply because parent doesn't have h 100% justifyContent: 'flex-end',
          }
        }
      >
        {titleChildren}
      </div>
      <Typography
        sx={{
          minWidth: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          //this div is full width
          justifyContent: 'flex-end',
          display: 'flex',
          flexDirection: 'row',
          flexGrow: '1',
          // flexWrap: 'wrap',
          //not needed maxWidth:'100%'
        }}
      >
        {isFilterVisible && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              borderRadius: '10px',
              padding: '6px',
              //optional
              justifyContent: 'flex-start', //input filters align right inside blue area
              marginBottom: '12px',
              backgroundColor: (theme: any) => theme.card.formInstructionsColor,
              flexWrap: 'wrap',
              height: 'auto',
            }}
          >
            {visibleFilters.map((inputFilter: inputFilterType) => {
              const filter = getFilterCurrentValueOrDefault(
                inputFilter.key,
                inputFilter.default,
                inputFilter.multiple,
              );
              return (
                <React.Fragment key={inputFilter.key}>
                  {inputFilter.options && (
                    <SelectorMainUi
                      key={inputFilter.key}
                      id={inputFilter.key}
                      defaultValue={filter}
                      disabled={inputFilter.isDisabled || false}
                      label={inputFilter.label}
                      SelectProps={{ multiple: inputFilter.multiple }}
                      options={inputFilter.options}
                      onSelect={(selVal) => {
                        onSetFilter(
                          inputFilter.key,
                          selVal,
                          true,
                          inputFilter.triggerPageReset || false,
                        );
                      }}
                      divProps={inputFilter.divProps}
                      sxProps={{
                        margin: '4px',
                        marginTop: '8px',
                        padding: '0px',
                      }}
                      sxInputProps={{ margin: 'none', padding: 'none' }}
                    />
                  )}
                  {inputFilter.isCheckbox && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: '52px',
                        verticalAlign: 'middle',
                      }}
                    >
                      <Checkbox
                        sx={{ color: 'primary.main' }}
                        key={inputFilter.key}
                        id={inputFilter.key}
                        aria-label={inputFilter.label}
                        checked={filter === 'true'}
                        disabled={inputFilter.isDisabled || false}
                        onChange={(event, value) => {
                          onSetFilter(
                            inputFilter.key,
                            value === true ? 'true' : 'false',
                            true,
                            false,
                          );
                        }}
                      />
                      <Typography variant="body2" sx={inputFilter.divProps}>
                        {inputFilter.label}
                      </Typography>
                    </Box>
                  )}
                  {!inputFilter.options && !inputFilter.isCheckbox && (
                    <TextFieldMainUi
                      sxProps={inputFilter.divProps}
                      key={inputFilter.key}
                      id={inputFilter.key}
                      // for multiselect- display array as comma separated strings
                      defaultValue={
                        Array.isArray(filter) ? filter.join(', ') : filter
                      }
                      disabled={inputFilter.isDisabled || false}
                      label={inputFilter.label}
                      placeholder={inputFilter.placeholder}
                      //this causes clear button
                      // type="search"
                      type="text"
                      onBlur={() => {
                        paginationFiltersConfig.currentFilter = '';
                      }}
                      onChange={(textVal) => {
                        paginationFiltersConfig.currentFilter = inputFilter.key;
                        onSetFilter(inputFilter.key, textVal, false, false);
                      }}
                      onEnter={(textVal) => {
                        paginationFiltersConfig.currentFilter = '';
                        onSetFilter(inputFilter.key, textVal, true, true);
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>
      {visibleFilters.length > 0 && (
        <>
          {filterTooltip.length > 0 && (
            <ButtonTooltip
              id="current-filters"
              tooltipProps={{
                placement: 'bottom-end',
              }}
              title={filterTooltip.join(', ')}
            >
              <Typography
                align="center"
                variant="caption"
                sx={{
                  borderColor: 'primary.main',
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  cursor: 'default',
                }}
              >
                {filterTooltip.length}
              </Typography>
            </ButtonTooltip>
          )}
          <ButtonIcon
            id="Filter"
            name="Filter"
            tooltip={isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            props={{
              onClick: onToggleFilterVisibility,
            }}
          >
            <FilterListIcon fontSize="medium" />
          </ButtonIcon>
        </>
      )}
      {/* {titleChildren} */}
      {children}
    </div>
  );
}
export default PaginationFilters;
