import React, { createContext } from 'react';

/**
 * Context shared by stepper components to manage selection and focus.
 */
export interface iStepsContext {
  /**
   * The index of the currently active step.
   * This is typically used to determine which stepper panel to display.
   */
  step: number;
}

/**
 * Props for the custom context or provider component.
 */
interface tProviderProps {
  /**
   * React children to render inside the provider.
   */
  children: React.ReactNode;

  /**
   * The currently active stepper index.
   */
  step: number;
}

/**
 * React Context for managing stepper state in a stepper interface.
 *
 * Provides shared access to:
 * - `step`: The currently active stepper index.
 *
 * Initialized with a type assertion to satisfy the expected shape,
 * but should always be used within a corresponding `StepsContextProvider`.
 */
export const StepsContext = createContext<iStepsContext>({} as iStepsContext);

/**
 * Provides step-related context to nested components within a stepper interface.
 *
 * This context is typically used to:
 * - Track the currently active stepper index (`step`)
 * - Store the currently selected offset (`selOffset`), often used for positioning or syncing with editor state
 *
 * @param children - React elements that will consume the context
 * @param step - The index of the currently active step
 */
export function StepsContextProvider({
  children,
  step,
}: tProviderProps) {
  return (
    <StepsContext.Provider value={{ step }}>
      {children}
    </StepsContext.Provider>
  );
}
