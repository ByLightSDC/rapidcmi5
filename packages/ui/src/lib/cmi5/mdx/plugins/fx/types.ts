import { LeafDirective } from 'mdast-util-directive';
import { RoughNotationProps, types } from 'react-rough-notation';

/**
 * Defined Mdast Node Attributes
 * TODO add additional Rough Notation properties see RoughNotationProps
 */
export interface FxDirectiveNode extends LeafDirective {
  name: 'fx';
  attributes: { type: types; color?: string };
}

export interface FxGlobalSelection extends FxDirectiveNode {
  id?: string;
}

//extends RoughNotationProps MINUS children
export interface FxDirectiveAttributes {
  type: types | 'none';
  color?: string;
  brackets?: string[];
}

export type ApplyFxHandler = (data: FxDirectiveAttributes) => void;
export type RefreshFxHandler = () => void;
