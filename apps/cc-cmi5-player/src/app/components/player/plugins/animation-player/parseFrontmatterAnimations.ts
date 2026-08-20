import { AnimationConfig, debugLog } from '@rapid-cmi5/ui';
import * as yaml from 'js-yaml';

/**
 * Parse animations directly from markdown string
 * This is called every time slide content changes
 */
export function parseFrontmatterAnimations(
  markdown: string,
): AnimationConfig[] {
  if (!markdown || typeof markdown !== 'string') {
    debugLog(
      '⚠️ No markdown content to parse',
      undefined,
      undefined,
      'animation',
    );
    return [];
  }

  debugLog(
    '🔍 Parsing frontmatter from markdown...',
    undefined,
    undefined,
    'animation',
  );

  // Extract frontmatter between --- markers
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    debugLog(
      '📄 No frontmatter found in markdown',
      undefined,
      undefined,
      'animation',
    );
    return [];
  }

  const frontmatterYaml = frontmatterMatch[1];
  debugLog(
    '📋 Found frontmatter YAML:',
    frontmatterYaml.substring(0, 100) + '...',
    undefined,
    'animation',
  );

  try {
    const frontmatter: any = yaml.load(frontmatterYaml);
    debugLog('✅ Parsed frontmatter:', frontmatter, undefined, 'animation');

    if (
      frontmatter &&
      frontmatter.animations &&
      Array.isArray(frontmatter.animations)
    ) {
      debugLog(
        `🎬 Found ${frontmatter.animations.length} animations!`,
        undefined,
        undefined,
        'animation',
      );

      // Store in window for backward compatibility with getSlideAnimations()
      (window as any).__slideAnimations = frontmatter.animations;

      return frontmatter.animations as AnimationConfig[];
    } else {
      debugLog(
        '📭 No animations array in frontmatter',
        undefined,
        undefined,
        'animation',
      );
      return [];
    }
  } catch (error) {
    console.error('❌ Error parsing frontmatter YAML:', error);
    return [];
  }
}
