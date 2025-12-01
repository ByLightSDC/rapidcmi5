import { MenuItem, SxProps } from '@mui/material';

import AnySelector from '../AnySelector';

/**
 * Selector Component for displaying packages and L3s in a Package Group
 * @param param0 Props
 * @returns React Component
 */
export default function BranchSelector({
  currentBranch,
  availableBranches,
  disabled,
  onAction,
  onSelect,
  styleProps = {},
}: {
  currentBranch?: string;
  availableBranches?: string[];
  disabled?: boolean;
  styleProps?: SxProps;
  onAction?: () => void;
  onSelect?: (branchName: string) => void;
}) {
  const noBranchesFound = 'No Branches Found';
  const hasNoBranches = !availableBranches || availableBranches.length === 0;

  const handleSelectBranch = (name: string) => {
    if (onSelect) {
      onSelect(name);
    }
  };

  //REF console.log('data', data);

  return (
    <AnySelector
      id="Repositories"
      theValue={currentBranch || ''}
      onChange={onSelect}
      topicLabel="Branch"
      hasNoOptions={hasNoBranches}
      noOptionsPlaceholder={noBranchesFound}
      optionsPlaceholder="Select Branch"
      selectorStyleProps={{ width: '160px' }}
      //iconButtonHandler={onAction}
      //iconButtonTooltip="Create Branch"
      //iconButtonDisabled={false}
    >
      {availableBranches &&
        availableBranches.map((name) => (
          <MenuItem
            key={name}
            value={name}
            onClick={() => handleSelectBranch(name)}
          >
            {name}
          </MenuItem>
        ))}
    </AnySelector>
  );
}
