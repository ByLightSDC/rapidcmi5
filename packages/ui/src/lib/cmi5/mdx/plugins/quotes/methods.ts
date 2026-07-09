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

export interface QuotePresetLayout {
  direction: 'row' | 'column';
  imgSize: string;
  imgRadius: string;
  /**
   * undefined (not 0) for preset '2' — NestedLexicalEditor renders with extra
   * top padding baked in, so leaving this unset (rather than zeroing it like
   * every other preset) balances it out visually.
   */
  paddingTop: number | undefined;
}

/**
 * Single source of truth for the avatar/direction/padding layout per quote
 * preset. QuoteContentEditor (live editing) and StaticQuoteItem (playback,
 * in QuotesContainerEditor) both render the same visual layout through two
 * different mechanisms — a live Lexical editor vs. static JSX from raw mdast
 * — so without a shared helper the per-preset values could silently drift
 * apart between the two.
 */
export const getQuotePresetLayout = (preset: string): QuotePresetLayout => ({
  direction: preset === '3' || preset === '4' ? 'row' : 'column',
  imgSize: preset === '3' ? '160px' : '72px',
  imgRadius: preset === '3' ? '' : '50%',
  paddingTop: preset === '2' ? undefined : 0,
});
