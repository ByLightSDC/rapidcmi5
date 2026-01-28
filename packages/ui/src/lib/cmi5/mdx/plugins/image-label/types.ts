import { ContainerDirective } from 'mdast-util-directive';

/**
 * Represents a container directive node for an accordion group.
 *
 * This node corresponds to the parent `:::accordion` directive block,
 * which can contain one or more `accordionContent` children.
 */
export interface ImageLabelDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::accordion).
   */
  name: 'imageLabel';

  /**
   * Optional attributes for customizing the accordion container.
   * - `color`: Used for visual styling (e.g. tab highlight color).
   */
  attributes: {
    imageId?: string;
    title?: string;
    x?: string;
    y?: string;
  };

}
