export interface IScenarioMapData {
  id: string;
  name: string;
  description: string;
  packages: IPackage[];
  // domain_type: string;
  // devices: IDevice[];
  // domain_networks: IDomainNetworkGroup[];
  // internet_networks: any[];
  // network_groups: INetworkGroup[];
  // internet_link: IInternetLink;
  // physical_interfaces: any[];
}

export interface IPackage {
  id: string;
  name: string;
  description: string;
  // subnets: ISubnetGroup[];
  // devices: string[];
  // physical_interfaces: any[];
}

export interface IGroup {
  id: string;
  packages: string[];
}

// //Data Types for SLAMR Domain Map Data

// /* eslint-disable-next-line */
// export interface IDomainMapData {
//   id: string;
//   name: string;
//   description: string;
//   domain_type: string;
//   devices: IDevice[];
//   domain_networks: IDomainNetworkGroup[];
//   internet_networks: any[];
//   network_groups: INetworkGroup[];
//   internet_link: IInternetLink;
//   physical_interfaces: any[];
// }

// export interface IDomainNetworkGroup {
//   id: string;
//   name: string;
//   description: string;
//   type: string;
// }

// export interface INetworkGroup {
//   id: string;
//   subnets: ISubnetGroup[];
//   devices: string[];
//   physical_interfaces: any[];
// }

// export interface ISubnetGroup {
//   subnet: string;
//   gateway: string;
//   weight: number;
// }

// export interface IInternetLink {
//   domain_network: string;
//   domain_device_id: string;
//   internet_network: string;
//   internet_device_id: string;
//   domain_type: string;
// }

// export interface IDevice {
//   id: string;
//   template_id: string;
//   real: boolean;
//   name: string;
//   host_name: string;
//   type: string;
//   os: string;
//   ip: string;
//   subnet: string;
//   is_running: boolean;
//   network_connections: INetworkConnection[]; //array of objects with id
// }

// export interface IDeviceManagerType {
//   id: string;
//   name: string;
//   icon?: string;
//   can_have_children: boolean;
// }

// export interface INetworkConnection {
//   id: string;
// }
