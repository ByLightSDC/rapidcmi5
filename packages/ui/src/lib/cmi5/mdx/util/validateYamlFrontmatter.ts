import { parse as parseYaml } from 'yaml';

export interface YamlValidationResult {
  isValid: boolean;
  error?: string;
  lineNumber?: number;
  details?: string;
}

/**
 * Validates YAML frontmatter in markdown content
 * @param markdown - The full markdown content including frontmatter
 * @returns Validation result with error details if invalid
 */
export function validateYamlFrontmatter(markdown: string): YamlValidationResult {
  try {
    // Extract frontmatter from markdown (between --- markers)
    const frontmatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/);

    if (!frontmatterMatch) {
      // No frontmatter is valid
      return { isValid: true };
    }

    const frontmatter = frontmatterMatch[1];

    // Attempt to parse YAML
    const parsed = parseYaml(frontmatter);

    // Successfully parsed
    return { isValid: true };

  } catch (error: any) {
    // Extract error details from YAML parse error
    const errorMessage = error.message || String(error);

    // Try to extract line number from error message
    // YAML parser errors often include line and column information
    const lineMatch = errorMessage.match(/\((\d+):(\d+)\)/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

    return {
      isValid: false,
      error: 'Invalid YAML frontmatter',
      lineNumber,
      details: errorMessage,
    };
  }
}

/**
 * Validates YAML frontmatter and throws an error if invalid
 * Use this in save handlers to prevent saving invalid YAML
 * @param markdown - The full markdown content including frontmatter
 * @throws Error with validation details if YAML is invalid
 */
export function assertValidYamlFrontmatter(markdown: string): void {
  const result = validateYamlFrontmatter(markdown);

  if (!result.isValid) {
    const errorMsg = result.lineNumber
      ? `${result.error} at line ${result.lineNumber}: ${result.details}`
      : `${result.error}: ${result.details}`;

    throw new Error(errorMsg);
  }
}
