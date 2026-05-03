import { IconButton, Tooltip, Typography } from '@mui/material';
import { type Variant } from '@mui/material/styles/createTypography';
import { useContext, useState } from 'react';
import {
  type inputFilterType,
  PaginationFiltersContext,
} from './PaginationFiltersContext';

import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
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
    inputFilter,
    filterValue,
    title = 'Title',
    variant = 'caption',
  } = props;

  const [sortOrder] = useState('');
  const { onInputFilterChange } = useContext(
    PaginationFiltersContext,
  );


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
