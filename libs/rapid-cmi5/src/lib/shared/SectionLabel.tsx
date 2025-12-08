import Typography from '@mui/material/Typography';

export default function SectionLabel({
  label,
  sxProps = {},
  variant = 'body1',
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sxProps?: any;
  variant?:
    | 'caption'
    | 'button'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
    | 'overline'
    | undefined;
}) {
  return (
    <Typography
      variant={variant}
      gutterBottom={false}
      sx={{
        textAlign: 'v-mid',
        color: 'text.primary',
        margin: '0px',
        padding: '0px',
        cursor: 'default', // cursor does not change to text edit mode when hovering breadcrumb
        ...sxProps,
      }}
    >
      {label}
    </Typography>
  );
}
