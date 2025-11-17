import { Box, SxProps } from '@mui/material';

/**
 * Editor Menu Wrapper
 * @param param0
 * @returns
 */
function RightMenuContainer({
  sxProps,
  children,
}: {
  children?: JSX.Element | JSX.Element[] | null;
  sxProps?: SxProps;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        right: 0,
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        ...sxProps,
      }}
    >
      {children}
    </Box>
  );
}
export default RightMenuContainer;
