
import {
  IconButton,
  Tooltip,
} from '@mui/material';

import WidthFullIcon from '@mui/icons-material/WidthFull';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

/**
 * Background button with color indicator
 * @param param0 
 * @returns 
 */
export function BackgroundColorTrigger({
  currentColor,
  onTrigger,
}: {
  currentColor: { color: string } | undefined;
  onTrigger: any;
}) {
  return (
    <Tooltip title="Background Color">
      <>
        <IconButton
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            onTrigger(e);
          }}
          size="small"
        >
          <WidthFullIcon
            style={currentColor}
            sx={{
              position: 'relative',
              '& svg': {
                stroke: 'grey', // resolves issue where some text isnt readable against background
                strokeWidth: 1,
              },
            }}
            fontSize="small"
          />
          <ArrowDropDownIcon
            fontSize="small"
            sx={{
              position: 'absolute',
              right: '-8px',
              bottom: '2px',
              display: 'inline-flex',
              padding: 0,
              margin: 0,
              minWidth: 0,
            }}
          />
        </IconButton>
      </>
    </Tooltip>
  );
}
