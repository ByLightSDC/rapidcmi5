import { IconButton, Tooltip, Typography } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { useContext, useMemo, useState } from 'react';
import {
  inputFilterType,
  PaginationFiltersContext,
} from './PaginationFiltersContext';

import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import SouthIcon from '@mui/icons-material/South';
import StraightIcon from '@mui/icons-material/Straight';
import { defaultSortOrder } from './paginationFiltersConstants';

type SortButtonProps = {
  filterValue: string;
  inputFilter: inputFilterType;
  title?: string;
  variant?: Variant;
  color?: string;
};

/**
 * Column sort button triggers setting filter value
 * Triggers a rerender which triggers API to load
 * @param props
 * @returns
 */
export function SortButton(props: SortButtonProps) {
  const {
    color = 'primary', //to mirror overflowtypography
    inputFilter,
    filterValue,
    title = 'Title',
    variant = 'caption',
  } = props;

  const [sortOrder, setSortOrder] = useState('');
  const { filterValues, onInputFilterChange } = useContext(
    PaginationFiltersContext,
  );

  /**
   * Current Filter
   */
  const filter = useMemo(() => {
    let currentSort = '';
    if (Object.prototype.hasOwnProperty.call(filterValues, inputFilter.key)) {
      currentSort = filterValues[inputFilter.key] as string;
    }

    let currentSortOrderVal = '';
    if (currentSort === filterValue) {
      if (
        Object.prototype.hasOwnProperty.call(filterValues, defaultSortOrder.key)
      ) {
        currentSortOrderVal = filterValues[defaultSortOrder.key] as string;
      }
    }
    setSortOrder(currentSortOrderVal);
  }, [inputFilter, filterValues]);

  const onSetFilter = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (onInputFilterChange) {
      onInputFilterChange(
        inputFilter.key,
        filterValue,
        true,
        inputFilter.triggerPageReset || false,
      );
    }
  };

  const onSetSortOrder = (
    event: React.MouseEvent<HTMLElement>,
    newVal: string,
  ) => {
    event.stopPropagation();
    if (onInputFilterChange) {
      onInputFilterChange(
        defaultSortOrder.key,
        newVal,
        true,
        defaultSortOrder.triggerPageReset || false,
      );
    }
  };

  return (
    <>
      <Typography
        noWrap
        aria-label={title}
        variant={variant}
        color="primary"
        className="clipped-text"
        onClick={onSetFilter}
        sx={{
          cursor: 'pointer',
          paddingRight: '4px', // to prevent running into next column
        }}
      >
        {title}
      </Typography>
      {sortOrder === 'asc' && (
        <IconButton
          size="small"
          aria-label="desc"
          sx={{
            fontSize: 'small',
          }}
          onClick={(e: any) => {
            onSetSortOrder(e, 'desc');
          }}
        >
          <Tooltip
            arrow
            enterDelay={500}
            enterNextDelay={500}
            title="Sort Z -> A"
          >
            <ArrowCircleDownIcon sx={{ fontSize: '18px' }} />
          </Tooltip>
        </IconButton>
      )}
      {sortOrder === 'desc' && (
        <IconButton
          size="small"
          aria-label="asc"
          sx={{
            fontSize: 'small',
          }}
          onClick={(e: any) => {
            onSetSortOrder(e, 'asc');
          }}
        >
          <Tooltip
            arrow
            enterDelay={500}
            enterNextDelay={500}
            title="Sort A -> Z"
          >
            <ArrowCircleUpIcon sx={{ fontSize: '18px' }} />
          </Tooltip>
        </IconButton>
      )}
    </>
  );
}
export default SortButton;
