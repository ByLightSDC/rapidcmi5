import { ContainerDirective } from 'mdast-util-directive';

/**
 * Grid layout preset configuration.
 * Defines valid column layouts with equal-width columns.
 */
export interface QuotePreset {
  /** Unique identifier for the preset */
  id: string;
  /** Display name shown in the settings modal */
  name: string;
}

/**
 * Represents a container directive node for a quotes layout.
 *
 * This node corresponds to the `:::quotes` directive
 */
export interface QuotesContainerDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::grid).
   */
  name: 'quotes';

  /**
   * Optional attributes for the quotes.
   */
  attributes: {
    backgroundColor?: string;
    preset?: string;
    textAlign?: string;
    [key: string]: string | undefined;
  };

  children: QuoteCellDirectiveNode[];
}

export interface QuoteCellDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::grid).
   */
  name: 'quoteContent';

  /**
   * Optional attributes for the grid cell.
   */
  attributes: {
    author?: string;
    avatar?: string;
    preset?: string;
    textAlign?: string;
    [key: string]: string | undefined;
  };
}
