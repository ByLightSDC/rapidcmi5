/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Types for NetworkMap Models
 * */

export interface LooseObject {
  [key: string]: any;
}

//All of the data models that will be drawn on the map
export enum ModelType {
  NODE_BOX = 'node_box',
  NODE = 'node',
  CONNECTOR = 'connector',
}

export enum NodeBoxType {
  CONTAINS_DEVICE = 'contains_device',
  EMPTY = 'empty',
  EXTERNAL = 'external',
  INVALID = 'invalid',
}

export enum NodeType {
  COUNTER = 'counter',
  TEXTUPDATER = 'textupdater',
  INPUT = 'input',
  DEFAULT = 'default',
}

export interface IModelBase {
  columnSize: number;
  height: number;
  id: string;
  index?: number;
  label?: string;
  name: string;
  type: ModelType;
  rowSize: number;
  size: number[];
  sort?: number;
  width: number;
  right: number;
  bottom: number;
  x: number; //top
  y: number; //left
  meta?: LooseObject;
  setPosition: (x: number, y: number) => void;
}

//Icons
export enum IconType {
  NONE = 'none',
  CLOUD = 'cloud',
  // DUMB_SWITCH = 'dumbswitch',
  // FILE_SERVER = 'fileserver',
  // FIREWALL = 'firewall',
  // INTERNET = 'internet',
  // MAIL_SERVER = 'mailserver',
  // ROUTER = 'router',
  // SERVER = 'server',
  // SMART_SWITCH = 'smartswitch',
  // WEB_SERVICE = 'router',
  // WORK_STATION = 'workstation',
}
