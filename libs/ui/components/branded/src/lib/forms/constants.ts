import { tFormFieldRendererProps } from '@rangeos-nx/ui/branded';

/**
 * design Mode when editing forms in Scenario Designer
 * preview Mode in Rapid CMI5 Editor
 * @enum FormCrudType
 */
export enum FormCrudType {
  create,
  delete,
  edit,
  design,
  view,
  preview,
}

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
