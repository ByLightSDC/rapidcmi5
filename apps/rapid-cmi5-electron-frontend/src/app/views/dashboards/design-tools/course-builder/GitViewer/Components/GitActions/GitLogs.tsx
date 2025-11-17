import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  styled,
  Box,
  Typography,
  Button,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ReadCommitResult } from 'isomorphic-git';
import { gitTableCellHeaderStyle } from './GitFileStatus';

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip placement="right-end" arrow {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
  },
});

const GitLogs = ({
  gitRepoCommits,
  onGitReset,
}: {
  gitRepoCommits: ReadCommitResult[];
  onGitReset: (commitHash: string) => void;
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        //do not set height, let root scroll 
        borderRadius: 2,
        overflowY: 'auto',
        padding: 2,
        mt: 3,
      }}
    >
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <TableCell sx={gitTableCellHeaderStyle}>
              <Typography fontWeight="bold" fontSize="0.875rem">Author</Typography>
            </TableCell>
            <TableCell sx={gitTableCellHeaderStyle}>
              <Typography fontWeight="bold" fontSize="0.875rem">Commit</Typography>
            </TableCell>
            <TableCell sx={gitTableCellHeaderStyle}>
              <Typography fontWeight="bold" fontSize="0.875rem">Message</Typography>
            </TableCell>
            <TableCell sx={gitTableCellHeaderStyle}>
              <Typography fontWeight="bold" fontSize="0.875rem">Date</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {gitRepoCommits.map((commit, index) => {
            const { oid, commit: { author, committer, message } } = commit;
            const shortMessage = message.split('\n')[0];
            const timestampMs = committer.timestamp * 1000;
            const dateStr = new Date(timestampMs).toLocaleDateString();
            const timeStr = new Date(timestampMs).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            return (
              <TableRow key={index} hover sx={{ borderBottom: 'none' }}>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography fontSize="0.875rem" fontWeight="medium">
                    {author.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <NoMaxWidthTooltip title={oid}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        fontSize="0.8rem"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 180,
                        }}
                      >
                        {oid.slice(0, 20) + (oid.length > 20 ? '...' : '')}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={<RestartAltIcon />}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          px: 1,
                          minWidth: 'unset',
                        }}
                        onClick={() => onGitReset(oid)}
                      >
                        Reset
                      </Button>
                    </Box>
                  </NoMaxWidthTooltip>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Tooltip title={message}>
                    <Typography
                      fontSize="0.8rem"
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 250,
                      }}
                    >
                      {shortMessage}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Typography fontSize="0.75rem" color="text.secondary">
                    {dateStr} {timeStr}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GitLogs;
