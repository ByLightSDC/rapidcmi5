import { config } from "@rapid-cmi5/ui";

const currentMinLogLevel = config.CLIENT_LOG ? 0 : -1;
export const debugColorSuccess = 'background:lightgreen';
export const debugColor2 = 'background:lightblue';
export const debugColor3 = 'background:lightgrey';
export const debugColorWarning = 'background:lightyellow';
export const debugColorError = 'background:lightred';

// Color schemes for different log types
export const debugColorInfo =
  'background:lightcyan; color:black; padding:2px 4px; border-radius:2px;';
export const debugColorDebug =
  'background:lavender; color:black; padding:2px 4px; border-radius:2px;';
export const debugColorTrace =
  'background:lightpink; color:black; padding:2px 4px; border-radius:2px;';

// Component-specific colors
export const componentColors = {
  auManager:
    'background:#e3f2fd; color:#1976d2; padding:2px 4px; border-radius:2px;',
  cmi5: 'background:#f3e5f5; color:#7b1fa2; padding:2px 4px; border-radius:2px;',
  redux:
    'background:#fff3e0; color:#f57c00; padding:2px 4px; border-radius:2px;',
  navigation:
    'background:#e8f5e8; color:#2e7d32; padding:2px 4px; border-radius:2px;',
  hooks:
    'background:#fce4ec; color:#c2185b; padding:2px 4px; border-radius:2px;',
  api: 'background:#f1f8e9; color:#558b2f; padding:2px 4px; border-radius:2px;',
  performance:
    'background:#fff8e1; color:#f9a825; padding:2px 4px; border-radius:2px;',
  lms: 'background:#e1f5fe; color:#0277bd; padding:2px 4px; border-radius:2px;',
  media:
    'background:#fce4ec; color:#d81b60; padding:2px 4px; border-radius:2px;',
};
// Enhanced logging functions
type ComponentType = keyof typeof componentColors;

// Logging configuration - can be overridden by localStorage
interface LoggingConfig {
  enabled: boolean;
  level: LogLevel;
  components: {
    auManager: boolean;
    cmi5: boolean;
    redux: boolean;
    navigation: boolean;
    hooks: boolean;
    api: boolean;
    performance: boolean;
    lms: boolean;
    media: boolean;
    all: boolean;
  };
}

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

// Default configuration
const getDefaultLoggingConfig = (): LoggingConfig => {
  // TEMPORARY HARDCODE FOR DEVELOPMENT - FORCE DEBUG LOGGING
  const loggingEnabled = true;
  const loggingLevelStr = 'DEBUG';

  // Original code (commented out for now):
  // // Check both new LOGGING_ENABLED and legacy CLIENT_LOG
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const loggingEnabled =
  //   (config as any).LOGGING_ENABLED || config.CLIENT_LOG || false;
  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const loggingLevelStr = (config as any).LOGGING_LEVEL || 'INFO';

  let logLevel = LogLevel.INFO;
  switch (loggingLevelStr.toLowerCase()) {
    case 'error':
      logLevel = LogLevel.ERROR;
      break;
    case 'warn':
      logLevel = LogLevel.WARN;
      break;
    case 'info':
      logLevel = LogLevel.INFO;
      break;
    case 'debug':
      logLevel = LogLevel.DEBUG;
      break;
    case 'trace':
      logLevel = LogLevel.TRACE;
      break;
  }

  // Get component configuration from build-time config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildTimeComponents = (config as any).LOGGING_COMPONENTS || {};

  // Default component settings (all enabled by default)
  const defaultComponents = {
    auManager: true,
    cmi5: true,
    redux: true,
    navigation: true,
    hooks: true,
    api: true,
    performance: true,
    lms: true,
    media: true,
    all: true,
  };

  // Merge build-time component config with defaults
  const components = { ...defaultComponents, ...buildTimeComponents };

  return {
    enabled: loggingEnabled,
    level: logLevel,
    components,
  };
};

// Get logging config from localStorage or use defaults
const getLoggingConfig = (): LoggingConfig => {
  const defaultConfig = getDefaultLoggingConfig();
  try {
    const stored = localStorage.getItem('cmi5-player-logging-config');
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to parse logging config from localStorage');
  }
  return defaultConfig;
};

let loggingConfig = getLoggingConfig();

// Function to refresh logging config after overrides are loaded
export const refreshLoggingConfig = () => {
  const oldConfig = loggingConfig;
  loggingConfig = getLoggingConfig();
  logger.info('Logging configuration refreshed after overrides', {
    oldEnabled: oldConfig.enabled,
    newEnabled: loggingConfig.enabled,
    oldLevel: oldConfig.level,
    newLevel: loggingConfig.level,
  });
};

const shouldLog = (level: LogLevel, component?: ComponentType): boolean => {
  if (!loggingConfig.enabled) return false;
  if (level > loggingConfig.level) return false;

  // If no specific component is provided, check if "all" is enabled
  if (!component) {
    return loggingConfig.components.all;
  }

  // Check if "all" is enabled - if so, allow logging unless component is explicitly disabled
  if (loggingConfig.components.all) {
    // If component is explicitly set to false, don't log
    if (loggingConfig.components[component] === false) return false;
    return true;
  }

  // If "all" is not enabled, only log if the specific component is enabled
  return loggingConfig.components[component] === true;
};

