import { Cell } from '@mdxeditor/editor';
import { createCommand } from 'lexical';
import {
  ApplyFxHandler,
  FxDirectiveAttributes,
  FxGlobalSelection,
  RefreshFxHandler,
} from './types';

export const defaultFxColor = '#000000';
export const selFxNode$ = Cell<FxGlobalSelection | null>(null);
export const applyFx$ = Cell<ApplyFxHandler | null>(null);
export const refreshDelay = 50;
export const refreshTextFx$ = Cell<RefreshFxHandler | null>(null);

export const showTextFx$ = Cell<boolean>(true);

export const DEFAULT_SHAPE: FxDirectiveAttributes = {
  type: 'circle',
  color: '#000000',
};

export const CHANGE_TEXT_FX = createCommand();