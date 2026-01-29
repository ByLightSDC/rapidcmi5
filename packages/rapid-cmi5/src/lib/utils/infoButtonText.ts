const resourceQuantityInfoAddendum =
  '\nAssume bytes if units are unspecified or value contains exponents (Ex. 1e10)';

const infoButtonText: Record<string, Record<string, string>> = {
 
}
export const getInfoText = (
  formName: string,
  fieldName: string,
  defaultText = '',
) => {
  if (!Object.prototype.hasOwnProperty.call(infoButtonText, formName)) {
    return defaultText;
  }
  if (
    !Object.prototype.hasOwnProperty.call(infoButtonText[formName], fieldName)
  ) {
    return defaultText;
  }
  return infoButtonText[formName][fieldName];
};
