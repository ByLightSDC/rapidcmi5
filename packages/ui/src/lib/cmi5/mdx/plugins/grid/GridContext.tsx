import React, { createContext } from 'react';

/**
 * Context shared by grid components to manage layout state.
 */
export interface IGridContext {
  /**
   * The total number of columns in the grid layout.
   */
  columnCount: number;
}

/**
 * Props for the GridContextProvider component.
 */
interface GridProviderProps {
  /**
   * React children to render inside the provider.
   */
  children: React.ReactNode;

  /**
   * The total number of columns in the grid layout.
   */
  columnCount: number;
}

/**
 * React Context for managing grid layout state.
 *
 * Provides shared access to:
 * - `columnCount`: The total number of columns in the grid layout.
 *
 * Initialized with a type assertion to satisfy the expected shape,
 * but should always be used within a corresponding `GridContextProvider`.
 */
export const GridContext = createContext<IGridContext>({} as IGridContext);

/**
 * Provides grid-related context to nested components within a grid layout.
 *
 * This context is typically used to:
 * - Track the number of columns in the grid layout
 *
 * @param children - React elements that will consume the context
 * @param columnCount - The total number of columns in the grid
 */
export function GridContextProvider({ children, columnCount }: GridProviderProps) {
  return (
    <GridContext.Provider value={{ columnCount }}>{children}</GridContext.Provider>
  );
}
