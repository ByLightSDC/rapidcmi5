/**
 * This plugin is responsible for both creating generic headings nodes and creating the TOC (Table of Contents).
 * For the TOC to work, each heading node needs an html id, this is what allows a hash link to navigate within a page.
 * The names of each heading are slugified to be unique and url compatible
 */
import {
  addActivePlugin$,
  addComposerChild$,
  addExportVisitor$,
  addImportVisitor$,
  addLexicalNode$,
  Cell,
  controlOrMeta,
  convertSelectionToNode$,
  createRootEditorSubscription$,
  realmPlugin,
} from '@mdxeditor/editor';
import { LexicalHeadingVisitor } from './LexicalHeadingVisitor';
import { MdastHeadingVisitor } from './MdastHeadingVisitor';

import {
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
  KEY_DOWN_COMMAND,
} from 'lexical';
import GithubSlugger from 'github-slugger';
import { $createTocHeadingNode, TOCHeadingNode } from './TocHeading';
import { TableOfContentsPlugin } from './TocPlugin';
import { TOCComponent } from './CollapsibleToc';

const slugger = new GithubSlugger();

export const githubSlugger$ = slugger;

const FORMATTING_KEYS = [48, 49, 50, 51, 52, 53, 54];

/**
 * @group Headings
 */
export const ALL_HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

/**
 * @group Headings
 */
export type HEADING_LEVEL = 1 | 2 | 3 | 4 | 5 | 6;

const CODE_TO_HEADING_LEVEL_MAP: Record<string, HEADING_LEVEL> = {
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
  54: 6,
};

/**
 * Holds the allowed heading levels.
 * @group Headings
 */
export const allowedHeadingLevels$ = Cell<readonly HEADING_LEVEL[]>(
  ALL_HEADING_LEVELS,
  (r) => {
    r.pub(createRootEditorSubscription$, (theRootEditor) => {
      return theRootEditor.registerCommand<KeyboardEvent>(
        KEY_DOWN_COMMAND,
        (event) => {
          const { keyCode, ctrlKey, metaKey, altKey } = event;
          if (
            FORMATTING_KEYS.includes(keyCode) &&
            controlOrMeta(metaKey, ctrlKey) &&
            altKey
          ) {
            event.preventDefault();
            theRootEditor.update(() => {
              if (keyCode === 48) {
                r.pub(convertSelectionToNode$, () => $createParagraphNode());
              } else {
                const allowedHeadingLevels = r.getValue(allowedHeadingLevels$);
                const requestedHeadingLevel =
                  CODE_TO_HEADING_LEVEL_MAP[keyCode];
                if (!allowedHeadingLevels.includes(requestedHeadingLevel)) {
                  r.pub(convertSelectionToNode$, () =>
                    $createTocHeadingNode(`h${requestedHeadingLevel}`, 'test'),
                  );
                }
              }
            });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      );
    });
  },
);

/**
 * A plugin that adds support for markdown headings.
 * @group Headings
 */
export const headingsPlugin = realmPlugin<{
  /**
   * Allows you to limit the headings used in the editor. Affects the block type dropdown and the keyboard shortcuts.
   * @default [1, 2, 3, 4, 5, 6]
   */
  allowedHeadingLevels?: readonly HEADING_LEVEL[];
  topOffset?: number;
}>({
  init(realm, params) {
    realm.pubIn({
      [addActivePlugin$]: 'headings',
      [addImportVisitor$]: MdastHeadingVisitor,
      [addLexicalNode$]: [TOCHeadingNode],

      [addExportVisitor$]: LexicalHeadingVisitor,
      [addComposerChild$]: () => (
        <TableOfContentsPlugin>
          {(tocEntries, editor) =>
            tocEntries.length > 0 ? (
              <TOCComponent
                editor={editor}
                tocEntries={tocEntries}
                topOffSet={params?.topOffset}
              />
            ) : (
              <></>
            )
          }
        </TableOfContentsPlugin>
      ),
    });
  },
  update(realm, params) {
    realm.pub(
      allowedHeadingLevels$,
      params?.allowedHeadingLevels ?? ALL_HEADING_LEVELS,
    );
  },
});
