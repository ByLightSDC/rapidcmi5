import { FormCrudType, tFormFieldRendererProps } from '@rapid-cmi5/ui/branded';

// Shared Field constants
export const minCpuCores = 1;
export const maxCpuCores = 32;

/**
 * @constant MemoryUnitsOptionList
 * The list of available unit options for defining memory
 */
export const MemoryUnitsOptionList = [
  'k',
  'M',
  'G',
  'T',
  'P',
  'Ki',
  'Mi',
  'Gi',
  'Ti',
  'Pi',
];
export const defaultMemory = '1Gi';

/**
 * @constant StorageUnitsOptionList
 * The list of available unit options for defining storage
 */
export const StorageUnitsOptionList = [
  'k',
  'M',
  'G',
  'T',
  'P',
  'Ki',
  'Mi',
  'Gi',
  'Ti',
  'Pi',
];
export const defaultStorage = '1Gi';

/**
 * @interface iExtendedFieldGroupProps
 * @property {tFormFieldRendererProps}
 * @property {FormCrudType} crudType Current mode of form
 */
export interface iExtendedFieldGroupProps extends tFormFieldRendererProps {
  crudType: FormCrudType;
}

/**
 *
 * @param {FormCrudType} crudType Current mode of form
 * @param {string} title Basic Form title - the Item being displayed (e.g., Certificate)
 * @returns
 */
export const getFormTitle = (crudType: FormCrudType, title: string): string => {
  switch (crudType) {
    case FormCrudType.create:
      return 'Create ' + title;
    case FormCrudType.edit:
      return 'Edit ' + title;
  }
  return title;
};
