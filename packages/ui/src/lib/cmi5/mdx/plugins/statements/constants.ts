import { StatementPreset } from './types';

/**
 * Available statements layout presets.
 */
export const STATEMENT_PRESETS: StatementPreset[] = [
  {
    id: '1',
    name: 'Centered & Compact',
  },
  {
    id: '2',
    name: 'Centered',
  },
  {
    id: '3',
    name: 'Left Aligned',
  },
  {
    id: '4',
    name: 'Left Aligned & Compact',
  },
];

/** The first line return is REQUIRED!!!! */
export const DEFAULT_STATEMENTS = `
:::statementContent
"Stop chasing every alert in the queue. Step back, breathe, and look at the full picture. The signal is there. The pattern is clear. There's a threat to neutralize."
:::
`;

/**
 * Font styles for each statement layout preset
 */
export const statementFontPresets = {
  '1': {
    fontSize: '18px',
    fontWeight: undefined,
    fontLineHeight: undefined,
    textAlign: 'center',
  },
  '2': {
    fontSize: '32px',
    fontWeight: 200,
    fontLineHeight: 1.3,
    textAlign: 'center',
  },
  '3': {
    fontSize: '32px',
    fontWeight: 200,
    fontLineHeight: 1.3,
    textAlign: 'left',
  },
  '4': {
    fontSize: '24px',
    fontWeight: undefined,
    fontLineHeight: undefined,
    textAlign: 'left',
  },
};
