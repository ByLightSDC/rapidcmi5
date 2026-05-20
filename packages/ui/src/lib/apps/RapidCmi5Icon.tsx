import { useTheme } from '@mui/material';
import { darkTheme } from '../styles/muiThemeDark';

/**
 * RapidCMI5 Book + bolt icon
 */
export function RapidCmi5Icon({
  isDarkThemeOnly = false,
}: {
  isDarkThemeOnly?: boolean;
}) {
  const theme = useTheme();

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 210 194"
      height={21.85}
      width={23}
      fill={
        isDarkThemeOnly
          ? darkTheme.palette['primary'].contrastText
          : theme.palette.primary.main
      }
    >
      <path d="m119.64,176.34L16.56,107.92v-11.94l99.11,24.72L197.5,5.24,75.61,0,0,94.35v20.14l123.69,79.51,72.07-100.94-17.33-2.74-58.78,86.02ZM99.42,20.32h32.02l-20.47,29.24h16.93l-51.96,50.04,13.52-37.35h-19.38l29.36-41.92Z" />
    </svg>
  );
}
export default RapidCmi5Icon;