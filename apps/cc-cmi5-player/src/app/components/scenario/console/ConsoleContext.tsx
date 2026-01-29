/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useRef, useState } from 'react';
import { ReactFlowInstance } from 'reactflow';
import { ConsoleWindowManager } from './ConsoleWindowManager';
import ConsolePopup from './ConsolePopup';
import { DeployedRangeConsoleStatusEnum } from '@rangeos-nx/frontend/clients/devops-api';

interface iConsoleContext {
  addConsoleWindow: (
    connectionId: string,
    connectionType: string,
    connectionUrl: string,
    title: string,
    resizeMethod: string | null | undefined,
    protocol: string | null,
  ) => Promise<any>;
  removeConsoleWindow: (winNumber: number) => void;
  currentZIndex: number;
  isConsoleReady: (status?: DeployedRangeConsoleStatusEnum) => boolean;
  setCurrentZIndex: (currIndex: number) => void;
  consoleWindows: JSX.Element[];
  setReactFlowInstance: (obj: any) => void;
  setIsDockingEnabled: (bool: boolean) => void;
  isDockingEnabled: () => boolean;
  setStoredWindowSettings: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isMaximized: boolean,
  ) => void;
  getStoredWindowSettings: (id: string) => any;
  screenToViewport: (obj: any) => any;
  viewportToScreen: (obj: any) => any;
  sendScenarioEvent: (
    eventType: 'console_open' | 'copy_paste_change',
    metadata?: Record<string, any>,
  ) => Promise<void>;
}

export const ConsoleContext = createContext<iConsoleContext>({
  addConsoleWindow: async (
    connectionId: string,
    connectionType: string,
    connectionUrl: string,
    title: string,
    resizeMethod: string | null | undefined,
    protocol: string | null,
  ) => {},
  removeConsoleWindow: (winNumber: number) => {},
  consoleWindows: [],
  currentZIndex: -1,
  isConsoleReady: (status?: DeployedRangeConsoleStatusEnum) => true,
  setCurrentZIndex: (currIndex: number) => {},
  setReactFlowInstance: (obj: any) => {},
  setIsDockingEnabled: (bool: boolean) => {},
  isDockingEnabled: () => {
    return false;
  },
  setStoredWindowSettings: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isMaximized: boolean,
  ) => {},
  getStoredWindowSettings: (id: string) => {
    return { x: 0, y: 0, width: 0, height: 0, isMaximized: false };
  },
  screenToViewport: (obj: any) => {},
  viewportToScreen: (obj: any) => {},
  sendScenarioEvent: async () => {},
});

/**
 * @interface tProviderProps
 * @property {*} [children] Children
 */
interface tProviderProps {
  children?: React.ReactNode;
  routeDelim?: string;
  isRouteRelative?: boolean;
  guacUser?: string;
  guacPassword?: string;
  isEnabled?: boolean;
  rangeId: string;
  scenarioId: string;
  onScenarioEvent?: (
    eventType: 'console_open' | 'copy_paste_change',
    scenarioId?: string,
    metadata?: Record<string, any>,
  ) => Promise<void>;
}

