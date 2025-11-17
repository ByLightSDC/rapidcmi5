export interface INetworkVizData {
  netmapScenario: INetmapScenario;
}

export interface INetmapScenario {
  name: string;
  uuid: string;
  netmapPackages?: INetmapPackages[] | null;
  scenarioNetworkLinks?: any[] | null;
}

export interface INetmapPackages {
  name: string;
  uuid: string;
  containerSpecificationCollection?: any[] | null;
  netmapRangeL3Networks?: any[] | null;
  rangeRouterCollection?: any[] | null;
  vmSpecificationCollection?: any[] | null;
  packageNetworkLinks?: any[] | null;
}

export interface INetmapScenarioLinks {
  uuid: string;
  packages?: any[] | null;
}

export enum NetmapNodeType {
  DEFAULT = 'default',
  UUID = 'uuid',
  PACKAGE = 'Package',
  L3 = 'L3',
  ROUTER = 'Router',
  CONTAINER = 'Container',
  RANGEROUTER = 'Range Router',
  RANGECONTAINER = 'Range Container',
  VM = 'VM',
}
