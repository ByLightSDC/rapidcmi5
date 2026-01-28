import { AnimationConfig, debugLog } from '@rapid-cmi5/ui';
import { parse as parseYaml } from 'yaml';

/**
 * Parse animations from markdown frontmatter
 * @param markdown - The markdown content with frontmatter
 * @returns Array of animation configs, or empty array if none found
 */
export function parseAnimationsFromFrontmatter(
  markdown: string,
): AnimationConfig[] {
  try {
    // Extract frontmatter from markdown (between --- markers)
    const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return [];
    }

    const frontmatter = frontmatterMatch[1];
    const parsed = parseYaml(frontmatter);

    // Check if animations exist in frontmatter
    if (parsed && typeof parsed === 'object' && 'animations' in parsed) {
      const animations = parsed.animations;

      // Validate that it's an array
      if (Array.isArray(animations)) {
        // Validate and sanitize each animation
        const validAnimations: AnimationConfig[] = animations
          .filter((anim: any) => {
            // Basic validation - must have required fields
            // Note: targetNodeKey is optional for directive-based animations (V2)
            // which use directiveId instead
            const hasValidTargeting =
              typeof anim.targetNodeKey === 'string' ||
              typeof anim.directiveId === 'string';

            return (
              anim &&
              typeof anim === 'object' &&
              typeof anim.id === 'string' &&
              typeof anim.order === 'number' &&
              hasValidTargeting &&
              typeof anim.trigger === 'string' &&
              typeof anim.duration === 'number' &&
              typeof anim.delay === 'number' &&
              typeof anim.enabled === 'boolean'
            );
          })
          .map((anim: any) => ({
            id: anim.id,
            order: anim.order,
            // V1: targetNodeKey (required for legacy animations)
            // V2: may be undefined for directive-based animations
            targetNodeKey: anim.targetNodeKey || '',
            stableId: anim.stableId,  // CRITICAL: Load stable ID for resolution!
            directiveId: anim.directiveId, // CRITICAL: Load directive ID for V2 animations!
            targetLabel: anim.targetLabel,
            entranceEffect: anim.entranceEffect,
            exitEffect: anim.exitEffect,
            trigger: anim.trigger,
            duration: anim.duration,
            delay: anim.delay,
            easing: anim.easing,
            direction: anim.direction,
            enabled: anim.enabled,
          }));

        debugLog('Loaded animations from frontmatter:', validAnimations);
        return validAnimations;
      }
    }

    return [];
  } catch (error) {
    console.error('Error parsing animations from frontmatter:', error);
    return [];
  }
}
