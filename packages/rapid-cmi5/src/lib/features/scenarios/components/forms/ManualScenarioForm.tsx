/*
  This form exists so that we may still allow a user to manually type
  in a scenario to use if not connected to the range API.
*/
import { FormControlTextField } from '@rapid-cmi5/ui';
import Grid from '@mui/material/Grid2';
import { SCENARIO_GRID } from './formSettings';

export default function ManualScenarioForm({
  errors,
  control,
}: {
  errors: any;
  control: any;
}) {
  return (
    <Grid container spacing={1}>
      <Grid size={SCENARIO_GRID.uuid}>
        <FormControlTextField
          control={control}
          name={'name'}
          required
          label="Scenario Name"
          error={Boolean(errors?.name)}
          helperText={errors?.name?.message}
        />
      </Grid>
      <Grid size={SCENARIO_GRID.uuid}>
        <FormControlTextField
          control={control}
          name={'uuid'}
          required
          label="Scenario UUID"
          error={Boolean(errors?.uuid)}
          helperText={errors?.uuid?.message}
        />
      </Grid>
    </Grid>
  );
}
