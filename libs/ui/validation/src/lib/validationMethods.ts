import * as yup from 'yup';

import { uuidRegex } from './validationRegex';

export function isValidUUID(str: string) {
  return uuidRegex.test(str);
}

export function startsWithNumber(str: string) {
  return /^\d/.test(str);
}

/**
 * Returns whether efi and secure boot fields are valid
 * If Secure Boot is true, EFI must also be true
 * @param {string} efiFieldName EFI field name
 * @param {string} secureBootFieldName Secure Boot field name
 * @return {(RequiredBooleanSchema<boolean | undefined, AnyObject>)} Yup Validation
 */
export function getOptFirmwareValidation(
  efiFieldName: string,
  secureBootFieldName: string,
) {
  return yup
    .boolean()
    .required()
    .test(
      'is-secure-boot-true',
      'EFI must be true if Secure Boot is true',
      function (code) {
        const isEFI = this.parent[efiFieldName];
        const isSecureBoot = this.parent[secureBootFieldName];
        const isValid = !isSecureBoot || (isSecureBoot && isEFI);
        return isValid;
      },
    );
}
