import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import { SxProps } from '@mui/system';

export const numberColor = 'inherit';

export function One({ sx }: { sx?: SxProps }) {
  return (
    <div style={{ color: 'grey' }}>
      <LooksOneIcon color={numberColor} sx={sx} />
    </div>
  );
}

export function Two({ sx }: { sx: SxProps }) {
  return (
    <div style={{ color: 'grey' }}>
      <LooksTwoIcon color={numberColor} sx={sx} />
    </div>
  );
}

export function Three({ sx }: { sx: SxProps }) {
  return (
    <div style={{ color: 'grey' }}>
      <Looks3Icon color={numberColor} sx={sx} />
    </div>
  );
}
