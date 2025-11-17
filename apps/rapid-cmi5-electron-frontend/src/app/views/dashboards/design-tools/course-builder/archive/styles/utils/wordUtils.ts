export const orderedListRegex = /[0-9]+\./;
const bulletListPattern = '* ';

export const getPreceedingCharsThisLine = (lineText: string) => {
  const lastLineReturn = lineText.lastIndexOf('\n');
  if (lastLineReturn >= 0) {
    return lineText.substring(lastLineReturn);
  }
  return lineText;
};

export const getFollowingCharsThisLine = (lineText: string) => {
  const firstLineReturn = lineText.indexOf('\n');
  if (firstLineReturn >= 0) {
    return lineText.substring(0, firstLineReturn);
  }
  return lineText;
};

const getStartsWithNumberedList = (str: string) => {
  return orderedListRegex.test(str);
};

/**
 * Inserts bullets at the beginning of each line of text
 * Replaces existing bullets or numbered list with bullet list
 * @param pattern
 * @param lines
 * @param isOrdered
 * @returns
 */
export const wrapLines = (lines: string, isOrdered: boolean) => {
  if (isOrdered) {
    return wrapAndOrderLines(lines);
  }
  const linesArr = lines.split('\n');
  const newArr: string[] = [];
  for (let i = 0; i < linesArr.length; i++) {
    if (getStartsWithNumberedList(linesArr[i])) {
      console.log('getStartsWithNumberedList', linesArr[i].indexOf('.'));
      newArr.push(
        `${bulletListPattern}${linesArr[i].substring(linesArr[i].indexOf('.') + 1)}`,
      );
    } else if (linesArr[i].startsWith(bulletListPattern)) {
      newArr.push(`${linesArr[i]}`);
    } else {
      newArr.push(`${bulletListPattern}${linesArr[i]}`);
    }
  }
  return `${newArr.join('\n')}`;
};

/**
 * Inserts bullets at the beginning of each line of text
 * Replaces existing bullets or numbered list with bullet list
 * @param pattern
 * @param lines
 * @param isOrdered
 * @returns
 */
export const wrapAndOrderLines = (lines: string) => {
  const linesArr = lines.split('\n');
  const newArr: string[] = [];
  for (let i = 0; i < linesArr.length; i++) {
    if (linesArr[i].startsWith(bulletListPattern)) {
      newArr.push(`${i + 1}. ${linesArr[i].substring(2)}`);
    } else if (getStartsWithNumberedList(linesArr[i])) {
      newArr.push(`${linesArr[i]}`);
    } else {
      newArr.push(`${i + 1}. ${linesArr[i]}`);
    }
  }
  return `${newArr.join('\n')}`;
};

/**
 * Wrap word with pattern
 * @param pattern
 * @param word
 * @returns
 */
export const wrapWord = (pattern: string, word: string) => {
  // don't wrap if already wrapped
  if (word.startsWith(pattern) && word.endsWith(pattern)) {
    return word;
  }
  //TODO dont allow it if there is an inner pattern
  return `${pattern}${word}${pattern}`;
};

export const wrapWordLeft = (pattern: string, word: string) => {
  //dont wrap if already wrapped
  if (word.startsWith(pattern)) {
    return word;
  }
  //TODO dont allow it if there is an inner pattern
  return `${pattern}${word}`;
};

export const formatWord = (textVal: string, args: string[]) => {
  let str = textVal;
  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      str = str.replace(new RegExp('\\{' + i + '\\}', 'gi'), args[i]);
    }
  }

  return str;
};
