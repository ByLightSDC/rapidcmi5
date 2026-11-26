/** Git branch rules, including names that conflict with existing branch paths. */
export function getBranchNameError(
  name: string,
  branches: string[] = [],
): string | null {
  if (!name) return 'Enter a branch name.';
  if (
    name === 'HEAD' ||
    name === '@' ||
    name.startsWith('-') ||
    /[\x00-\x20\x7f~^:?*\[\\]/.test(name) ||
    name.includes('..') ||
    name.includes('@{') ||
    name.endsWith('.') ||
    name
      .split('/')
      .some((part) => !part || part.startsWith('.') || part.endsWith('.lock'))
  )
    return 'Enter a valid Git branch name, such as feature/new-lesson.';
  if (branches.includes(name)) return 'A branch with this name already exists.';
  if (
    branches.some(
      (branch) =>
        branch.startsWith(`${name}/`) || name.startsWith(`${branch}/`),
    )
  ) {
    return 'This name conflicts with an existing branch path.';
  }
  return null;
}
