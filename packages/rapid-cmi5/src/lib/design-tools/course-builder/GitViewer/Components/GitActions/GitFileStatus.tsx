import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  styled,
  Button,
  Stack,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  FileStatus,
  isDeletedStatus,
  stagedStatuses,
} from '../../utils/StatusMatrix';
import path from 'path-browserify';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useState } from 'react';

export interface ModifiedFile {
  name: string;
  status: FileStatus;
  hasMergeConflict?: boolean;
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    placement="right-end"
    arrow
    classes={{ popper: className }}
    {...props}
  />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});

const statusLabels: Record<FileStatus, string> = {
  untracked: 'Untracked',
  added: 'Added',
  added_with_changes: 'Added (Unstaged Changes)',
  unmodified: 'Unmodified',
  modified: 'Modified',
  staged: 'Staged',
  staged_with_changes: 'Staged (Unstaged Changes)',
  deleted_unstaged: 'Deleted',
  deleted_staged: 'Deleted',
  deleted_staged_with_changes: 'Deleted (Staged, Modified)',
  deleted_staged_with_rename: 'Deleted (Staged, Renamed)',
  unknown: 'Unknown',
};

const statusMap: Record<
  FileStatus,
  { color: 'default' | 'success' | 'warning' | 'error' | 'info' }
> = {
  untracked: { color: 'default' },
  added: { color: 'success' },
  added_with_changes: { color: 'warning' },
  unmodified: { color: 'default' },
  modified: { color: 'warning' },
  staged: { color: 'success' },
  staged_with_changes: { color: 'warning' },
  deleted_unstaged: { color: 'error' },
  deleted_staged: { color: 'success' },
  deleted_staged_with_changes: { color: 'warning' },
  deleted_staged_with_rename: { color: 'success' },
  unknown: { color: 'default' },
};

const getStatusChip = (status: FileStatus) => (
  <Chip
    sx={{ fontSize: '0.75rem', height: 'auto', padding: '2px 4px' }}
    label={statusLabels[status]}
    color={statusMap[status].color}
  />
);

export const gitTableCellHeaderStyle = {
  fontWeight: 'bold',
  py: 1,
  lineHeight: 1,
};

export default function GitFileStatus({
  modifiedFiles,
  handleStageAll,
  handleUnstageAll,
  handeleStageFile,
  handeleUnStageFile,
  handleRevertFile,
  handleRemoveFile,
  handleGetDiff,
  handleNavToFile,
  gettingRepoStatus,
}: {
  modifiedFiles: ModifiedFile[];
  handleStageAll?: () => Promise<void>;
  handleUnstageAll?: () => void;
  handeleStageFile?: (filepath: string) => void;
  handeleUnStageFile?: (filepath: string) => void;
  handleRevertFile?: (filepath: string) => Promise<void>;
  handleRemoveFile?: (filepath: string) => void;
  handleNavToFile?: (filepath: string) => void;
  handleGetDiff?: (
    filepath: string,
  ) => Promise<{ oldFile: string; newFile: string }>;
  gettingRepoStatus: boolean;
}) {
  const [shouldStageAll, setShouldStageAll] = useState(false);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: '100%',
        maxHeight: '80vh',
        minHeight: 250,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mt: 3,
        overflowY: 'auto',
      }}
    >
      {gettingRepoStatus && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1.5,
            px: 2.5,
            backgroundColor: 'primary.lighter',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CircularProgress size={18} thickness={4} />
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            Calculating repository status...
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {handleStageAll && handleUnstageAll && (
          <Checkbox
            size="small"
            checked={shouldStageAll}
            disabled={modifiedFiles.length <= 0 || gettingRepoStatus}
            onChange={(event, value) => {
              setShouldStageAll(value);
              if (value) {
                handleStageAll();
              } else {
                handleUnstageAll();
              }
            }}
          />
        )}
        <Typography variant="body2" fontWeight={500} ml={0.5}>
          Stage All Changes
        </Typography>
        {modifiedFiles.length > 0 && (
          <Chip
            size="small"
            label={modifiedFiles.length}
            sx={{ ml: 1.5, height: 22, fontSize: '0.75rem' }}
          />
        )}
      </Box>

      <Table stickyHeader sx={{ width: '100%' }}>
        <TableHead
          sx={{
            '& .MuiTableCell-root': {
              backgroundColor: 'background.paper',
            },
          }}
        >
          {' '}
          <TableRow>
            {handeleStageFile && handeleUnStageFile && (
              <TableCell sx={{ ...gitTableCellHeaderStyle, width: '60px' }}>
                Stage
              </TableCell>
            )}
            <TableCell sx={{ ...gitTableCellHeaderStyle, width: '25%' }}>
              File Name
            </TableCell>
            <TableCell sx={{ ...gitTableCellHeaderStyle, width: '35%' }}>
              File Path
            </TableCell>
            <TableCell
              sx={{
                ...gitTableCellHeaderStyle,
                width: '20%',
                textAlign: 'center',
              }}
            >
              Status
            </TableCell>
            <TableCell
              sx={{
                ...gitTableCellHeaderStyle,
                width: '20%',
                textAlign: 'right',
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modifiedFiles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                align="center"
                sx={{ py: 8, borderBottom: 'none' }}
              >
                <Typography variant="body2" color="text.secondary">
                  {gettingRepoStatus
                    ? 'Loading changes...'
                    : 'No changes found'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            modifiedFiles.map((file, index) => {
              const deleted = isDeletedStatus(file.status);
              const isUntracked =
                file.status === 'untracked' || file.status === 'added';

              return (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    '&:last-child td': { borderBottom: 'none' },
                    opacity: gettingRepoStatus ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {handeleStageFile && handeleUnStageFile && (
                    <TableCell sx={{ py: 1.5 }}>
                      <Checkbox
                        size="small"
                        checked={stagedStatuses.includes(file.status)}
                        disabled={gettingRepoStatus}
                        onChange={(event, value) => {
                          if (value) {
                            handeleStageFile(file.name);
                          } else {
                            handeleUnStageFile(file.name);
                          }
                        }}
                      />
                    </TableCell>
                  )}

                  <TableCell sx={{ py: 1.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        textDecoration: deleted ? 'line-through' : 'none',
                        color: deleted ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {path.basename(file.name)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ py: 1.5 }}>
                    <NoMaxWidthTooltip title={file.name}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '400px',
                          textDecoration: deleted ? 'line-through' : 'none',
                        }}
                      >
                        {file.name}
                      </Typography>
                    </NoMaxWidthTooltip>
                  </TableCell>

                  <TableCell sx={{ py: 1.5, textAlign: 'center' }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      flexWrap="wrap"
                    >
                      {getStatusChip(file.status)}
                      {file.hasMergeConflict && (
                        <Chip
                          size="small"
                          label="Merge Conflict"
                          color="error"
                          onClick={() => handleNavToFile?.(file.name)}
                          sx={{ cursor: 'pointer' }}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                    {handleRemoveFile && handleRevertFile && (
                      <Button
                        variant="outlined"
                        size="small"
                        color={isUntracked ? 'error' : 'primary'}
                        disabled={gettingRepoStatus}
                        sx={{
                          textTransform: 'none',
                          minWidth: 'auto',
                        }}
                        startIcon={
                          isUntracked ? <DeleteOutlineIcon /> : <RestoreIcon />
                        }
                        onClick={() =>
                          isUntracked
                            ? handleRemoveFile(file.name)
                            : handleRevertFile(file.name)
                        }
                      >
                        {isUntracked ? 'Remove' : 'Revert'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
