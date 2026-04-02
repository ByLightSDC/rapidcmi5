export const getMonacoTheme = (muiTheme: string) => {
  if (muiTheme === 'light') {
    return 'light';
  }
  return 'vs-dark';
};

/**
 * Maps runtime/environment language names to Monaco editor language identifiers.
 * Add entries here when a CodeRunner runtime name doesn't match Monaco's language id.
 */
export const runtimeToMonacoLanguage: Record<string, string> = {
  // JavaScript runtimes
  nodejs: 'javascript',
  node: 'javascript',
  'node.js': 'javascript',
  javascript: 'javascript',
  js: 'javascript',

  // TypeScript
  typescript: 'typescript',
  ts: 'typescript',

  // Python runtimes
  python3: 'python',
  python2: 'python',
  python: 'python',
  py: 'python',

  // Java
  java: 'java',

  // C / C++
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',

  // C#
  csharp: 'csharp',
  'c#': 'csharp',
  dotnet: 'csharp',

  // Go
  go: 'go',
  golang: 'go',

  // Ruby
  ruby: 'ruby',
  rb: 'ruby',

  // PHP
  php: 'php',

  // Rust
  rust: 'rust',

  // Kotlin
  kotlin: 'kotlin',

  // Swift
  swift: 'swift',

  // Shell / Bash
  bash: 'shell',
  sh: 'shell',
  shell: 'shell',

  // SQL
  sql: 'sql',

  // HTML / CSS / JSON / XML
  html: 'html',
  css: 'css',
  json: 'json',
  xml: 'xml',

  // Markdown
  markdown: 'markdown',
  md: 'markdown',
};

/**
 * Resolves a runtime language name to its Monaco language identifier.
 * Falls back to the input value if no mapping exists.
 */
export const resolveMonacoLanguage = (language: string): string =>
  runtimeToMonacoLanguage[language.toLowerCase()] ?? language.toLowerCase();
