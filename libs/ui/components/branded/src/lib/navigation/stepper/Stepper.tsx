/* eslint-disable-next-line @typescript-eslint/no-explicit-any */

/* MUI */
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stepper, { Orientation } from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Typography from '@mui/material/Typography';

/* Icons */
import ErrorIcon from '@mui/icons-material/Error';

/* Constants */
import {
  defaultHorizontalStepperWidth,
  defaultStepperOrientation,
  defaultVerticalStepperWidth,
} from './constants';
import { Paper } from '@mui/material';

/* eslint-disable-next-line */
export interface StepperProps {
  activeStep?: number;
  labels?: string[];
  steps: string[];
  completed: boolean[];
  disabled: boolean[];
  hasErrors?: boolean[];
  orientation?: Orientation;
  title?: string;
  width?: string | number;
  onStepChange?: (arg0: number) => void;
}

const maxStepperWidth = '160px';
const errorIcon = <ErrorIcon color="error" name="error-info" />;

export function StepperUi(props: StepperProps) {
  const {
    activeStep = -1,
    labels = [],
    steps,
    completed,
    disabled,
    hasErrors = [],
    orientation = defaultStepperOrientation,
    title = '',
    width = orientation === 'horizontal'
      ? defaultHorizontalStepperWidth
      : defaultVerticalStepperWidth,
    onStepChange,
  } = props;

  const handleStep = (stepIndex: number) => () => {
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  };

  if (steps.length === 0) {
    return <Box sx={{ width: width }}>No Steps Found</Box>;
  }

  return (
    <Paper
      className="paper-form"
      sx={{
        backgroundColor: (theme: any) => `${theme.palette.background.default}`,
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        width: width,
        minWidth: width,
        margin: '12px',
        padding: '12px',
        paddingTop: '24px',
      }}
      elevation={0}
      variant="outlined"
      data-testid="stepper-ui"
    >
      {title && (
        <Typography
          variant={orientation === 'horizontal' ? 'h3' : 'h5'}
          sx={
            orientation === 'horizontal'
              ? {
                  width: 'auto',
                  color: (theme: any) => `${theme.header.title}`,
                  padding: '12px 8px 8px 8px',
                  textTransform: 'uppercase',
                }
              : {
                  width: '100%',
                  color: (theme: any) => `${theme.header.title}`,
                  padding: '8px 8px 8px 0px',
                }
          }
        >
          {title}
        </Typography>
      )}
      <nav>
        <Stepper
          activeStep={activeStep}
          //nonLinear={true}//REF if we don't want it to checkmark steps when we go to next
          orientation={orientation}
          connector={<div style={{ height: '10px', width: '10px' }} />}
        >
          {steps.map((label, index) => {
            let optionalNode = <></>;
            const stepError =
              hasErrors?.length > index && hasErrors[index] === true;
            if (labels?.length > index) {
              optionalNode = (
                <Typography
                  variant="caption"
                  className="clipped-text"
                  sx={{
                    maxWidth: maxStepperWidth,
                    display: 'inline-block', // so maxWidth will apply to span created in list item
                  }}
                >
                  {labels[index]}
                </Typography>
              );
            }

            return (
              <Step
                key={index}
                completed={completed[index]}
                disabled={disabled[index]}
              >
                <StepButton
                  icon={stepError ? errorIcon : undefined}
                  optional={optionalNode}
                  color="inherit"
                  onClick={handleStep(index)}
                >
                  {label}
                  {activeStep === index && (
                    <Divider
                      orientation="horizontal"
                      variant="fullWidth"
                      sx={{
                        boxShadow: 0,
                        backgroundColor: 'primary.main',
                        borderBottomWidth: '4px',
                        margin: '4px',
                        borderRadius: '12px',
                      }}
                    />
                  )}
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </nav>
    </Paper>
  );
}

export default StepperUi;
