import { QuotePreset } from './types';

/**
 * Available grid layout presets.
 * Each preset uses equal-width columns.
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
:::quoteContent{author="##### Author Name&#xA;" avatar="${placeholderAvatar}"}
"My secret power is actually a practice. I tell myself every morning that I'm on a once-in-a-lifetime adventure. So when things go wacky, I actually feel thankful that I'm experiencing something new."
:::
`;
