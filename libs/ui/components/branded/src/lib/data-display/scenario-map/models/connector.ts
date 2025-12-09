import { IconType, ModelType, NodeType, IModelBase, LooseObject } from './model-types';

/* Connector Model 
model for connecting devices and subnet boxes on the network map
*/

export class Connector implements IModelBase {
  columnSize: number;
  height: number;
  iconType: IconType;
  id: string;
  meta: LooseObject;
  name: string;
  size: number[];
  type: ModelType;
  nodeType: NodeType;
  rowSize: number;
  width: number;
  x: number; //top
  y: number; //left
  right: number;
  bottom: number;

  constructor(id: string, fromModelId: string, toModelId: string) {
    this.id = id;
    this.x = -1;
    this.y = -1;
    this.height = 14; //TEMP
    this.width = 600; //TEMP
    this.size = [0, 0];
    this.name = '';
    this.meta = {
      from: fromModelId,
      to: toModelId,
      sourceX: 0,
      targetX: 0,
    };
    this.bottom = 0;
    this.right = 0;
    this.type = ModelType.CONNECTOR;
  }

  setName(lName: string) {
    this.name = lName;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
