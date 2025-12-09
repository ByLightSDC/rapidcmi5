import {
  IconType,
  ModelType,
  NodeType,
  NodeBoxType,
  // SwitchType,
  IModelBase,
  LooseObject,
} from './model-types';

import {
  // IDevice,
  // IDeviceManagerType,
  // IDomainNetworkGroup,
  // IInternetLink,
  // INetworkGroup,
  // INetworkConnection,
  // ISubnetGroup,
  IGroup,
  IPackage,
} from '../scenario-map-data-types';

// import {
//   getIsInNetworks,
//   getIsRouterFirewallSubnet,
//   getDomainNetworkName,
// } from '../utility';
import { NodeBox } from './node-box';

/* Node Model 
model for drawing devices on the network map
*/

export class Node implements IModelBase {
  childIndex: number;
  childX?: number;
  childY?: number;
  columnSize: number;
  height: number;
  iconType: IconType;
  id: string;
  index?: number;
  label?: string;
  meta: LooseObject;
  model: IPackage | IGroup;
  nodeType: NodeType;
  name: string;
  parent?: any;
  rowSize: number;
  size: number[];
  sort?: number;
  type: ModelType;
  width: number;
  x: number; //top
  y: number; //left
  right: number;
  bottom: number;
  visible: boolean;

  constructor(lid: string, ltype: ModelType) {
    this.childIndex = -1;
    this.id = lid;
    this.type = ltype;
    this.x = -1;
    this.y = -1;
    this.size = [0, 0];
    this.width = 0;
    this.height = 0;
    this.bottom = 0;
    this.right = 0;
    this.visible = true;
    this.iconType = IconType.NONE;
    this.nodeType = NodeType.DEFAULT;
    this.meta = { deviceType: null, switchType: null, switch: null };
    this.parent = '';
  }

  setDimensions(size: number = 50) {
    this.width = size;
    this.height = size;
    this.size = [size * 1.5, size * 1.5];
  }

  setIcon(iconType: IconType) {
    this.iconType = iconType;
  }

  setLabel(lLabel: string) {
    this.label = lLabel;
  }

  setName(lName: string) {
    this.name = lName;
  }

  setParent(lParent: string) {
    this.parent = lParent;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.bottom = this.y + this.height;
    this.right = this.x + this.width;
  }

  setVisible(lVisible: boolean) {
    this.visible = lVisible;
  }

  // setDeviceNodeType(
  //   network_connections: INetworkConnection[],
  //   domain_networks: IDomainNetworkGroup[]
  // ) {
  //   // has domain connection OR is contained in network group
  //   for (let j = 0; j < network_connections.length; j++) {
  //     if (getIsInNetworks(network_connections[j].id, domain_networks)) {
  //       this.nodeType = NodeType.DEVICE;
  //       return true;
  //     }
  //   }

  //   this.nodeType = NodeType.INVALID;
  //   return false;
  // }

  setNodeType(lNodeType: NodeType) {
    this.nodeType = lNodeType;
  }

  // setSwitchNodeType(
  //   switchId: string,
  //   subnetGroups: ISubnetGroup[],
  //   domain_networks: IDomainNetworkGroup[]
  // ) {
  //   let switchType = SwitchType.SMART_SWITCH;
  //   var domainNetwork = domain_networks.find(
  //     (network: IDomainNetworkGroup) => network.id === switchId
  //   );

  //   //for some odd reason, domain networks have this bad string contained, need to filter it out
  //   //string badStr = "Domain1-Adv-Attack-";
  //   let label = getDomainNetworkName(domainNetwork?.name || 'Switch');
  //   let switchName = 'switch_' + label;

  //   this.setName(switchName);
  //   this.setLabel(label);
  //   switch (subnetGroups.length) {
  //     case 0:
  //       this.nodeType = NodeType.INVALID;
  //       return false;
  //     case 2:
  //       this.setIcon(IconType.DUMB_SWITCH);
  //       switchType = SwitchType.DUMB_SWITCH;
  //       break;
  //     default:
  //       this.setIcon(IconType.SMART_SWITCH);
  //       break;
  //   }

  //   this.meta['switchType'] = switchType;
  //   this.nodeType = NodeType.SWITCH;
  //   return true;
  // }
}
