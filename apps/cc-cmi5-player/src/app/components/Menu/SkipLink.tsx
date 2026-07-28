import { useTheme } from '@mui/material';
import { MouseEvent } from 'react';
import { CustomTheme } from '../../styles/createPalette';

/**
 * A skiplink component that enables a hidden link to appear on tab.
 * This means both a screen reader AND a sighted tab user will have it accessible
 * @returns skiplink component
 */
export default function SkipLink() {
  const theme: CustomTheme = useTheme();

  // Click handler because browser will scroll to target with just href, but we also
  // want to move the keyboard focus. #main-content has tabIndex={-1} specifically
  // so this manual focus call works.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Prevent native fragment navigation so it can't fight our explicit
    // focus call, otherwise it loops back.
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleClick}
      style={
        {
          '--skip-link-outline-color': theme?.header?.selColor,
        } as React.CSSProperties
      }
    >
      Skip to main content
    </a>
  );
}
