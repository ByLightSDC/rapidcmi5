import { ContainerDirective } from 'mdast-util-directive';

/**
 * Statement layout preset configuration.
 */
export interface StatementPreset {
  /** Unique identifier for the preset */
  id: string;
  /** Display name shown in the settings modal */
  name: string;
}

/**
 * Represents a container directive node for a statements layout.
 *
 * This node corresponds to the `:::statements` directive
 */
export interface StatementsContainerDirectiveNode extends ContainerDirective {
  name: 'statements';

  attributes: {
    backgroundColor?: string;
    preset?: string;
    textAlign?: string;
    [key: string]: string | undefined;
  };

  children: StatementContentDirectiveNode[];
}

export interface StatementContentDirectiveNode extends ContainerDirective {
  name: 'statementContent';

  attributes: {
    author?: string;
    avatar?: string;
    preset?: string;
    textAlign?: string;
    [key: string]: string | undefined;
  };
}
