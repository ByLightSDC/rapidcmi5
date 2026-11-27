export type RepositoryEnvironment = 'browser' | 'desktop';

/**
 * Return true to allow copying desktop metadata for browser use.
 * Desktop warnings are informational; opening requires manual conversion.
 */
export type RepositoryCompatibilityWarning = (
  environment: RepositoryEnvironment,
) => Promise<boolean>;
