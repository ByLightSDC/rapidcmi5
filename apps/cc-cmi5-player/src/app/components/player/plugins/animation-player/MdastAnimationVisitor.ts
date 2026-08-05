import { MdastImportVisitor } from '@mdxeditor/editor';
import { Yaml } from 'mdast';
import * as yaml from 'js-yaml';
import { AnimationConfig, debugLog } from '@rapid-cmi5/ui';

/**
 * Parse animations from markdown frontmatter
 * Used by CMI5 player to read animation configurations
 */
export const MdastAnimationVisitor: MdastImportVisitor<Yaml> = {
  testNode: (node) => {
    const isYaml = node.type === 'yaml';
    debugLog(
      '🔍 Animation visitor testNode:',
      { type: node.type, isYaml },
      undefined,
      'animation',
    );
    return isYaml;
  },

  visitNode({ mdastNode }) {
    debugLog(
      '🎯 Animation visitor visitNode called',
      undefined,
      undefined,
      'animation',
    );
    debugLog('📄 YAML value:', mdastNode.value, undefined, 'animation');

    try {
      // Parse frontmatter
      const frontmatter: any = yaml.load(mdastNode.value || '');
      debugLog('✅ Parsed frontmatter:', frontmatter, undefined, 'animation');

      // Extract animations
      if (
        frontmatter &&
        frontmatter.animations &&
        Array.isArray(frontmatter.animations)
      ) {
        debugLog(
          `📋 Found ${frontmatter.animations.length} animations in frontmatter`,
          undefined,
          undefined,
          'animation',
        );

        // Store animations in a global variable or context for the player to access
        // This is a simple approach - in production you might use a more sophisticated state management
        (window as any).__slideAnimations =
          frontmatter.animations as AnimationConfig[];

        return frontmatter.animations;
      } else {
        console.warn('⚠️ No animations found in frontmatter:', {
          hasFrontmatter: !!frontmatter,
          hasAnimations: frontmatter?.animations,
          isArray: Array.isArray(frontmatter?.animations),
        });
      }
    } catch (error) {
      console.error('❌ Error parsing animation frontmatter:', error);
    }

    return null;
  },
};

/**
 * Helper function to get animations from the window object
 * Call this after MDXEditor has parsed the markdown
 */
export function getSlideAnimations(): AnimationConfig[] {
  const animations = (window as any).__slideAnimations || [];
  debugLog(
    `🎬 Retrieved ${animations.length} animations from frontmatter`,
    undefined,
    undefined,
    'animation',
  );
  return animations;
}

/**
 * Clear animations (call when changing slides)
 */
export function clearSlideAnimations(): void {
  (window as any).__slideAnimations = [];
}
