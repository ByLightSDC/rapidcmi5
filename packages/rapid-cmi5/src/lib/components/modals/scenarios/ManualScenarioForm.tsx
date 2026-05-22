import { FormControlTextField } from '@rapid-cmi5/ui';
import Grid from '@mui/material/Grid2';

export default function ManualScenarioForm({
  errors,
  control,
}: {
  errors: any;
  control: any;
}) {
  return (
    <>
      <Grid size={6}>
        <FormControlTextField
          control={control}
          name={'name'}
          required
          label="Scenario Name"
          error={Boolean(errors?.name)}
          helperText={errors?.name?.message}
        />
      </Grid>
      <Grid size={6}>
        <FormControlTextField
          control={control}
          name={'uuid'}
          required
          label="Scenario UUID"
          error={Boolean(errors?.uuid)}
          helperText={errors?.uuid?.message}
        />
      </Grid>
    </>
  );
}
