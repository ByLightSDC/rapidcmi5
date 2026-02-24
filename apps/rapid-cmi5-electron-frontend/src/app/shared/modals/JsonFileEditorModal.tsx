/* eslint-disable react/jsx-no-useless-fragment */
import { Grid } from '@mui/system';
import { Button, Stack, Typography } from '@mui/material';
import * as yup from 'yup';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

import {
  CommonAppModalState,
  FormControlTextField,
  FormControlUIProvider,
  FormStateType,
  MiniForm,
  ModalDialog,
} from '@rapid-cmi5/ui';

export type JsonEditorFormData = {
  jsonText: string;
};

const jsonValidationSchema = yup.object().shape({
  jsonText: yup
    .string()
    .required('JSON is required')
    .test('is-json', 'Invalid JSON', (value) => {
      if (!value) return false;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }),
});

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}

export function JsonFileEditorModal({
  modalId,
  modalObj,
  title = 'Edit JSON',
  filename,
  initialJson,
  handleCloseModal,
  handleModalAction,
  handleSaveJson, // you write file / update store / etc.
}: {
  modalId: string;
  modalObj: CommonAppModalState;

  title?: string;
  filename?: string;

  // either pass a parsed object or raw json string — both supported
  initialJson: unknown | string;

  handleCloseModal: () => void;

  handleModalAction?: (
    modalId: string,
    buttonAction: number,
    data?: unknown,
  ) => void;

  handleSaveJson: (rawText: string) => void;
}) {
  const defaultData: JsonEditorFormData = {
    jsonText:
      typeof initialJson === 'string' ? initialJson : toPrettyJson(initialJson),
  };

  const onCancel = () => handleCloseModal();
  const onClose = () => handleCloseModal();

  const onResponse = (isSuccess: boolean, data: JsonEditorFormData) => {
    if (!isSuccess) return;

    const parsed = JSON.parse(data.jsonText);
    handleSaveJson(data.jsonText);

    handleModalAction?.(modalId, 1, parsed);
  };

  const getFormFields = useCallback(
    (formMethods: UseFormReturn, formState: FormStateType): JSX.Element => {
      const { control, setValue, getValues } = formMethods;
      const { errors } = formState;

      const formatJson = () => {
        const raw = getValues('jsonText');
        try {
          const parsed = JSON.parse(raw);
          setValue('jsonText', toPrettyJson(parsed), {
            shouldDirty: true,
            shouldValidate: true,
          });
        } catch {
          // let validation error show; do nothing
        }
      };

      return (
        <>
          <Grid size={12}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                {filename
                  ? `Editing: ${filename}`
                  : 'Paste or edit JSON below.'}
              </Typography>

              <Button size="small" variant="outlined" onClick={formatJson}>
                Format
              </Button>
            </Stack>
          </Grid>

          <Grid size={12}>
            <FormControlTextField
              control={control}
              name="jsonText"
              label="JSON"
              required
              multiline
              minRows={16}
              placeholder={'{\n  "example": true\n}\n'}
              error={Boolean(errors?.jsonText)}
              helperText={errors?.jsonText?.message}
              readOnly={false}
            />
          </Grid>
        </>
      );
    },
    [filename],
  );

  return (
    <ModalDialog
      testId={modalId}
      buttons={[]}
      dialogProps={{
        open: modalObj.type === modalId,
      }}
      maxWidth="md"
    >
      <FormControlUIProvider>
        <MiniForm
          dataCache={defaultData}
          doAction={handleSaveJson}
          formTitle={title}
          instructions="Edit the JSON file contents. Save will validate JSON and return the parsed object."
          submitButtonText="Save"
          successToasterMessage="JSON saved"
          onClose={onClose}
          onCancel={onCancel}
          onResponse={(isSuccess: boolean, data: JsonEditorFormData) =>
            onResponse(isSuccess, data)
          }
          getFormFields={getFormFields}
          validationSchema={jsonValidationSchema}
        />
      </FormControlUIProvider>
    </ModalDialog>
  );
}

export default JsonFileEditorModal;
