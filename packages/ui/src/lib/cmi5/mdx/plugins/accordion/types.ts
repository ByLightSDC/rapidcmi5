import { ContainerDirective } from 'mdast-util-directive';

/**
 * Represents a container directive node for an accordion group.
 *
 * This node corresponds to the parent `:::accordion` directive block,
 * which can contain one or more `accordionContent` children.
 */
export interface AccordionDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::accordion).
   */
  name: 'accordion';

  /**
   * Optional attributes for customizing the accordion container.
   * - `color`: Used for visual styling (e.g. tab highlight color).
   */
  attributes: {
    style?: string;
  };

  children: AccordionContentDirectiveNode[];
}

/**
 * Represents a container directive node for a single accordion item inside an accordion group.
 *
 * This node corresponds to the `:::accordionContent` directive, which defines the
 * label and content of one accordion within the accordion container.
 */

export interface AccordionContentDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::accordionContent).
   */
  name: 'accordionContent';

  /**
   * Optional attributes specific to an individual accordion.
   * - `title`: The label shown on the tab header.
   */
  attributes: {
    id?: string;
    title?: string;
    textAlign?: string;
  };
}
