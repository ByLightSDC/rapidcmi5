import { GridCellDirectiveNode, GridPreset } from './types';

/**
 * Available grid layout presets.
 * Each preset uses equal-width columns.
 */
export const GRID_PRESETS: GridPreset[] = [
  {
    id: '1-col',
    name: 'Single Column',
    columns: 1,
  },
  {
    id: '2-col',
    name: 'Two Columns',
    columns: 2,
  },
  {
    id: '3-col',
    name: 'Three Columns',
    columns: 3,
  },
  {
    id: '4-col',
    name: 'Four Columns',
    columns: 4,
  },
];

/**
 * Default grid cell node structure for creating new cells.
 */
export const DEFAULT_GRID_CELL: GridCellDirectiveNode = {
  type: 'containerDirective',
  name: 'grid',
  attributes: {},
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Grid Content Goes Here',
        },
      ],
    },
  ],
};

/**
 * Default markdown for initial grid insertion (single column).
 * The first line return is REQUIRED!
 */
export const DEFAULT_GRID = `
:::grid

Grid Content Goes Here
:::`;

/**
 * Creates a new empty grid cell node.
 */
export const createGridCell = (): GridCellDirectiveNode => ({
  type: 'containerDirective',
  name: 'grid',
  attributes: {},
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Grid Content Goes Here',
        },
      ],
    },
  ],
});

/**
 * Finds the preset that matches the current grid configuration.
 */
export const findMatchingPreset = (
  cellCount: number,
): GridPreset | undefined => {
  return GRID_PRESETS.find((preset) => preset.columns === cellCount);
};
