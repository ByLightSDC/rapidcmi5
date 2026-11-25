import { langs, langNames } from '@uiw/codemirror-extensions-langs';

const blackList = ['brainfuck'];

export const languageList = langNames
  .sort()
  .reduce((acc: Record<string, string>, key: string) => {
    if (blackList.includes(key)) {
      return acc;
    }
    acc[key] = key;
    return acc;
  }, {});

/**
 * Picker-only languages: not in languageList because another code block
 * descriptor renders them (picking one swaps the CodeMirror editor out).
 * 'mermaid' lets a diagram converted to a code block be turned back.
 */
const pickerOnlyLanguages = ['mermaid'];

export const languageOptions = [...Object.keys(languageList), ...pickerOnlyLanguages]
  .sort()
  .map((k) => ({
    value: k,
    label: k,
  }));
