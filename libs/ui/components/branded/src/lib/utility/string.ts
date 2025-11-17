export const equalsNoCase = (text1: string, text2: string) => {
  return text1.localeCompare(text2, undefined, { sensitivity: 'base' }) === 0;
};

export const capitalizeFirstLetter = (text: string) => {
  if (typeof text !== 'string' || text.length === 0) {
    return text; // Handle non-string or empty inputs gracefully
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};
