import { STATEMENT_PRESETS } from './constants';
import { StatementPreset } from './types';

/**
 * Finds the preset that matches the current statement configuration.
 */
export const findMatchingStatementPreset = (
  presetId: string,
): StatementPreset | undefined => {
  return STATEMENT_PRESETS.find((preset) => preset.id === presetId);
};
