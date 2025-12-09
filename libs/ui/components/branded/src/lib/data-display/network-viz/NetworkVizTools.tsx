
/* MUI */
import Box from '@mui/material/Box';
import { ButtonMinorUi } from '@rangeos-nx/ui/api/hooks';

export function NetworkVizTools() {
  //const { onMessage } = useContext(NetworkVizContext);

  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 44,
        left: 68,
        height: '50px',
        width: '320px',
        backgroundColor: 'palette.background.paper',
        zIndex: 9999,
      }}
    >
      {/* <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'UUIDNode')}
        draggable
      >
        Input Node
      </div> */}
      <ButtonMinorUi
        onDragStart={(event) => onDragStart(event, 'uuid')}
        draggable
        size="small"
        sxProps={{ width: '120px' }}
        //onClick={() => onMessage('test')}
      >
        Container
      </ButtonMinorUi>
      {/* <ButtonMinorUi
        size="small"
        sxProps={{ width: '120px' }}
        //onClick={() => onMessage('test')}
      >
        Container
      </ButtonMinorUi>
      <ButtonMinorUi
        size="small"
        sxProps={{ width: '120px' }}
        //onClick={() => onMessage('test')}
      >
        VM
      </ButtonMinorUi> */}
    </Box>
  );
}
export default NetworkVizTools;
