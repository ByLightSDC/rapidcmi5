
import React, { createContext } from 'react';

/**
 * Shape of the statements context value shared across nested statement components.
 */
export interface IStatementsContext {
  /** Raw avatar path or URL from the mdast node attributes. */
  avatar?: string;
  /** Index of the currently active statement in the carousel. */
  carouselIndex: number;
  /** Active layout preset identifier. */
  preset: string;
  /** Resolved image URL for the avatar, ready for display. */
  imageSource?: string;
}

interface StatementsProviderProps {
  children: React.ReactNode;
  preset: string;
  avatar?: string;
  carouselIndex?: number;
}

export const StatementsContext = createContext<IStatementsContext>(
  {} as IStatementsContext,
);

/**
 * Provides statements-related context to nested components within a statements container.
 */
export function StatementsContextProvider({
  children,
  carouselIndex = 0,
  preset,
}: StatementsProviderProps) {
  return (
    <StatementsContext.Provider
      value={{
        carouselIndex,
        preset,
      }}
    >
      {children}
    </StatementsContext.Provider>
  );
}
