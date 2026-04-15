import { QUOTE_PRESETS } from './constants';
import { QuotePreset } from './types';

/**
 * Finds the preset that matches the current quote configuration.
 */
export const findMatchingQuotePreset = (
  presetId: string,
): QuotePreset | undefined => {
  return QUOTE_PRESETS.find((preset) => preset.id === presetId);
};
