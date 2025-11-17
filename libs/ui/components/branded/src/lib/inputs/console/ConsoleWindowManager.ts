import { ConsoleWindow } from './ConsoleWindow';

/**
 * Manage console windows by keeping track of which console is active.
 * An active console is listening for keyboard and mouse events.
 */
export class ConsoleWindowManager {
  private static _windows: Map<string, ConsoleWindow> = new Map();
  private static _activeWindowId = '';

  public static isWindowAlreadyOpen(connectionId: string) {
    return ConsoleWindowManager._windows.has(connectionId);
  }

  static addWindow(
    connectionId: string,
    activate: () => void,
    deactivate: () => void,
    center: () => void,
  ) {
    // if a window with the same connection id already exists, deactivate it
    // (this helps combat React's double render on strict mode)
    if (ConsoleWindowManager._windows.has(connectionId)) {
      const window = ConsoleWindowManager._windows.get(connectionId);
      window?.deactivate();
    }

    const consoleWindow = new ConsoleWindow(
      connectionId,
      activate,
      deactivate,
      center,
    );

    ConsoleWindowManager._windows.set(connectionId, consoleWindow);
  }

  static removeWindow(connectionId: string) {
    ConsoleWindowManager.deactivateWindow(connectionId);
    ConsoleWindowManager._windows.delete(connectionId);
  }

  static deactivateWindow(connectionId: string) {
    if (ConsoleWindowManager._windows.has(connectionId)) {
      const window = ConsoleWindowManager._windows.get(connectionId);
      window?.deactivate();
    }
  }

  static centerWindow(connectionId: string) {
    if (ConsoleWindowManager._windows.has(connectionId)) {
      const window = ConsoleWindowManager._windows.get(connectionId);
      window?.center();
    }
  }

  /**
   * If the window specified is not already the currently active window,
   * deactivate all windows and activate the specified window.
   */
  static setActiveWindow(connectionId: string, forceActivate = false) {
    if (
      ConsoleWindowManager._activeWindowId === connectionId &&
      !forceActivate
    ) {
      // window is already active, do nothing
    } else {
      ConsoleWindowManager._activeWindowId = connectionId;

      ConsoleWindowManager._windows.forEach((window) => {
        if (window.connectionId !== connectionId) {
          window.deactivate();
        }
      });

      const consoleWindowToActivate =
        ConsoleWindowManager._windows.get(connectionId);
      consoleWindowToActivate?.activate();
    }
  }
}
