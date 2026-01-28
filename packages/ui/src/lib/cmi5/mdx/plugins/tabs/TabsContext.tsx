import React, { createContext } from 'react';

/**
 * Context shared by tab components to manage selection and focus.
 */
export interface iTabsContext {
  /**
   * The index of the currently active tab.
   * This is typically used to determine which tab panel to display.
   */
  tab: number;
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
   * The currently active tab index.
   */
  tab: number;
}

/**
 * React Context for managing tab state in a tabbed interface.
 *
 * Provides shared access to:
 * - `tab`: The currently active tab index.
 *
 * Initialized with a type assertion to satisfy the expected shape,
 * but should always be used within a corresponding `TabsContextProvider`.
 */
export const TabsContext = createContext<iTabsContext>({} as iTabsContext);

/**
 * Provides tab-related context to nested components within a tabbed interface.
 *
 * This context is typically used to:
 * - Track the currently active tab index (`tab`)
 * - Store the currently selected offset (`selOffset`), often used for positioning or syncing with editor state
 *
 * @param children - React elements that will consume the context
 * @param tab - The index of the currently active tab
 */
export function TabsContextProvider({
  children,
  tab,
}: tProviderProps) {
  return (
    <TabsContext.Provider value={{ tab }}>
      {children}
    </TabsContext.Provider>
  );
}
