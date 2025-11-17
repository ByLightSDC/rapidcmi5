import { ButtonMainUi, LoadingUi } from '@rangeos-nx/ui/branded';

import { useContext } from 'react';
import { ScenarioMapContext } from './ScenarioMapContext';

export function ScenarioMapTools() {
  const { onMessage } = useContext(ScenarioMapContext);

  return (
    // <ButtonMainUi
    //   size="small"
    //   sxProps={{ width: '120px' }}
    //   onClick={() => onMessage('test')}
    // >
    //   Test
    // </ButtonMainUi>
    <></>
  );
}
