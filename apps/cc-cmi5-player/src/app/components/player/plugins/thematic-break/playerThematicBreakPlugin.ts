import { realmPlugin, addLexicalNode$, importVisitors$ } from '@mdxeditor/editor';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import type { MdastImportVisitor } from '@mdxeditor/editor';
import type * as Mdast from 'mdast';

/**
 * Replaces the stock HorizontalRuleNode with a subclass whose decorate()
 * returns null, preventing Lexical / LexicalRichTextPlugin from creating a
 * React portal with the <hr> as the container. React registers event listeners
 * on portal containers; Chrome's accessibility tree detects those and surfaces
 * the <hr> to NVDA as "separator clickable". With no portal there are no
 * listeners, so NVDA announces "separator" only.
 *
 * Two-part fix:
 *
 * 1. Register PlayerHorizontalRuleNode via addLexicalNode$. Because
 *    getType() === 'horizontalrule' on both classes, Lexical's registeredNodes
 *    map entry for that type is overwritten: klass → PlayerHorizontalRuleNode.
 *
 * 2. Replace the stock MdastThematicBreakVisitor in importVisitors$. The stock
 *    visitor calls $createHorizontalRuleNode() which instantiates HorizontalRuleNode.
 *    Now that PlayerHorizontalRuleNode is the registered klass, Lexical's
 *    errorOnTypeKlassMismatch check (constructor !== registeredKlass) would throw.
 *    Our visitor creates new PlayerHorizontalRuleNode() directly so the klass
 *    check passes.
 *
 * Only used in RC5Player (always readOnly) — no isPlayback guard needed.
 * The editor uses thematicBreakPlugin() alone and is unaffected.
 */
class PlayerHorizontalRuleNode extends HorizontalRuleNode {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: PlayerHorizontalRuleNode): PlayerHorizontalRuleNode {
    return new PlayerHorizontalRuleNode(node.__key);
  }

  decorate(): ReturnType<HorizontalRuleNode['decorate']> {
    // null skips reconcileDecorator in Lexical (Lexical.dev.js line 1467:
    // `if (decorator !== null)`) so no React portal is created on the <hr>.
    return null as unknown as ReturnType<HorizontalRuleNode['decorate']>;
  }
}

const PlayerMdastThematicBreakVisitor: MdastImportVisitor<Mdast.ThematicBreak> =
  {
    testNode: 'thematicBreak',
    visitNode({ actions }) {
      actions.addAndStepInto(new PlayerHorizontalRuleNode());
    },
  };

export const playerThematicBreakPlugin = realmPlugin({
  init(realm) {
    // Step 1: register PlayerHorizontalRuleNode. addLexicalNode$ is an Appender
    // that appends to usedLexicalNodes$, which is later passed to createEditor.
    // Since both classes share getType() === 'horizontalrule', the second
    // registeredNodes.set() call overwrites the first, making PlayerHorizontalRuleNode
    // the klass for that type.
    realm.pubIn({
      [addLexicalNode$]: PlayerHorizontalRuleNode,
    });

    // Step 2: swap out the stock MdastThematicBreakVisitor. Appender only ever
    // appends, so instead we read the current visitors array, replace the stock
    // entry in place, and write the array back directly to importVisitors$.
    // thematicBreakPlugin() always runs before this plugin (see RC5Player.tsx),
    // so the stock visitor is already in the array by the time this init runs.
    const visitors = realm.getValue(
      importVisitors$ as Parameters<typeof realm.getValue>[0],
    );
    const updated = (visitors as MdastImportVisitor<Mdast.Nodes>[]).map((v) =>
      typeof v.testNode === 'string' && v.testNode === 'thematicBreak'
        ? PlayerMdastThematicBreakVisitor
        : v,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (realm.pub as any)(importVisitors$, updated);
  },
});
