/**
 * Debug utility for animation system logging
 *
 * Usage:
 *   // In browser console:
 *   localStorage.setItem('DEBUG_ANIMATIONS', 'true')  // Enable all animation debug logs
 *   localStorage.setItem('DEBUG_ANIMATIONS', 'bridge') // Enable only bridge logs
 *   localStorage.setItem('DEBUG_ANIMATIONS', 'bridge,engine') // Enable multiple namespaces
 *   localStorage.removeItem('DEBUG_ANIMATIONS') // Disable
 *
 *   // In code:
 *   import { createDebugLogger } from './debug';
 *   const debug = createDebugLogger('bridge');
 *   debug.log('Message', data);
 *   debug.warn('Warning');
 *   debug.error('Error');
 */

type LogLevel = 'log' | 'warn' | 'error';

interface DebugLogger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  enabled: boolean;
}

/**
 * Check if debugging is enabled for a specific namespace
 */
function isDebugEnabled(namespace: string): boolean {
  // Check environment variable first (for build-time configuration)
  const envDebug =
    process.env['NX_DEBUG_ANIMATIONS'] || process.env['DEBUG_ANIMATIONS'];

  // Check localStorage (for runtime configuration in browser)
  let localDebug: string | null = null;
  try {
    localDebug = localStorage.getItem('DEBUG_ANIMATIONS');
  } catch (e) {
    // localStorage not available (SSR, etc.)
  }

  const debugValue = localDebug || envDebug;

  if (!debugValue) {
    return false;
  }

  // 'true' or '*' enables everything
  if (debugValue === 'true' || debugValue === '*') {
    return true;
  }

  // Check if namespace is in comma-separated list
  const enabledNamespaces = debugValue.split(',').map((ns) => ns.trim());
  return enabledNamespaces.includes(namespace);
}

/**
 * Create a namespaced debug logger
 * @param namespace - The namespace for this logger (e.g., 'bridge', 'engine', 'drawer')
 */
export function createDebugLogger(namespace: string): DebugLogger {
  const enabled = isDebugEnabled(namespace);
  const prefix = `[Animation:${namespace}]`;

  const createLogFn = (level: LogLevel) => {
    return (...args: unknown[]) => {
      if (!enabled) return;

      // Apply color coding and emoji based on level
      const styles: Record<LogLevel, string> = {
        log: 'color: #2196F3; font-weight: bold',
        warn: 'color: #FF9800; font-weight: bold',
        error: 'color: #F44336; font-weight: bold',
      };

      // Use console methods with styled prefix
      if (typeof args[0] === 'string') {
        console[level](`%c${prefix}`, styles[level], args[0], ...args.slice(1));
      } else {
        console[level](`%c${prefix}`, styles[level], ...args);
      }
    };
  };

  return {
    log: createLogFn('log'),
    warn: createLogFn('warn'),
    error: createLogFn('error'),
    enabled,
  };
}

/**
 * Export pre-configured loggers for common namespaces
 */
export const debugBridge = createDebugLogger('bridge');
export const debugEngine = createDebugLogger('engine');
export const debugDrawer = createDebugLogger('drawer');
export const debugStable = createDebugLogger('stable');
export const debugWrap = createDebugLogger('wrap');
export const debugMdast = createDebugLogger('mdast');

// Log initialization message if any debugging is enabled
if (typeof window !== 'undefined') {
  try {
    const debugValue = localStorage.getItem('DEBUG_ANIMATIONS');
    if (debugValue) {
      console.log(
        '%c[Animation Debug] Enabled for:',
        'color: #4CAF50; font-weight: bold',
        debugValue === 'true' || debugValue === '*' ? 'ALL' : debugValue,
      );
      console.log(
        '%c[Animation Debug] Available namespaces:',
        'color: #4CAF50; font-weight: bold',
        'bridge, engine, drawer, stable',
      );
    }
  } catch (e) {
    // Ignore
  }
}
