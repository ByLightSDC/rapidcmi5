import { ContainerDirective, LeafDirective } from 'mdast-util-directive';

/**
 * Represents a container directive node for a tab group.
 *
 * This node corresponds to the parent `:::tab` directive block,
 * which can contain one or more `tabContent` children.
 */
export interface StepDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::tab).
   */
  name: 'step';

  /**
   * Optional attributes for customizing the tab container.
   * - `color`: Used for visual styling (e.g. tab highlight color).
   */
  attributes: {
    style?: string;
  };

  children: StepContentDirectiveNode[];
}

/**
 * Represents a leaf directive node for a single tab item inside a tab group.
 *
 * This node corresponds to the `:::tabContent` directive, which defines the
 * label and content of one tab within the tab container.
 */

//export interface TabContentDirectiveNode extends LeafDirective {
export interface StepContentDirectiveNode extends ContainerDirective {
  /**
   * The directive name used in markdown (e.g. :::tabContent).
   */
  name: 'stepContent';

  /**
   * Optional attributes specific to an individual tab.
   * - `title`: The label shown on the tab header.
   */
  attributes: {
    title?: string;
    textAlign?: string;
  };
}
