/*
 *   Copyright (c) 2023 - 2024 By Light Professional IT Services LLC
 *   All rights reserved.
 */
import { Control } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid';
import FormControlTextField from './FormControlTextField';
import FormControlDateDisplay from './FormControlDateDisplay';
import { FormCrudType } from '../redux/utils/types';

export type tAuthoringInfoFieldProps = {
  crudType: FormCrudType;
  includeVersioning?: boolean;
  includeProperties?: { [key: string]: any };
  control: Control;
  errors: any;
};
export function AuthoringInfoFields({
  crudType,
  includeVersioning = false,
  includeProperties = {},
  control,
  errors,
}: tAuthoringInfoFieldProps) {
  return (
    <>
      {includeVersioning && (
        <>
          {includeProperties.hasOwnProperty('branch') && (
            <Grid item xs={5}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.branch)}
                helperText={errors?.branch?.message}
                name="branch"
                label="Branch"
                readOnly={crudType !== FormCrudType.create}
              />
            </Grid>
          )}
          {includeProperties.hasOwnProperty('tag') && (
            <Grid item xs={5}>
              <FormControlTextField
                control={control}
                error={Boolean(errors?.tag)}
                helperText={errors?.tag?.message}
                name="tag"
                label="Tag"
                readOnly={crudType !== FormCrudType.create}
              />
            </Grid>
          )}
        </>
      )}
      {crudType !== FormCrudType.create && crudType !== FormCrudType.design ? (
        <>
          <Grid item xs={6}>
            <FormControlTextField
              control={control}
              name="author"
              label="Author"
              readOnly={true}
              disabled={true}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControlDateDisplay
              control={control}
              name="dateEdited"
              label="Last Edited"
            />
          </Grid>
        </>
      ) : null}
      {crudType === FormCrudType.design ? (
        <>
          <Grid item xs={12}>
            <FormControlTextField
              control={control}
              name="uuid"
              label="Id"
              readOnly={true}
              disabled={true}
            />
          </Grid>
        </>
      ) : null}
    </>
  );
}

export default AuthoringInfoFields;
