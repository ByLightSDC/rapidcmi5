import { MenuItem, SxProps } from '@mui/material';

import AnySelector from '../AnySelector';

/**
 * Branch selector shared with the course builder selectors
 * @param param0 Props
 * @returns React Component
 */
export default function BranchSelector({
  currentBranch,
  availableBranches,
  disabled,
  onSelect,
  styleProps = {},
}: {
  currentBranch?: string;
  availableBranches?: string[];
  disabled?: boolean;
  styleProps?: SxProps;
  onSelect?: (branchName: string) => void;
}) {
  const noBranchesFound = 'No Branches Found';
  const hasNoBranches = !availableBranches || availableBranches.length === 0;

  return (
    <AnySelector
      id="Branches"
      disabled={disabled}
      styleProps={styleProps}
      theValue={currentBranch || ''}
      onChange={onSelect}
      topicLabel="Branch"
      hasNoOptions={hasNoBranches}
      noOptionsPlaceholder={noBranchesFound}
      optionsPlaceholder="Select Branch"
      selectorStyleProps={{ width: '180px', height: 32, minHeight: 32 }}
    >
      {availableBranches &&
        availableBranches.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
    </AnySelector>
  );
}
