import SearchIcon from '@mui/icons-material/Search';
import { Box } from '@mui/material';
import { ButtonMinorUi, useRangeClient } from '@rapid-cmi5/ui';
import { useState } from 'react';
import {
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form';

import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import { ScenarioSelectionModal } from '../modals/ScenarioSelectionModal';
import ManualScenarioForm from './ManualScenarioForm';
import { ScenarioStatusCard } from './ScenarioStatusCard';

interface ScenarioSelectorFieldProps {
  control: Control;
  errors: FieldErrors;
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  scenarioUuid: string;
  scenarioName: string;
}

export const ScenarioSelectorField = ({
  control,
  errors,
  setValue,
  trigger,
  scenarioUuid,
  scenarioName,
}: ScenarioSelectorFieldProps) => {
  const { enabled: isRangeClientEnabled } = useRangeClient();
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  const onApplyScenario = (item: ScenarioApi) => {
    if (!item) return;
    setValue('uuid', item.uuid, { shouldDirty: true });
    setValue('name', item.name, { shouldDirty: true });
    trigger('uuid');
    setIsScenarioModalOpen(false);
  };

  if (!isRangeClientEnabled) {
    return <ManualScenarioForm errors={errors} control={control} />;
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <ButtonMinorUi
        onClick={() => setIsScenarioModalOpen(true)}
        fullWidth
        startIcon={<SearchIcon />}
        sx={{ height: 42 }}
      >
        Select Scenario
      </ButtonMinorUi>
      <ScenarioSelectionModal
        onSelect={onApplyScenario}
        onClose={() => setIsScenarioModalOpen(false)}
        open={isScenarioModalOpen}
      />
      <ScenarioStatusCard
        scenarioUUID={scenarioUuid}
        scenarioName={scenarioName}
      />
    </Box>
  );
};
