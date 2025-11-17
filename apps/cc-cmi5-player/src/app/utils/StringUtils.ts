/**
 * Convert kebab-case property names to camelCase.
 * This is handy because React expects camelCase when applying styles.
 * @param kebab
 */
export const kebabToCamel = (kebab: string) => {
  return kebab.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};
