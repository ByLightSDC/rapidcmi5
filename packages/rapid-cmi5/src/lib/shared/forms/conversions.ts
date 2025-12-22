/**
 * Formats number into decimal
 * Round to single decimal place
 * Minimum of 1k regardless of size
 * @param {number} val
 * @param {string} label
 * @returns {string}
 */
const formatDecimal = (val: number, label: string): string => {
  let format: string = '' + val;

  if (val % 1 !== 0) {
    format = val.toFixed(1);
  }

  if (format.startsWith('0.')) {
    format = format.substring(1);
  }
  if (format.endsWith('.0')) {
    format = format.substring(0, format.indexOf('.0'));
  }
  if (!format || format === '0') {
    format = '1';
  }
  return '' + format + label;
};

/**
 * Formats decimal into number
 * Ceiling
 * @param {string} val
 * @returns {string}
 */
export const getIntegerFromFormattedDecimal = (
  decimalValue: string,
): string => {
  const arr = (decimalValue as string).match(/([0-9.]*)([\s\S]*)/) || [];
  const actual = [...arr].splice(1);
  return (
    '' + Math.ceil(Number(actual[0])) + (actual[1].length > 0 ? actual[1] : '')
  );
};

/**
 * Finds best fit for bytes
 * @param {number} size bytes to fit
 * @returns {string} formatted decimal
 */
export const getStorageFitBytes = (size: number): string => {
  const bytes = size;
  const kb = bytes / 1000;
  if (kb < 1000) {
    return formatDecimal(kb, 'k');
  }
  const mb = kb / 1000;
  if (mb < 1000) {
    return formatDecimal(mb, 'M');
  }
  const gb = mb / 1000;
  if (gb < 1000) {
    return formatDecimal(gb, 'G');
  }
  const tb = gb / 1000;
  if (tb < 1000) {
    return formatDecimal(tb, 'T');
  }
  const pb = tb / 1000;
  if (pb < 1000) {
    return formatDecimal(pb, 'P');
  }
  const eb = pb / 1000;
  return formatDecimal(eb, 'E');
};

/**
 * Determines which number in list is closest to number
 * @param {number} num A number
 * @param {number[]} arr A list of numbers
 * @returns {number}
 */
export const getNearestNumber = (num: number, arr: number[]) => {
  const closestNum = arr.reduce((a, b) => {
    return Math.abs(b - num) < Math.abs(a - num) ? b : a;
  });
  return closestNum;
};

/**
 * Converts a string into a number representing Megabytes
 * @param {string} memoryStr A value with units k,M,G,T,P,E
 * @returns {number}
 */
export const getMegabytes = (memoryStr: string): number => {
  if (!memoryStr) {
    return -1;
  }
  const sourceUnit = memoryStr.substring(memoryStr.length - 1);
  const sourceValue = memoryStr.substring(0, memoryStr.length - 1);
  if (!sourceUnit && !sourceValue) {
    return -1;
  }

  const newVal = parseInt(sourceValue);

  switch (sourceUnit) {
    case 'k': //Kilobyte
      return newVal * 0.001;
    case 'M':
      return newVal;
    case 'G':
      return newVal * 1000;
    case 'T':
      return newVal * 1e6;
    case 'P':
      return newVal * 1e9;
    case 'E': //Exabytes
      return newVal * 1e12;
    default:
      break;
  }

  return -1;
};
