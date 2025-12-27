import { config } from "../environments/FrontendEnvironment.env";

export const debugColorSuccess = 'background:lightgreen';
export const debugColor2 = 'background:lightblue';
export const debugColor3 = 'background:lightgrey';
export const debugColorWarning = 'background:lightyellow';
export const debugColorError = 'background:lightred';
const currentMinLogLevel = config.CLIENT_LOG ? 0 : -1;

// Temporary: Namespace support for debugLog (default OFF for specified namespaces)
// TODO: Replace with unified namespace system
//
// Usage in code:
//   debugLog('Message', data, undefined, 'lms');  // 'lms' namespace (default OFF)
//   debugLog('Message', data);                     // No namespace (always logs if CLIENT_LOG enabled)
//
// Runtime toggle in browser console:
//   localStorage.setItem('DEBUG_NAMESPACES', 'lms')        // Enable 'lms' namespace
//   localStorage.setItem('DEBUG_NAMESPACES', 'lms,other')  // Enable multiple namespaces
//   localStorage.setItem('DEBUG_NAMESPACES', 'true')       // Enable all namespaces
//   localStorage.removeItem('DEBUG_NAMESPACES')            // Disable (use defaults)
const getEnabledNamespaces = (): Set<string> => {
  const enabled = new Set<string>();
  try {
    const stored = localStorage.getItem('DEBUG_NAMESPACES');
    if (stored) {
      // Support both 'true' (all) and comma-separated list
      if (stored === 'true' || stored === '*') {
        // If 'true' or '*', don't add anything to enabled set (all namespaces allowed)
        return enabled; // Empty set means all enabled
      }
      // Parse comma-separated list
      stored.split(',').forEach((ns) => {
        const trimmed = ns.trim();
        if (trimmed) {
          enabled.add(trimmed);
        }
      });
    }
  } catch (e) {
    // localStorage not available (SSR, etc.)
  }
  return enabled;
};

// Default ignored namespaces (default OFF unless enabled via localStorage)
// allows for backward compatibility with existing logging system
const defaultIgnoreNamespaces = new Set<string>(['lms']);

const isNamespaceEnabled = (namespace?: string): boolean => {
  if (!namespace) {
    return true; // No namespace = always log (backward compatible)
  }

  const enabledNamespaces = getEnabledNamespaces();

  // If enabledNamespaces is empty and localStorage was checked, it means 'true' or '*' was set
  // Check if localStorage has DEBUG_NAMESPACES set to 'true' or '*'
  try {
    const stored = localStorage.getItem('DEBUG_NAMESPACES');
    if (stored === 'true' || stored === '*') {
      return true; // All namespaces enabled
    }
  } catch (e) {
    // Ignore
  }

  // If namespace is explicitly in enabled list, allow it
  if (enabledNamespaces.has(namespace)) {
    return true;
  }

  // Otherwise, check if it's in default ignore list
  return !defaultIgnoreNamespaces.has(namespace);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

//REF console.log('Client log Level', currentMinLogLevel);
export const debugLogError = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorError);
  }
};

export const debugLogSuccess = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorSuccess);
  }
};

export const debugLogWarning = (m1: string) => {
  if (currentMinLogLevel >= 0) {
    console.log('%c ' + m1, debugColorWarning);
  }
};

export const debugLog = (
  m1?: string,
  m2?: any,
  p?: number,
  namespace?: string,
) => {
  // Check if namespace is enabled (default OFF for namespaces in defaultIgnoreNamespaces)
  if (!isNamespaceEnabled(namespace)) {
    return;
  }

  if (currentMinLogLevel >= 0) {
    //0 no color, 1 color
    if (typeof m2 !== 'undefined') {
      if (typeof m2 === 'number') {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('log => ' + m1, m2);
          }
        } else {
          //asume m2 is the priority
          if (m2 >= currentMinLogLevel) {
            console.log('%c ' + m1, debugColor2);
          }
        }
      } else {
        if (p) {
          if (p >= currentMinLogLevel) {
            console.log('%c ' + m1, m2);
          }
        } else {
          //console.log(m1, m2);
          console.log('log => ' + m1, m2);
        }
      }
    } else {
      //console.log(m1);
      console.log('%c ' + m1, debugColor3);
    }
  }
};

export const debugLogObj = (m1: any) => {
  if (currentMinLogLevel >= 0) {
    console.log(m1);
  }
};