const formatMessage = (
  component: ComponentType | undefined,
  message: string,
): string => {
  const timestamp = new Date().toISOString().substr(11, 12);
  const componentPrefix = component ? `[${component.toUpperCase()}]` : '';
  return `${timestamp} ${componentPrefix} ${message}`;
};

// Main logging function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = {
  error: (message: string, data?: any, component?: ComponentType) => {
    if (shouldLog(LogLevel.ERROR, component)) {
      const formattedMsg = formatMessage(component, message);
      if (data !== undefined) {
        console.error(`%c${formattedMsg}`, debugColorError, data);
      } else {
        console.error(`%c${formattedMsg}`, debugColorError);
      }
    }
  },

  warn: (message: string, data?: any, component?: ComponentType) => {
    if (shouldLog(LogLevel.WARN, component)) {
      const formattedMsg = formatMessage(component, message);
      if (data !== undefined) {
        console.warn(`%c${formattedMsg}`, debugColorWarning, data);
      } else {
        console.warn(`%c${formattedMsg}`, debugColorWarning);
      }
    }
  },

  info: (message: string, data?: any, component?: ComponentType) => {
    if (shouldLog(LogLevel.INFO, component)) {
      const formattedMsg = formatMessage(component, message);
      const color = component ? componentColors[component] : debugColorInfo;
      if (data !== undefined) {
        console.log(`%c${formattedMsg}`, color, data);
      } else {
        console.log(`%c${formattedMsg}`, color);
      }
    }
  },

  debug: (message: string, data?: any, component?: ComponentType) => {
    if (shouldLog(LogLevel.DEBUG, component)) {
      const formattedMsg = formatMessage(component, message);
      const color = component ? componentColors[component] : debugColorDebug;
      if (data !== undefined) {
        console.log(`%c${formattedMsg}`, color, data);
      } else {
        console.log(`%c${formattedMsg}`, color);
      }
    }
  },

  trace: (message: string, data?: any, component?: ComponentType) => {
    if (shouldLog(LogLevel.TRACE, component)) {
      const formattedMsg = formatMessage(component, message);
      const color = component ? componentColors[component] : debugColorTrace;
      if (data !== undefined) {
        console.log(`%c${formattedMsg}`, color, data);
      } else {
        console.log(`%c${formattedMsg}`, color);
      }
    }
  },

  // Performance timing helpers
  time: (label: string, component?: ComponentType) => {
    if (shouldLog(LogLevel.DEBUG, component)) {
      console.time(formatMessage(component, label));
    }
  },

  timeEnd: (label: string, component?: ComponentType) => {
    if (shouldLog(LogLevel.DEBUG, component)) {
      console.timeEnd(formatMessage(component, label));
    }
  },

  // Group logging for complex operations
  group: (title: string, component?: ComponentType) => {
    if (shouldLog(LogLevel.INFO, component)) {
      const color = component ? componentColors[component] : debugColorInfo;
      console.group(`%c${formatMessage(component, title)}`, color);
    }
  },

  groupEnd: () => {
    if (loggingConfig.enabled) {
      console.groupEnd();
    }
  },
};

// Configuration helpers
export const setLoggingConfig = (newConfig: Partial<LoggingConfig>) => {
  const updatedConfig = { ...loggingConfig, ...newConfig };
  localStorage.setItem(
    'cmi5-player-logging-config',
    JSON.stringify(updatedConfig),
  );
  logger.info('Logging configuration updated', updatedConfig);
  // Note: Page refresh required for changes to take effect
};

export const getLoggingConfigForConsole = () => loggingConfig;

export const enableAllLogging = () => {
  setLoggingConfig({
    enabled: true,
    level: LogLevel.DEBUG,
    components: {
      auManager: true,
      cmi5: true,
      redux: true,
      navigation: true,
      hooks: true,
      api: true,
      performance: true,
      lms: true,
      media: true,
      all: true,
    },
  });
};

export const disableAllLogging = () => {
  setLoggingConfig({ enabled: false });
};

// Backward compatibility - keep existing function names
export const debugLogError = (message: string, data?: any) =>
  logger.error(message, data);
export const debugLogSuccess = (message: string, data?: any) =>
  logger.info(message, data);
export const debugLogWarning = (message: string, data?: any) =>
  logger.warn(message, data);
export const debugLog = (message: string, data?: any) =>
  logger.info(message, data);
export const debugLogObj = (data: any) => logger.debug('Object dump', data);

// Initialize logging
if (loggingConfig.enabled) {
  logger.info('CMI5 Player logging system initialized', {
    config: loggingConfig,
    buildTimeConfig: {
      enabled: (config as any).LOGGING_ENABLED || config.CLIENT_LOG || false,
      level: (config as any).LOGGING_LEVEL || 'INFO',
      components: (config as any).LOGGING_COMPONENTS || 'all',
    },
  });
} else {
  // Even if logging is disabled, log this once to console to help debug
  console.log('🔍 CMI5 Player logging system initialized but DISABLED', {
    config: loggingConfig,
    buildTimeConfig: {
      enabled: (config as any).LOGGING_ENABLED || config.CLIENT_LOG || false,
      level: (config as any).LOGGING_LEVEL || 'INFO',
      components: (config as any).LOGGING_COMPONENTS || 'all',
    },
    currentOrigin:
      typeof window !== 'undefined' ? window.location.origin : 'server',
  });
}
