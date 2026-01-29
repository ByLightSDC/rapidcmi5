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

export const languageOptions = Object.entries(languageList)
  .map(([k, v]) => ({
    value: k,
    label: v,
  }))
  .sort();
