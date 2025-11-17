import {
  NodeType,
  LooseObject,
  ModelType,
  NodeBoxType,
  IModelBase,
} from './model-types';
import { Node } from './node';

import { IGroup, IPackage } from '../scenario-map-data-types';
// import {
//   getNetwork,
//   getIsFirewall,
//   getIsInNetworks,
//   getIsRouter,
//   getIsRouterFirewallSubnet,
//   getNumRealDevicesInSubnet,
// } from '../utility';

import { fontHeight } from '../constants';

/* Node Box Model 
model for drawing subnets on the network map
*/

export class NodeBox implements IModelBase {
  columnSize: number;
  height: number; //bounding box including name
  id: string;
  index?: number;
  innerHeight: number; //fill height o container devices
  innerWidth: number; //min width to contain devices
  label?: string;
  meta: LooseObject;
  model: IGroup;
  name: string;
  nodeChildren: Node[];
  numDevices: number;
  rowSize: number;
  nodeBoxType: NodeBoxType;
  size: number[];
  sort?: number;
  titleWidth: number; //min width to contain title text on one line
  type: ModelType;
  width: number;
  x: number; //top
  y: number; //left
  right: number;
  bottom: number;
  constructor(lid: string, ltype: ModelType) {
    this.id = lid;
    this.innerHeight = 0;
    this.innerWidth = 0;

    this.titleWidth = -1;
    this.type = ltype;
    this.x = -1;
    this.y = -1;
    this.width = 0;
    this.height = 0;
    this.bottom = 0;
    this.right = 0;
    this.size = [0, 0];

    this.meta = { ip: '' };
  }

  setDimensions(iconSize: number = 50, nodes: Node[]) {
    //[Blazor] AutoLayout.GetRowCol(ng.devices.length, rc);
    //this.numDevices = this.model?.devices.length || 0;

    let nodeChildren: Node[] = [];
    for (let j = 0; j < this.model?.packages.length; j++) {
      //get node from Nodes list
      var node = nodes.find(
        (node: Node) => node.id === this.model?.packages[j],
      );

      if (node) {
        // if (
        //   node.nodeType === NodeType.ROUTER ||
        //   node.nodeType === NodeType.FIREWALL
        // ) {
        //   continue;
        // }

        //allows devices with unknown type to show up on map for fixing.
        nodeChildren.push(node);
      } else {
        //TroubleShoot
        console.log('device not found in master devices list');
        // console.log('subnet device name', this.model?.devices[j]);
      }
    }

    this.nodeChildren = nodeChildren;
    this.numDevices = this.nodeChildren.length;

    // console.log('numDevices', this.numDevices);
    // console.log('nodeChildren', this.nodeChildren);
    if (this.numDevices <= 3) {
      this.columnSize = this.numDevices;
      this.rowSize = 1;
    } else {
      const columns = this.numDevices / 2;
      this.columnSize =
        this.numDevices % 2 == 0 ? columns : Math.floor(columns) + 1;
      const rows = this.numDevices / this.columnSize;
      this.rowSize =
        this.numDevices % this.columnSize == 0 ? rows : Math.floor(rows) + 1;
    }

    this.innerWidth = this.columnSize * iconSize;
    this.innerHeight = this.rowSize * iconSize;
    this.width = this.innerWidth;
    this.height = this.innerHeight + fontHeight;

    //this.size = Math.max(this.width, this.height);
    this.size = [this.width * 1.5, this.height * 1.5];
  }

  setTitleWidth(lTitleWidth: number) {
    this.titleWidth = lTitleWidth;
    this.width = Math.max(this.innerWidth, lTitleWidth);
  }

  setName(lName: string) {
    this.name = lName;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.bottom = this.y + this.height;
    this.right = this.x + this.width;
  }

  // setNodeBoxType(
  //   domain_networks: IDomainNetworkGroup[],
  //   internet_networks: any[],
  //   devices: IDevice[]
  // ) {
  //   const domainNetwork = getNetwork(this.id, domain_networks);

  //   if (
  //     !domainNetwork ||
  //     getIsInNetworks(this.id, internet_networks) ||
  //     getIsRouterFirewallSubnet(this.model, devices)
  //   ) {
  //     this.nodeBoxType = NodeBoxType.INVALID;
  //     return false;
  //   }

  //   this.setName(domainNetwork.name.replace('Domain1-Adv-Attack-', ''));
  //   if (this.model.subnets?.length > 0) {
  //     this.meta['ip'] = this.model.subnets[0].subnet;
  //   }

  //   this.nodeBoxType =
  //     this.numDevices > 0 ? NodeBoxType.CONTAINS_DEVICE : NodeBoxType.EMPTY;
  //   return true;
  // }
}
