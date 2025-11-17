import { createContext, useState } from 'react';

/*
 * Context for tracking which FormControlTimeField is open based on label
 */

/**
 * @interface iTimePickerContext
 * @property {string} lastTimePickerId Returns id of current open time picker
 * @property {(id: string) => void} updateLastTimePickerId Method to set current open time picker (or pass '' when closing)
 */
interface iTimePickerContext {
  lastTimePickerId: string;
  updateLastTimePickerId: (id: string) => void;
}

/**
 * Create Context
 */
export const TimePickerContext = createContext<iTimePickerContext>(
  {} as iTimePickerContext, // this allows us to create the context without having to default values
);

/**
 * @interface tProviderProps Props to be defined when rendering the Provider for TimePickerContext
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: any;
}

/**
 * React context for managing which timepicker is currently open
 * @param {tProviderProps} props Component props
 * @return {JSX.Element} React context
 */
export const TimePickerProvider: any = (props: tProviderProps) => {
  const { children } = props;
  const [lastTimePickerId, setLastTimePickerId] = useState('');

  const updateLastTimePickerId = (id: string) => {
    setLastTimePickerId(id);
  };
  return (
    <TimePickerContext.Provider
      value={{
        lastTimePickerId,
        updateLastTimePickerId,
      }}
    >
      {children}
    </TimePickerContext.Provider>
  );
};
