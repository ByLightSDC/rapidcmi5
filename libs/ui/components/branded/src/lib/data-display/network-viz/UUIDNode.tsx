import { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import Typography from '@mui/material/Typography';
import { brandedTheme } from '../../styles/muiTheme';
import { brandedThemeDark } from '../../styles/muiThemeDark';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { NetmapNodeType } from './network-viz-data-types';

type tData = {
  label: string;
  meta: { [key: string]: any };
};

export default function UUIDNode(props: NodeProps<tData>) {
  //console.log('props uuid', props.data.meta['uuid']);
  //console.log('props', props);
  //console.log('props data', props.data);
  //console.log('props label', props.data.label);
  //console.log('props meta', props.data.meta);

  //console.log('props meta', props.data.meta);

  const brandedBorderWidth = '0px';

  const getStyles = (netmapNodeType: NetmapNodeType): any => {
    if (props.data.meta['themeColor'] === 'light') {
      switch (netmapNodeType) {
        case NetmapNodeType.PACKAGE:
          return {
            borderStyle: 'solid',
            borderRadius: ' px',
            borderWidth: '1px', //brandedBorderWidth,
            borderColor: '#e3e7fc', //brandedTheme.nav.icon,
            backgroundColor: '#f1f3f9', //brandedTheme.nav.fillSelected,
          };
        case NetmapNodeType.L3:
          return {
            borderStyle: 'solid',
            borderRadius: '4px',
            borderWidth: brandedBorderWidth,
            borderColor: brandedTheme,
            backgroundColor: '#bcc2e6', //brandedTheme.nav.fillSelected, //#929BCC
          };
        default:
          return {
            borderStyle: 'solid',
            borderRadius: '0px',
            borderWidth: brandedBorderWidth,
            borderColor: brandedTheme,
            backgroundColor: '#e3e7fc', //,
          };
      }
    } else {
      switch (netmapNodeType) {
        case NetmapNodeType.PACKAGE:
          return {
            borderStyle: 'solid',
            borderRadius: ' px',
            borderWidth: '1px', //brandedBorderWidth,
            borderColor: brandedThemeDark, //brandedTheme.nav.icon,
            backgroundColor: brandedThemeDark.palette.grey[800], //,
          };
        case NetmapNodeType.L3:
          return {
            borderStyle: 'solid',
            borderRadius: '4px',
            borderWidth: brandedBorderWidth,
            borderColor: brandedTheme,
            backgroundColor: brandedThemeDark.palette.grey[700], //, //#929BCC
          };
        default:
          return {
            borderStyle: 'solid',
            borderRadius: '0px',
            borderWidth: brandedBorderWidth,
            borderColor: brandedTheme,
            backgroundColor: brandedThemeDark.palette.grey[500], //,
          };
      }
    }
  };

  return (
    <div
      style={{
        //backgroundColor: getBGColor(props.data.meta['t']),
        width: props.data.meta['width'],
        height: props.data.meta['height'],
        ...getStyles(props.data.meta['t']),
        //padding:'12px'
        //margin:'32px' this effects ports not touching nodes
      }}
    >
      {/* <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} /> */}
      <Handle type="target" position={Position.Left} hidden={false} />
      <Handle
        type="target"
        id="package"
        position={Position.Right}
        hidden={false}
      />
      <Handle type="source" position={Position.Right} hidden={false} />
      <Handle
        type="source"
        id="package"
        position={Position.Right}
        hidden={false}
      />
      <div style={{ display: 'flex' }}>
        {props.data.meta['open'] === 0 && <AddCircleOutlineIcon />}
        {props.data.meta['open'] === 1 && <RemoveCircleOutlineIcon />}
        <Typography
          sx={{
            lineHeight: 1.0,
            fontSize: 14,
            padding: '14px',
            whiteSpace: 'pre-wrap',
          }}
          variant="body1"
        >
          <b>{props.data.label}</b>
          <br />
          {props.data.meta['uuid']}
        </Typography>
      </div>
    </div>
  );
}
