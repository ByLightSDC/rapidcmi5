/* eslint-disable @typescript-eslint/no-explicit-any */

export const getKeyFromEnumValue = (
  enumObj: any,
  enumValue: string,
): string | undefined => {
  return Object.keys(enumObj).find((key) => enumObj[key] === enumValue);
};
