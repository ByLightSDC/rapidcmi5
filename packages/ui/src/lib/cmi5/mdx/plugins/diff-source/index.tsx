import { Extension } from '@codemirror/state';
import { DiffSourceWrapper } from './DiffSourceWrapper';
import { Cell } from '@mdxeditor/gurx';
import {
  realmPlugin,
  ViewMode,
  addEditorWrapper$,
  viewMode$,
} from '@mdxeditor/editor';

/** @internal */
export const diffMarkdown$ = Cell('');

/** @internal */
export const cmExtensions$ = Cell<Extension[]>([]);

/** @internal */
export const readOnlyDiff$ = Cell(false);

/**
 * @group Diff/Source
 */
export const diffSourcePlugin = realmPlugin<{
  /**
   * The initial view mode of the editor.
   * @default 'rich-text'
   */
  viewMode?: ViewMode;
  /**
   * The markdown to show in the diff editor.
   * @default ''
   */
  diffMarkdown?: string;
  /**
   * Optional, additional CodeMirror extensions to load in the diff/source mode.
   */
  codeMirrorExtensions?: Extension[];
  /**
   * Set the diff editor to read-only.
   * @default false
   */
  readOnlyDiff?: boolean;
}>({
  update: (r, params) => {
    r.pub(diffMarkdown$, params?.diffMarkdown ?? '');
  },

  init(r, params) {
    r.pubIn({
      [diffMarkdown$]: params?.diffMarkdown ?? '',
      [cmExtensions$]: params?.codeMirrorExtensions ?? [],
      [addEditorWrapper$]: DiffSourceWrapper,
      [readOnlyDiff$]: params?.readOnlyDiff ?? false,
      [viewMode$]: params?.viewMode ?? 'rich-text',
    });
  },
});
