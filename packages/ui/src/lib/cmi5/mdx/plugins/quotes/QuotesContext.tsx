import React, { createContext, useEffect, useState } from 'react';

/**
 * Context shared by grid components to manage layout state.
 */
export interface IQuotesContext {
  avatar?: string;
  carouselIndex: number;
  preset: string;
}

/**
 * Props for the GridContextProvider component.
 */
interface QuotesProviderProps {
  /**
   * React children to render inside the provider.
   */
  children: React.ReactNode;

  /**
   * Which layout
   */
  preset: string;

  avatar?: string;
  carouselIndex?: number;
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
export const QuotesContext = createContext<IQuotesContext>(
  {} as IQuotesContext,
);

/**
 * Provides grid-related context to nested components within a grid layout.
 *
 * This context is typically used to:
 * - Track the number of columns in the grid layout
 *
 * @param children - React elements that will consume the context
 * @param columnCount - The total number of columns in the grid
 */
export function QuotesContextProvider({
  children,
  avatar,
  carouselIndex = 0,
  preset,
}: QuotesProviderProps) {
  useEffect(() => {
    console.log('QuotesContextProvider avatar', avatar);
  }, [avatar]);
  return (
    <QuotesContext.Provider value={{ avatar, carouselIndex, preset }}>
      {children}
    </QuotesContext.Provider>
  );
}
