export const sortAlphabetical = (a: string, b: string): number => {
  if (a && b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return 0;
};

export const sortAlphabeticalByName = (a: any, b: any): number => {
  if (a.name && b.name) {
    const al = a.name.toLowerCase();
    const bl = b.name.toLowerCase();
    return al < bl ? -1 : al > bl ? 1 : 0;
  }
  return 0;
};
