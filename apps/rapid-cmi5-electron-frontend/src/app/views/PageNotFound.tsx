import { ContentHeader } from '@rangeos-nx/ui/branded';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
  message?: string;
};

export default function PageNotFound(props: Props) {
  return (
    <div id="app-content">
      <ContentHeader title="Page Not Found" />
      <Box sx={{ padding: '12px' }}>
        <Typography sx={{ color: '#d4d2d2' }}>
          {props.message || 'The page you were looking for could not be found.'}
        </Typography>
      </Box>
    </div>
  );
}
