import { ContainerDirective } from 'mdast-util-directive';
import { ContentWidthEnum } from '@rapid-cmi5/cmi5-build-common';

/**
 * Grid layout preset configuration.
 * Defines valid column layouts with equal-width columns.
 */
export interface GridPreset {
  /** Unique identifier for the preset */
  id: string;
  /** Display name shown in the settings modal */
  name: string;
  /** Number of columns in this preset */
  columns: number;
}

/**
 * Represents a container directive node for a grid layout.
 *
 * This node corresponds to the parent `::::gridContainer` directive block,
 * which can contain one or more `grid` children.
 */
export interface GridContainerDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. ::::gridContainer).
   */
  name: 'gridContainer';

  /**
   * Optional attributes for customizing the grid container.
   * - `style`: Inline CSS styles for the container.
   */
  attributes: {
    style?: string;
    backgroundColor?: string;
    contentWidth?: ContentWidthEnum;
  };

  children: GridCellDirectiveNode[];
}

/**
 * Represents a container directive node for a single grid cell inside a grid layout.
 *
 * This node corresponds to the `:::grid` directive, which defines
 * the content of one cell within the grid container.
 */
export interface GridCellDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::grid).
   */
  name: 'grid';

  /**
   * Optional attributes for the grid cell.
   */
  attributes: {
    textAlign?: string;
    [key: string]: string | undefined;
  };
}