export function ConsoleProvider(props: tProviderProps) {
  const {
    children,
    isRouteRelative = false,
    routeDelim = '/',
    guacUser,
    guacPassword,
    rangeId,
    scenarioId,
    onScenarioEvent,
  } = props;
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const isDockingEnabledRef = useRef(false);
  const windowPositionDataRef = useRef(new Map());

  // console windows
  const [currentZIndex, setCurrentZIndex] = useState<number>(9999);
  const [consoleWinNum, setConsoleWinNum] = useState<number>(0);
  const [consoleWindows, setConsoleWindows] = useState<JSX.Element[]>([]);

  const addConsoleWindow = async (
    connectionId: string,
    connectionType: string,
    connectionUrl: string,
    title: string,
    resizeMethod: string | null | undefined,
    protocol: string | null,
    overrideRangeId?: string,
    overrideScenarioId?: string,
  ) => {
    // don't add the window if it is already open, but center it in the browser
    if (ConsoleWindowManager.isWindowAlreadyOpen(connectionId)) {
      ConsoleWindowManager.centerWindow(connectionId);
      return;
    }

    // Send scenario event when console opens
    await sendScenarioEvent('console_open', {
      connectionId,
      connectionType,
      title,
    });

    const theConsoles: JSX.Element[] = [...consoleWindows];

    setConsoleWinNum((winNumber) => {
      theConsoles.push(
        <ConsolePopup
          currentZIndex={currentZIndex}
          isRouteRelative={isRouteRelative}
          routeDelim={routeDelim}
          setCurrentZIndex={setCurrentZIndex}
          key={'consoleWindow' + winNumber}
          title={title}
          windowNumber={winNumber}
          // details data from graph response
          connectionId={connectionId || ''}
          connectionType={connectionType}
          connectionUrl={connectionUrl}
          guacUserName={guacUser}
          guacPassword={guacPassword}
          rangeId={overrideRangeId || rangeId}
          resizeMethod={resizeMethod}
          protocol={protocol}
          // Note: unable to use the token we already use for API calls. must grab new
          // app. However, if you pass an empty string, a new token will be grabbed.
          scenarioId={overrideScenarioId || scenarioId}
          token=""
        />,
      );

      return winNumber + 1;
    });

    setConsoleWindows(theConsoles);
  };

  /**
   * Remove a console window by removing it from the list of console window
   * components.
   * @param winNumber
   */
  const removeConsoleWindow = (winNumber: number) => {
    setConsoleWindows((cws) => {
      const theConsoles = [...cws];
      for (let i = 0; i < theConsoles.length; i++) {
        const cw = theConsoles[i];
        if (cw.key === 'consoleWindow' + winNumber) {
          theConsoles.splice(i, 1);
          break;
        }
      }

      return theConsoles;
    });
  };

  /**
   * Returns whether console is ready for launching
   * @param {DeployedRangeConsoleStatusEnum} [status] Current status of console
   * @returns {boolean}
   */
  const isConsoleReady = (status?: DeployedRangeConsoleStatusEnum) => {
    if (status) {
      return status === DeployedRangeConsoleStatusEnum.Ready;
    }
    return false;
  };

  function setInstance(instance: ReactFlowInstance) {
    reactFlowInstanceRef.current = instance;
  }

  function setIsDockingEnabled(isDockingEnabled: boolean) {
    isDockingEnabledRef.current = isDockingEnabled;
  }

  function isDockingEnabled() {
    return isDockingEnabledRef.current;
  }

  function setStoredWindowSettings(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isMaximized: boolean,
  ) {
    windowPositionDataRef.current.set(id, {
      x: x,
      y: y,
      width: width,
      height: height,
      isMaximized: isMaximized,
    });
  }

  function getStoredWindowSettings(id: string) {
    return windowPositionDataRef.current.get(id);
  }

  function screenToViewport(position: any) {
    // Note: the snapToGrid flag is a new feature of react flow that doesn't yet exist in it's typescript defs.
    // Setting this flag to false prevents the position conversion from snapping to a whole x and y number.
    // @ts-ignore
    return reactFlowInstanceRef.current?.screenToFlowPosition(position, {
      snapToGrid: false,
    });
  }

  function viewportToScreen(position: any) {
    // @ts-ignore
    return reactFlowInstanceRef.current?.flowToScreenPosition(position, {
      snapToGrid: false,
    });
  }

  const sendScenarioEvent = async (
    eventType: 'console_open' | 'copy_paste_change',
    metadata?: Record<string, any>,
  ) => {
    if (onScenarioEvent) {
      try {
        await onScenarioEvent(eventType, scenarioId, metadata);
      } catch (error) {
        console.warn('Failed to send scenario event:', error);
      }
    }
  };

  return (
    <ConsoleContext.Provider
      value={{
        addConsoleWindow,
        removeConsoleWindow,
        currentZIndex,
        isConsoleReady,
        setCurrentZIndex,
        consoleWindows,
        setReactFlowInstance: setInstance,
        setIsDockingEnabled: setIsDockingEnabled,
        isDockingEnabled: isDockingEnabled,
        setStoredWindowSettings: setStoredWindowSettings,
        getStoredWindowSettings: getStoredWindowSettings,
        screenToViewport: screenToViewport,
        viewportToScreen: viewportToScreen,
        sendScenarioEvent,
      }}
    >
      {children}
    </ConsoleContext.Provider>
  );
}
