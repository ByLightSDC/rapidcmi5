import { useState } from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { Box } from '@mui/material';

import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import { ButtonMinorUi, DynamicModal, useRangeClient } from '@rapid-cmi5/ui';
import ScenarioCard from './ScenarioCard';
import ManualScenarioForm from './ManualScenarioForm';

export function ScenarioSelectionForm({
  submitForm,
  errors,
  control,
}: {
  submitForm: (props: any) => void;
  errors: any;
  control: any;
}) {
  const rangeClient = useRangeClient();
  const [isOpen, setIsOpen] = useState(false);

  if (!rangeClient) {
    return <ManualScenarioForm errors={errors} control={control} />;
  }

  return (
    <Box sx={{ my: 1 }}>
      <ButtonMinorUi
        onClick={() => setIsOpen(true)}
        fullWidth
        startIcon={<ManageSearchIcon />}
        sx={{ height: 42, boxSizing: 'border-box' }}
      >
        Select Scenario
      </ButtonMinorUi>

      <DynamicModal<ScenarioApi>
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Scenario"
        itemLabel="scenario"
        searchPlaceholder="Search scenarios..."
        emptyTitle="No scenarios"
        emptyDescription="Create your first scenario to get started"
        fetchItems={(search, limit, offset) => {
          const { data, error, isPending } = rangeClient.listScenarios.useQuery(
            {
              queryKey: ['scenario', { search, limit, offset }],
              queryData: { query: { search, limit, offset } },
            },
          );

          return {
            body: data?.body,
            error,
            isPending,
          };
        }}
        getItemId={(s) => s.uuid}
        renderItem={(s, isSelected) => (
          <ScenarioCard scenario={s} isSelected={isSelected} />
        )}
        confirmLabel="Select Scenario"
        onSelect={submitForm}
      />
    </Box>
  );
}
