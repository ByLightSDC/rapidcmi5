import { alpha, Box, useTheme } from '@mui/material';
import { MouseEvent } from 'react';
import { CustomTheme } from '../../styles/createPalette';

/**
 * A skiplink component that enables a hidden link to appear on tab.
 * This means both a screen reader AND a sighted tab user will have it accessible
 * @returns skiplink component
 */
export default function SkipLink() {
  const theme: CustomTheme = useTheme();
  const { palette } = theme;

  // Click handler because browser will scroll to target with just href, but we also
  //want to move the keyboard focus
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Prevent native fragment navigation so it can't fight our explicit
    // focus call, otherwise it loops back.
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  };

  return (
    <Box
      component="a"
      href="#main-content"
      onClick={handleClick}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translateY(-100%)',
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: alpha(palette.background.paper, 0.9),
        border: `1px solid ${theme.input.outlineColor}`,
        transition: 'transform 0.2s ease-in-out',
        // a:visited/a:hover in styles.css out-specificity a plain sx class
        // (element + pseudo-class beats a single class), and the contrast on visited
        // was very poor. So override.
        '&, &:link, &:visited, &:hover, &:active': {
          color: palette.text.primary,
        },
        '&:focus': {
          transform: 'translateY(0)',
        },
      }}
    >
      Skip to main content
    </Box>
  );
}
