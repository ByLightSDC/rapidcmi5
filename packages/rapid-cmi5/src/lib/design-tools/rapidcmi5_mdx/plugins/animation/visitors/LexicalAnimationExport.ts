import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { AnimationConfig } from '../types/Animation.types';
import { debugLog } from '@rapid-cmi5/ui';

/**
 * Inject animations into markdown frontmatter
 * @param markdown - The markdown content
 * @param animations - Array of animation configs to inject
 * @returns Updated markdown with animations in frontmatter
 */
export function injectAnimationsIntoFrontmatter(
  markdown: string,
  animations: AnimationConfig[],
): string {
  try {
    // Check if animations exist and are non-empty
    if (!animations || animations.length === 0) {
      // Remove animations from frontmatter if present
      return removeAnimationsFromFrontmatter(markdown);
    }

    // Check if frontmatter exists
    const frontmatterMatch = markdown.match(
      /^---\s*\n([\s\S]*?)\n---\n?([\s\S]*)$/,
    );

    if (frontmatterMatch) {
      // Parse existing frontmatter
      const existingFrontmatter = parseYamlSafe(frontmatterMatch[1]);
      const restOfMarkdown = frontmatterMatch[2];

      // Add/update animations
      existingFrontmatter.animations = animations;

      // Serialize back to YAML
      const newFrontmatter = stringifyYaml(existingFrontmatter);
      const result = `---\n${newFrontmatter}---\n${restOfMarkdown}`;

      debugLog('Injected animations into frontmatter:', animations);
      return result;
    } else {
      // No frontmatter exists, create it
      const frontmatter = { animations };
      const yamlString = stringifyYaml(frontmatter);
      const result = `---\n${yamlString}---\n${markdown}`;

      debugLog('Created frontmatter with animations:', animations);
      return result;
    }
  } catch (error) {
    console.error('Error injecting animations into frontmatter:', error);
    return markdown;
  }
}

/**
 * Remove animations from frontmatter if present
 * @param markdown - The markdown content
 * @returns Markdown with animations removed from frontmatter
 */
function removeAnimationsFromFrontmatter(markdown: string): string {
  try {
    const frontmatterMatch = markdown.match(
      /^---\s*\n([\s\S]*?)\n---\n?([\s\S]*)$/,
    );

    if (frontmatterMatch) {
      const existingFrontmatter = parseYamlSafe(frontmatterMatch[1]);
      const restOfMarkdown = frontmatterMatch[2];

      if (existingFrontmatter.animations) {
        delete existingFrontmatter.animations;

        // If frontmatter is now empty, remove it entirely
        if (Object.keys(existingFrontmatter).length === 0) {
          debugLog('Removed empty frontmatter');
          return restOfMarkdown;
        }

        // Otherwise, update it
        const newFrontmatter = stringifyYaml(existingFrontmatter);
        debugLog('Removed animations from frontmatter');
        return `---\n${newFrontmatter}---\n${restOfMarkdown}`;
      }
    }

    return markdown;
  } catch (error) {
    console.error('Error removing animations from frontmatter:', error);
    return markdown;
  }
}

/**
 * Parse YAML safely, returning empty object on error
 */
function parseYamlSafe(yamlString: string): any {
  try {
    const parsed = parseYaml(yamlString);
    return parsed || {};
  } catch (error) {
    console.warn('Error parsing existing YAML, starting fresh:', error);
    return {};
  }
}
