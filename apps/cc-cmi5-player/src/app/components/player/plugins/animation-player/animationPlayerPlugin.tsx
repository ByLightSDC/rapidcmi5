import { realmPlugin } from '@mdxeditor/editor';
import { addImportVisitor$ } from '@mdxeditor/editor';
import { debugLog } from '@rapid-cmi5/ui';
import { MdastAnimationVisitor } from './MdastAnimationVisitor';

/**
 * Animation Player Plugin for CMI5 Player
 * Read-only plugin that parses animation configurations from frontmatter
 * and makes them available for playback
 *
 * Unlike the editor plugin, this does NOT include:
 * - Authoring UI (drawer, timeline, config panels)
 * - Gurx state management
 * - Element selection
 * - Visual indicators
 *
 * It ONLY:
 * - Parses animations from frontmatter
 * - Makes them available via getSlideAnimations()
 */
export const animationPlayerPlugin = realmPlugin({
  init(realm) {
    debugLog(
      '🎬 Animation Player Plugin initialized',
      undefined,
      undefined,
      'animation',
    );

    // Register the visitor to parse frontmatter
    realm.pubIn({
      [addImportVisitor$]: MdastAnimationVisitor,
    });
  },
});
