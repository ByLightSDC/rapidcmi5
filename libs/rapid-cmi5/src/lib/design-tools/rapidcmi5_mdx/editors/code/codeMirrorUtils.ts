import { Text } from '@codemirror/state';
import { Diagnostic, linter } from '@codemirror/lint';
import { validateMarkdownDirectives } from '@rapid-cmi5/cmi5-build/common';


function getOffset(doc: Text, line: number, column: number) {
  const lineObj = doc.line(line);
  return lineObj.from + column;
}

export const directiveLinter = linter((view) => {
  const text = view.state.doc.toString();
  const doc = view.state.doc;
  const rawErrors = validateMarkdownDirectives(text); // your custom validator

  const diagnostics: Diagnostic[] = rawErrors.map((err) => {
    // MD AST line/column is usually 1-based, subtract if needed
    const from = getOffset(doc, err.startLineNumber, err.startColumn);
    const to = Math.min(
      getOffset(doc, err.endLineNumber, err.endColumn),
      doc.length - 1,
    );

    return {
      from,
      to,
      severity: 'error',
      message: err.message,
    };
  });

  return diagnostics;
});