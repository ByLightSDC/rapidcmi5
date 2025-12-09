import { IconButton, Tooltip } from '@mui/material';

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import {
  iconButtonStyle,
  tooltipStyle,
} from '../../../../rapidcmi5_mdx/styles/styles';
import { useContext } from 'react';
import { GitContext } from '../../session/GitContext';
import { useRC5Prompts } from '../../../../rapidcmi5_mdx/modals/useRC5Prompts';
import { ButtonMinorUi } from '@rangeos-nx/ui/api/hooks';

export default function DeleteRepoButton({
  isButtonStyleMinimized,
}: {
  isButtonStyleMinimized?: boolean;
}) {
  const { currentRepo } = useContext(GitContext);
  const { promptDeleteRepo } = useRC5Prompts();

  return (
    <>
      {isButtonStyleMinimized && (
        <IconButton
          aria-label="design-view"
          color="primary"
          data-testid="delete-repo-button"
          style={iconButtonStyle}
          onClick={() => promptDeleteRepo(currentRepo || '')} // to keep typescript happy
        >
          <Tooltip arrow title={`Delete Repository`} {...tooltipStyle}>
            <DeleteSweepIcon color="inherit" />
          </Tooltip>
        </IconButton>
      )}
      {!isButtonStyleMinimized && (
        <ButtonMinorUi
          onClick={() => promptDeleteRepo(currentRepo || '')} // to keep typescript happy
        >
          Delete Repo
        </ButtonMinorUi>
      )}
    </>
  );
}
