import { QuotePreset } from './types';

/**
 * Available quotes layout presets.
 */
export const QUOTE_PRESETS: QuotePreset[] = [
  {
    id: '1',
    name: 'Compact Vertical',
  },
  {
    id: '2',
    name: 'Vertical',
  },
  {
    id: '3',
    name: 'Horizontal',
  },
  {
    id: '4',
    name: 'Compact Horizontal',
  },
];

export const placeholderAvatar = '/assets/images/quoteAuthorPlaceholder.png';
/** The first line return is REQUIRED!!!! */
export const DEFAULT_QUOTES = `
:::quoteContent{author="Alex Mercer, Senior Threat Intelligence Analyst" avatar="${placeholderAvatar}"}
"The question isn't whether you've been breached — it's whether you know about it yet."
:::
`;

export const fontPresets = {
  '1': {
    fontSize: '14px',
    fontWeight: 400,
    authorFontSize: '14px',
    authorFontWeight: 400,
    fontLineHeight: undefined,
    textAlign: 'center',
  },
  '2': {
    fontSize: '32px',
    fontWeight: 200,
    authorFontSize: '16px',
    authorFontWeight: 250,
    fontLineHeight: 1.3,
    textAlign: 'center',
  },
  '3': {
    fontSize: '16px',
    fontWeight: 300,
    authorFontSize: '16px',
    authorFontWeight: 400,
    fontLineHeight: undefined,
    textAlign: 'left',
  },
  '4': {
    fontSize: '14px',
    fontWeight: 400,
    authorFontSize: '14px',
    authorFontWeight: 400,
    fontLineHeight: undefined,
    textAlign: 'left',
  },
};
