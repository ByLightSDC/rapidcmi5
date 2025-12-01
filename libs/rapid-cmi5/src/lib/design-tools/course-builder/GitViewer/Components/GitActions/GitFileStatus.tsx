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
} from '@mui/material';
import {
  FileStatus,
  isDeletedStatus,
  stagedStatuses,
} from '../../utils/StatusMatrix';
import path from 'path-browserify';
import RestoreIcon from '@mui/icons-material/Restore';
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
}) {
  const [shouldStageAll, setShouldStageAll] = useState(false);

  // we will use this later for diff view

  // const [oldFile, setOldFile] = useState('');
  // const [newFile, setNewFile] = useState('');

  // const getDiff = async (file: string) => {
  //   if (!handleGetDiff) return;
  //   const files = await handleGetDiff(file);
  //   setOldFile(files.oldFile);
  //   setNewFile(files.newFile);
  // };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          height: 'auto',
          minHeight: 300,
          borderRadius: 2,
          padding: 2,
          mt: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height: '52px',
            verticalAlign: 'middle',
          }}
        >
          {handleStageAll && handleUnstageAll && (
            <Checkbox
              sx={{ color: 'primary.main' }}
              key="stage-all"
              id="stage-all"
              aria-label="Toggle Stage All"
              checked={shouldStageAll}
              disabled={modifiedFiles.length <= 0}
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
          <Typography variant="body2">Stage All Changes</Typography>
        </Box>
        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              {handeleStageFile && handeleUnStageFile && (
                <TableCell sx={gitTableCellHeaderStyle}>
                  <Typography fontWeight="bold" fontSize="0.875rem">
                    Stage
                  </Typography>
                </TableCell>
              )}

              <TableCell sx={gitTableCellHeaderStyle}>
                <Typography fontWeight="bold" fontSize="0.875rem">
                  File Name
                </Typography>
              </TableCell>
              <TableCell sx={gitTableCellHeaderStyle}>
                <Typography fontWeight="bold" fontSize="0.875rem">
                  File Path
                </Typography>
              </TableCell>
              <TableCell
                sx={{ ...gitTableCellHeaderStyle, textAlign: 'center' }}
              >
                <Typography fontWeight="bold" fontSize="0.875rem">
                  Status
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modifiedFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No changes found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              modifiedFiles.map((file, index) => {
                const deleted = isDeletedStatus(file.status);
                return (
                  <>
                    <TableRow key={index} hover sx={{ borderBottom: 'none' }}>
                      {handeleStageFile && handeleUnStageFile && (
                        <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>
                          <Checkbox
                            sx={{ color: 'primary.main' }}
                            key="stage-all"
                            id="stage-all"
                            aria-label="Toggle Stage All"
                            checked={stagedStatuses.includes(file.status)}
                            disabled={false}
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

                      <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>
                        <Typography
                          fontWeight="medium"
                          fontSize="0.875rem"
                          sx={{
                            textDecoration: deleted ? 'line-through' : 'none',
                          }}
                        >
                          {path.basename(file.name)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>
                        <NoMaxWidthTooltip title={file.name}>
                          <Typography
                            fontSize="0.8rem"
                            color="text.secondary"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '300px',
                              textDecoration: deleted ? 'line-through' : 'none',
                            }}
                          >
                            {file.name}
                          </Typography>
                        </NoMaxWidthTooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: 'none',
                          py: 0.5,
                          textAlign: 'center',
                        }}
                      >
                        <Stack direction="column" spacing={1.2} flexWrap="wrap">
                          {getStatusChip(file.status)}
                          {file.hasMergeConflict && (
                            <Chip
                              onClick={() => handleNavToFile?.(file.name)}
                              sx={{
                                fontSize: '0.75rem',
                                height: 'auto',
                                padding: '2px 4px',
                              }}
                              label="Merge Conflict"
                              color="error"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>
                        <Stack direction="row" spacing={1.2} flexWrap="wrap">
                          {handleRemoveFile && handleRevertFile && (
                            <Tooltip
                              title={
                                file.status === 'untracked' ||
                                file.status === 'added'
                                  ? 'Remove file from Repo'
                                  : 'Restore file from last commit'
                              }
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                sx={{
                                  textTransform: 'none',
                                  px: 1,
                                  fontSize: '0.75rem',
                                }}
                                startIcon={<RestoreIcon />}
                                onClick={() =>
                                  file.status === 'untracked' ||
                                  file.status === 'added'
                                    ? handleRemoveFile(file.name)
                                    : handleRevertFile(file.name)
                                }
                              >
                                {file.status === 'untracked' ||
                                file.status === 'added'
                                  ? 'Remove'
                                  : 'Revert'}
                              </Button>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>

                      {/* <TableCell sx={{ borderBottom: 'none', py: 0.5 }}>
                        <Stack direction="row" spacing={1.2} flexWrap="wrap">
                          {handleGetDiff && (
                            <Tooltip
                              title={
                                file.status === 'untracked' ||
                                file.status === 'added'
                                  ? 'Remove file from Repo'
                                  : 'Restore file from last commit'
                              }
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                sx={{
                                  textTransform: 'none',
                                  px: 1,
                                  fontSize: '0.75rem',
                                }}
                                startIcon={<RestoreIcon />}
                                onClick={() => getDiff(file.name)}
                              >
                                Get Diff
                              </Button>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell> */}
                    </TableRow>
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* {newFile && oldFile && (
        <MonacoDiff modified={newFile} original={oldFile}></MonacoDiff>
      )} */}
    </>
  );
}
