/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormCrudType } from "@rapid-cmi5/ui";

/* Branded */
export type RangeResourceFormProps = {
  crudType: FormCrudType;
  dataCache?: any;
  defaultCache?: any;
  isModal?: boolean;
  featureNameOverride?: string;
  title?: string;
  uuid?: string;
  onCancel?: () => void;
  onClose?: () => void;
  onResponse?: (isSuccess: boolean, data: any) => void;
  postHook?: any;
  putHook?: any;
  getHook?: any;
};
