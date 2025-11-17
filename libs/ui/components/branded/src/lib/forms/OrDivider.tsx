/* MUI */
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

/**
 * @typedef tFieldProps
 * @property {number} [gridItemWSize=12] Override size for grid item
 * @property {boolean} shouldShow Whether field should be shown
 * @property {*} [typographyStyleProps = { margin: '0px', padding: '0px', paddingLeft: '24px' }] Overrides for styling props
 * @property {boolean} isOptionStack Whether options will be appear in a stack
 *
 * */
type tFieldProps = {
  applyGridSize?: boolean;
  gridItemSize?: number;
  shouldShow: boolean;
  typographyStyleProps?: any;
  isOptionStack?: boolean;
};

/**
 * OrDIvider component encapsulates showing the -- OR -- between items which can be selected
 * @param {tFieldProps} props
 * @returns {React.ReactElement}
 */
export function OrDivider(props: tFieldProps) {
  const {
    isOptionStack = true,
    applyGridSize = true,
    gridItemSize = 12,
    shouldShow,
    typographyStyleProps = {
      fontWeight: 700,
      height: '24px',
      width: '100%',
      //paddingRight: isOptionStack ? '8px' : '0px',
    },
  } = props;
  if (shouldShow) {
    if (gridItemSize) {
      return (
        <Grid
          item
          xs={applyGridSize ? gridItemSize : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography
            align={isOptionStack ? 'right' : 'center'}
            color="primary"
            variant="body2"
            sx={typographyStyleProps}
          >
            OR
          </Typography>
        </Grid>
      );
    }
    return (
      <Typography color="primary" variant="body2" sx={typographyStyleProps}>
        OR
      </Typography>
    );
  }
  return null;
}
export default OrDivider;
