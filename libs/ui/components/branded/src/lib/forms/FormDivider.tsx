import Divider from '@mui/material/Divider';

/**
 * Provides consistent divider for use in forms
 * @returns JSX.Element for formatted divider
 */
export function FormDivider() {
  return (
    <Divider
      orientation="horizontal"
      variant="fullWidth"
      sx={{
        borderBottomWidth: '4px',
        margin: '4px',
        borderRadius: '12px',
      }}
    />
  );
}
