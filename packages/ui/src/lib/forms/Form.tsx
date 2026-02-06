/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* MUI */
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { SxProps } from '@mui/system';

export function Form({
  title,
  titleEndChildren,
  titleStartIcon,
  subTitle = '',
  formWidth = 640,
  formHeight,
  formButtons,
  formFields,
  instructions = '',
  submitError = '',
  sxProps = {},
  showBorder = true,
  showPaper = true,
  testId = 'form',
  onSubmit,
  onCloseAlert,
}: {
  title?: string;
  titleEndChildren?: JSX.Element;
  titleStartIcon?: JSX.Element;
  subTitle?: string;
  formWidth?: number | string;
  formHeight?: number | string; // limit the height of the form - defaults to "auto"
  formButtons?: any; // any buttons to display
  formFields: any; // grid container / items for any fields to display
  instructions?: string;
  showBorder?: boolean;
  showPaper?: boolean;
  sxProps?: any;
  submitError?: string | JSX.Element;
  testId?: string;
  onSubmit?: (event?: any) => void; // callback for when button of "type=submit" is called - should be one of the buttons above
  onCloseAlert?: () => void; // callback for when a submit error alert is "acknowledged"
}) {
  const sxDisplayProps = {
    color: 'text.secondary',
    width: formWidth,
    height: formHeight || 'auto',
    minHeight: '120px',
    margin: '12px',
    ...sxProps,
  };

  return (
    <FormPaperOrBox
      isPaper={showPaper}
      showBorder={showBorder}
      sxDisplayProps={sxDisplayProps}
    >
      <form className="form" data-testid={testId} onSubmit={onSubmit}>
        <Grid container direction="column" wrap="nowrap" sx={{ width: '100%' }}>
          <Grid size={12}>
            {subTitle && (
              <Grid container sx={{ marginBottom: '12px', width: '100%' }}>
                <Grid size={4.7}>
                  <div className="content-row-icons">
                    {titleStartIcon}
                    {title && (
                      <Typography
                        color="text.primary"
                        className="clipped-text"
                        variant="h4"
                      >
                        {title}
                      </Typography>
                    )}
                    {titleEndChildren}
                  </div>
                </Grid>
                <Grid size={2.6}>
                  <Typography
                    className="clipped-text"
                    variant="h5"
                    sx={{
                      color: (theme: any) => `${theme.breadcrumbs.default}`,
                    }}
                  >
                    {subTitle}
                  </Typography>
                </Grid>
                <Grid size={4.7}></Grid>
              </Grid>
            )}
            {!subTitle && (
              <Grid
                container
                sx={{
                  marginBottom: '12px',
                  width: '100%',
                }}
              >
                <Grid size={12} sx={{ marginBottom: '12px' }}>
                  <div className="content-row-icons">
                    {titleStartIcon}
                    {title && (
                      <Typography
                        color="text.primary"
                        className="clipped-text"
                        variant="h4"
                      >
                        {title}
                      </Typography>
                    )}
                    {titleEndChildren}
                  </div>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid size={12}>
            {instructions && (
              <Typography
                id="instructions"
                sx={{ padding: '4px', color: 'text.hint' }}
                variant="body2"
              >
                {instructions}
              </Typography>
            )}
          </Grid>
        </Grid>

        <div
          className="form-fields-container"
          style={{
            height: sxDisplayProps.height,
            /* this is the height that allows top and bottom of form to remain visible at smallest screen res*/
            minHeight: sxDisplayProps.minHeight ?? '0',
          }}
        >
          {formFields}
        </div>
        <Grid container direction="column" wrap="nowrap" width="100%">
          {submitError && (
            <Alert
              sx={{ width: 'auto' }}
              onClose={() => {
                if (onCloseAlert) {
                  onCloseAlert();
                }
              }}
              severity="error"
            >
              <AlertTitle>Submit Error</AlertTitle>
              {submitError}
            </Alert>
          )}
          <Grid padding={1} size={12} />
          <Grid size={12} sx={{ padding: '0px', margin: '0px', width: '100%' }}>
            <Box id="button-container-right">
              {formButtons ? <>{formButtons}</> : null}
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormPaperOrBox>
  );
}

export default Form;

/**
 * Portal to render Mdx Editor dependent icon in the slide menu
 * @param param0
 * @returns
 */
function FormPaperOrBox({
  isPaper,
  showBorder,
  sxDisplayProps,
  children,
}: {
  isPaper: boolean;
  showBorder: boolean;
  sxDisplayProps: SxProps;
  children: JSX.Element | JSX.Element[];
}) {
  if (!isPaper) {
    return (
      <Box
        className="no-paper-form"
        sx={{
          ...sxDisplayProps,
        }}
      >
        {children}
      </Box>
    );
  }

  const variant = showBorder ? 'outlined' : 'elevation';
  let elevation; // we want it undefined when variant is "outlined" to prevent a console warning
  if (!showBorder) {
    elevation = 0;
  }

  return (
    <Paper
      className="paper-form"
      sx={{
        ...sxDisplayProps,
        backgroundColor: (theme: any) => `${theme.form.backgroundColor}`,
      }}
      elevation={elevation}
      variant={variant}
    >
      {children}
    </Paper>
  );
}
