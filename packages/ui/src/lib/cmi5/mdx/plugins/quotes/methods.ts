import { QUOTE_PRESETS } from './constants';
import { QuoteCellDirectiveNode, QuotePreset } from './types';

/**
 * Creates a new empty grid cell node.
 */
export const createQuoteCell = (): QuoteCellDirectiveNode => ({
  type: 'containerDirective',
  name: 'quoteContent',
  attributes: { author: 'Author Name Goes Here', avatar: 'Image Path' },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Quote Content Goes Here',
        },
      ],
    },
  ],
});

/**
 * Finds the preset that matches the current grid configuration.
 */
export const findMatchingQuotePreset = (
  presetId: string,
): QuotePreset | undefined => {
  return QUOTE_PRESETS.find((preset) => preset.id === presetId);
};

export const stripLeadingHashes = (str: string): string => {
  return str.replace(/^#+/, '').trimStart();
};
