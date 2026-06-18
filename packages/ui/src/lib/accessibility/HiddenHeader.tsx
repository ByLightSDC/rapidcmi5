import { Typography, TypographyVariant } from '@mui/material';
import { useEffect } from 'react';

export function HiddenHeader({
  header,
  pageTitle,
  variant = 'h1',
}: {
  header?: string;
  pageTitle?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}) {
  /**
   * 2.4.2 Page Titled (Level A) requires that each page has a title that describes its topic or purpose
   */
  useEffect(() => {
    document.title = `${pageTitle || header} | RangeOS`;
  }, [header]);

  if (!header) {
    return null;
  }
  return (
    <Typography
      component={variant}
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {header}
    </Typography>
  );
}

export default HiddenHeader;
