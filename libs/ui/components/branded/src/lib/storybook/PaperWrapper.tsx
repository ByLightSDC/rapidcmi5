import { Box } from '@mui/material';

/**
 *
 * @param param0 Wraps storybook components with white or black background depending on current theme
 * @returns
 */
export function PaperWrapper({
  children,
  isContrast,
  isWhite,
}: {
  children?: any;
  isContrast?: boolean;
  isWhite?: boolean;
}) {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        minHeight: '180px',
        width: '100%',
        height: '100%',
        padding: '24px',
        margin: 0,
      }}
    >
      {children}
    </Box>
  );
}
