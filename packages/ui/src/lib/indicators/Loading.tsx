/* MUI */
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { styled, SxProps } from '@mui/material';

type tLoadingUiProps = {
  message?: string;
  sxProps?: SxProps;
};

const StyledProgress = styled(CircularProgress)(
  ({ theme }: { theme: any }) => ({
    color: theme.header.title,
    height: '100%',
    margin: 1,
    marginRight: 8,
  }),
);

const StyledTypography = styled(Typography)(({ theme }: { theme: any }) => ({
  color: theme.header.title,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

export function LoadingUi(props: tLoadingUiProps) {
  const { message = 'Loading ...', sxProps = {} } = props;

  return (
    <Box
      sx={{
        margin: '0px',
        padding: '6px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        height: '64px',
        alignItems: 'center',
        ...sxProps,
      }}
    >
      <StyledProgress size={16} />
      <StyledTypography variant="h6" className="loading-text">
        {message}
      </StyledTypography>
    </Box>
  );
}
