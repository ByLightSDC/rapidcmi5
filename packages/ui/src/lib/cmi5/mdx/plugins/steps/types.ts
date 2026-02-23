import { ContainerDirective } from 'mdast-util-directive';

/**
 * Represents a container directive node for a stepper.
 *
 * This node corresponds to the parent `:::steps` directive block,
 * which can contain one or more `stepContent` children.
 */
export interface StepDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::steps).
   */
  name: 'step';

  /**
   * Optional attributes for customizing the stepper container.
   * - `color`: Used for visual styling (e.g. stepper highlight color).
   */
  attributes: {
    style?: string;
  };

  children: StepContentDirectiveNode[];
}

/**
 * Represents a leaf directive node for a single step inside a stepper.
 *
 * This node corresponds to the `:::stepContent` directive, which defines the
 * label and content of one step within the stepper.
 */

export interface StepContentDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::tabContent).
   */
  name: 'stepContent';

  /**
   * Optional attributes specific to an individual step.
   * - `title`: The label shown on the step header.
   */
  attributes: {
    title?: string;
    textAlign?: string;
  };
}
