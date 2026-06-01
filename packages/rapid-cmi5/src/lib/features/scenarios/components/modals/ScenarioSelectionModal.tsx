import { ScenarioApi } from '@rapid-cmi5/cmi5-build-common';
import { DynamicModal, useRangeApi } from '@rapid-cmi5/ui';
import ScenarioCard from './ScenarioOptionCard';

export function ScenarioSelectionModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (scenario: ScenarioApi) => void;
}) {
  const { searchScenarios } = useRangeApi();

  return (
    <DynamicModal<ScenarioApi>
      open={open}
      onClose={onClose}
      title="Select Scenario"
      itemLabel="scenario"
      searchPlaceholder="Search scenarios..."
      emptyTitle="No scenarios"
      emptyDescription="Create your first scenario to get started"
      fetchItems={(search, limit, offset) => {
        const { data, error, isPending } = searchScenarios(
          search,
          limit,
          offset,
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
      onSelect={(scenarios) => onSelect(scenarios[0])}
    />
  );
}
