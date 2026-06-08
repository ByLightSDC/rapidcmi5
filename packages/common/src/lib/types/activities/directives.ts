import { ContainerDirective } from 'mdast-util-directive';
import { ContentWidthEnum } from '../ui';

/**
 * Represents a container directive node for a tab group.
 *
 * This node corresponds to the parent `:::tab` directive block,
 * which can contain one or more `tabContent` children.
 */
export interface ActivityDirectiveNode extends ContainerDirective {
  name:
    | 'download'
    | 'consoles'
    | 'ctf'
    | 'quiz'
    | 'codeRunner'
    | 'quiz'
    | 'scenario';

  /**
   * Optional attributes for customizing the tab container.
   * - `color`: Used for visual styling (e.g. tab highlight color).
   */
  attributes?: {
    style?: string;
    backgroundColor?: string;
    contentWidth?: ContentWidthEnum;
  } | null;

  children: any;
}

export type DirectiveName = ActivityDirectiveNode['name'];
