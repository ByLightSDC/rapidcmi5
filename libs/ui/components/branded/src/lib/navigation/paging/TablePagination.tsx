/* Branded */
import { ButtonTooltip } from '@rangeos-nx/ui/branded';

/* MUI */
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
const rowsPerPageLabel = 'Rows Per Page';

export interface TablePaginationProps {
  id?: string;
  label?: string;
  labelHeight?: string | number;
  page: number; // 0-based
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (page: any) => void;
}

export function TablePaginationUi({
  id = 'table-pagination',
  label = '',
  labelHeight = '32px',
  page,
  rowsPerPage,
  rowsPerPageOptions,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  if (!rowsPerPageOptions) {
    rowsPerPageOptions = [rowsPerPage];
  }

  return (
    <Box
      data-testid="table-pagination-ui"
      sx={{
        borderTop: '1px solid #80808040',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        height: labelHeight,
      }}
    >
      <TablePagination
        sx={{
          '.MuiTablePagination-displayedRows': {
            margin: '0px',
          },
          '.MuiToolbar-root': {
            minHeight: labelHeight,
          },
          '.MuiTablePagination-selectLabel': {
            fontSize: '12px',
            height: labelHeight,
            paddingTop: '2px',
          },
          '.MuiTablePagination-actions': {
            display: 'flex',
          },
          color: 'text.hint',
          display: 'flex',
          overflow: 'hidden',
          height: '100%',
        }}
        component={'div'}
        count={totalCount}
        data-testid={id + '-table-pagination'}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        labelDisplayedRows={({ from, to, count }) =>
          //REF `${label} ${from}-${to} of ${count}`
          // When totalCount is -1, that indicates the server does not know the actual total count.
          // For example, keycloak users.
          count >= 0 ? `${from}-${to} of ${count}` : `${from}-${to}`
        }
        labelRowsPerPage={rowsPerPageLabel}
        backIconButtonProps={{
          sx: {
            color: 'primary.main',
          },
        }}
        nextIconButtonProps={{
          sx: {
            color: 'primary.main',
          },
        }}
        onClick={(event) => {
          event?.stopPropagation(); // to handle nested page lists
        }}
        onPageChange={(event, page: number) => {
          event?.stopPropagation(); // to handle nested page lists
          onPageChange(page);
        }}
        onRowsPerPageChange={(event) => {
          event?.stopPropagation(); // to handle nested page lists
          onRowsPerPageChange(event?.target?.value);
        }}
      />
    </Box>
  );
}

export default TablePaginationUi;
