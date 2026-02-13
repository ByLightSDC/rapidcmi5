import { ContainerDirective } from 'mdast-util-directive';

/**
 * Represents a container directive node for displaying text on an mage.
 *
 * This node corresponds to the parent `:::imageText` directive block,
 * which can contain children.
 */
export interface ImageTextDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::accordion).
   */
  name: 'imageText';

  /**
   * Required attributes for image text
   * - `imageId`: Which image displays the text
   * - `x`: X Position
   * - `y`: Y Position
   */
  attributes: {
    imageId: string;
    x: string;
    y: string;
  };

}
