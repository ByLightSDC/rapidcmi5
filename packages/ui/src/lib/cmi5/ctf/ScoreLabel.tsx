import { Box, Typography } from '@mui/material';

/**
 * Score Label
 * @param param0
 * @returns
 */
export function ScoreLabel({
  children,
  label,
  value,
  startIconDisplay,
}: {
  children?: JSX.Element;
  label: string;
  value: string;
  startIconDisplay?: JSX.Element;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        height: '40px',
      }}
    >
      {label && value && (
        <Typography variant="h5" noWrap>
          {label}
        </Typography>
      )}
      {startIconDisplay}

      {label && value && (
        <Typography sx={{ marginLeft: '1px' }} variant="h5">{`:`}</Typography>
      )}
      {value && (
        <Typography
          sx={{ marginLeft: '4px' }}
          variant="h5"
          noWrap
        >{`${value}`}</Typography>
      )}
      {children}
    </Box>
  );
}
export default ScoreLabel;
