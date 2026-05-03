import { type AnimationConfig } from '@rapid-cmi5/ui';
import * as yaml from 'js-yaml';

/**
 * Parse animations directly from markdown string
 * This is called every time slide content changes
 */
export function parseFrontmatterAnimations(
  markdown: string,
): AnimationConfig[] {
  if (!markdown || typeof markdown !== 'string') {
    console.log('⚠️ No markdown content to parse');
    return [];
  }

  console.log('🔍 Parsing frontmatter from markdown...');

  // Extract frontmatter between --- markers
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    console.log('📄 No frontmatter found in markdown');
    return [];
  }

  const frontmatterYaml = frontmatterMatch[1];
  console.log(
    '📋 Found frontmatter YAML:',
    frontmatterYaml.substring(0, 100) + '...',
  );

  try {
    const frontmatter: any = yaml.load(frontmatterYaml);
    console.log('✅ Parsed frontmatter:', frontmatter);

    if (
      frontmatter &&
      frontmatter.animations &&
      Array.isArray(frontmatter.animations)
    ) {
      console.log('🎬 Found', frontmatter.animations.length, 'animations!');

      // Store in window for backward compatibility with getSlideAnimations()
      (window as any).__slideAnimations = frontmatter.animations;

      return frontmatter.animations as AnimationConfig[];
    } else {
      console.log('📭 No animations array in frontmatter');
      return [];
    }
  } catch (error) {
    console.error('❌ Error parsing frontmatter YAML:', error);
    return [];
  }
}
