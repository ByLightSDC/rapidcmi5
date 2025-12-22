import { createContext, useState } from 'react';

/* MUI */
import { Orientation } from '@mui/material/Stepper';

/* Constants */
import {
  defaultHorizontalStepperWidth,
  defaultStepperOrientation,
  defaultVerticalStepperWidth,
} from './constants';

/**
 * @interface IStepperContext
 */
interface IStepperContext {
  activeStep: number;
  completed?: boolean[];
  isStepperEnabled?: boolean;
  orientation?: Orientation;
  steps?: string[];
  stepsCompleted?: boolean[];
  stepsDisabled?: boolean[];
  stepErrors?: boolean[];
  stepLabels?: string[];
  stepTitles?: string[];
  stepWidth?: number | string;
  setCurrentStep: (whichStep: number) => void;
  setStepErrors: (errors: boolean[]) => void;
}

/** @constant
 * Context for bookmarks
 *  @type {React.Context<IStepperContext>}
 */
export const StepperContext = createContext<IStepperContext>(
  {} as IStepperContext, // this allows us to create the context without having to default values
);

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: any;
  defaultStep?: number;
  isStepperEnabled?: boolean;
  orientation?: Orientation;
  steps?: string[];
  stepsCompleted?: boolean[];
  stepsDisabled?: boolean[];
  defaultStepErrors?: boolean[];

  stepLabels?: string[];
  stepTitles?: string[];
  stepWidth?: number | string;
}

/**
 * React context for stepper
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const StepperContextProvider: any = (props: tProviderProps) => {
  const {
    children,
    defaultStep = 0,
    orientation = defaultStepperOrientation,
    isStepperEnabled = false,
    stepsCompleted,
    stepsDisabled,
    defaultStepErrors,
    steps,
    stepLabels,
    stepTitles,
    stepWidth = orientation === 'horizontal'
      ? defaultHorizontalStepperWidth
      : defaultVerticalStepperWidth,
  } = props;

  const [stepErrors, setStepErrors] = useState(defaultStepErrors);
  const [currentStep, setCurrentStep] = useState(defaultStep);

  const handleStepErrors = (hasErrors: boolean[]) => {
    setStepErrors(hasErrors);
  };

  const handleStepChange = (whichStep: number) => {
    setCurrentStep(whichStep);
  };

  return (
    <StepperContext.Provider
      value={{
        activeStep: currentStep,
        isStepperEnabled: isStepperEnabled,
        orientation: orientation,
        steps: steps,
        stepsCompleted: stepsCompleted,
        stepsDisabled: stepsDisabled,
        stepErrors: stepErrors,
        stepLabels: stepLabels,
        stepTitles: stepTitles,
        stepWidth: stepWidth,
        setCurrentStep: handleStepChange,
        setStepErrors: handleStepErrors,
      }}
    >
      {children}
    </StepperContext.Provider>
  );
};
