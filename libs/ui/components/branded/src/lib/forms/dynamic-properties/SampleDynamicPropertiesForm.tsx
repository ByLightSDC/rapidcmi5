/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This form is for storybook purposes only
 */
import { useContext, useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, UseFormReturn } from 'react-hook-form';

/* MUI */
import Grid from '@mui/material/Grid';

/* Icons */
import Check from '@mui/icons-material/Check';

import {
  ButtonModalMainUi,
  DynamicPropertyContext,
  DynamicSchema,
  Form,
  FormControlUIContext,
  FormCrudType,
} from '@rangeos-nx/ui/branded';

const formWidth = 800;

/**
 * Sample form for processing dynamic schema properties
 * @param {*} initialValues Initial values for the fields (possibly from database of last values)
 * @param {*} schema Json schema of dynamic property fields
 * @returns
 */
export function SampleDynamicPropertiesForm({
  initialValues,
  schema,
}: {
  initialValues: any;
  schema: any;
}) {
  const { getSingleYupValidationSchema } = useContext(DynamicPropertyContext);
  const { setFormMethods } = useContext(FormControlUIContext);

  const validationSchema = getSingleYupValidationSchema(); //yup.object().shape({
  const formMethods: UseFormReturn = useForm({
    defaultValues: initialValues,
    mode: 'all',
    resolver: yupResolver(validationSchema),
  });
  const { handleSubmit, formState } = formMethods;
  const { errors, isValid } = formState;
  const formErrors: any = errors;
  //#endregion

  useEffect(() => {
    if (formMethods) {
      setFormMethods(formMethods);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods]);

  const onSubmit = async (data: any) => {
    //REF console.log('*** DEMO ON SUBMIT ***', data);
  };

  return (
    <Form
      title="Dynamic Properties Form"
      formWidth={formWidth}
      showBorder={true}
      formFields={
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DynamicSchema
              schemaData={schema}
              crudType={FormCrudType.edit}
              handleAsSingleYupValidation={true}
              errors={formErrors}
              isValid={isValid}
            />
          </Grid>
        </Grid>
      }
      formButtons={
        <ButtonModalMainUi
          id="submit-button"
          startIcon={<Check />}
          disabled={!isValid}
        >
          Save
        </ButtonModalMainUi>
      }
      sxProps={{
        color: 'text.secondary',
        width: formWidth,
        height: 'auto',
        padding: '24px',
      }}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
}

export default SampleDynamicPropertiesForm;
