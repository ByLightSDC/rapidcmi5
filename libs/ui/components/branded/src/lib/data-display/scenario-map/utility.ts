// import {
//   NodeType
// } from './models/model-types';
// import {
//   IDevice,
//   IDeviceManagerType,
//   INetworkGroup,
// } from './network-map-data-types';
// import { deviceManagerTypes } from './constants';

// export const getDeviceManagerType = (
//   deviceTypeId: string
// ): IDeviceManagerType | undefined => {
//   return deviceManagerTypes.find(
//     (deviceManagerType: any) => deviceManagerType.id === deviceTypeId
//   );
// };

// export const getDomainNetworkName = (domainNetworkWork: string): string => {
//   return domainNetworkWork.replace('Domain1-Adv-Attack-', '');
// };

// export const getNetwork = (subnetId: string, networks: any[]) => {
//   return networks.find((domain: any) => domain.id === subnetId);
// };

// export const getIsInNetworks = (subnetId: string, networks: any[]) => {
//   const records = networks.filter((domain: any) => domain.id === subnetId);
//   if (records?.length > 0) {
//     return true;
//   }
//   return false;
// };

// export const getIsRouterFirewallSubnet = (
//   subnet: INetworkGroup,
//   devices: IDevice[]
// ) => {
//   //either router and at least one firewall found OR all devices are firewalls
//   let foundRouter = false;
//   let fireWallCount = 0;
//   for (let i = 0; i < subnet.devices.length; i++) {
//     var device = devices.find(
//       (device: IDevice) => device.id === subnet.devices[i]
//     );
//     if (device) {
//       if (!foundRouter) {
//         foundRouter = getIsRouter(device.type);
//       }
//       const isFirewall = getIsFirewall(device.type);
//       if (isFirewall) {
//         fireWallCount++;
//       }
//     }
//   }

//   return (
//     (foundRouter && fireWallCount > 0) ||
//     fireWallCount === subnet.devices.length
//   );
// };

// export const getIsRouter = (deviceTypeId: string) => {
//   const deviceType = getDeviceManagerType(deviceTypeId);
//   if (deviceType) {
//     return deviceType.name === NodeType.ROUTER;
//   }
//   return false;
// };

// export const getIsFirewall = (deviceTypeId: string) => {
//   const deviceType = getDeviceManagerType(deviceTypeId);
//   if (deviceType) {
//     return deviceType.name.toLowerCase() === NodeType.FIREWALL;
//   }
//   return false;
// };

// export const getNumRealDevicesInSubnet = (
//   deviceIds: string[],
//   devices: any[]
// ) => {
//   let routerCount = 0;
//   let fireWallCount = 0;
//   for (let i = 0; i < deviceIds.length; i++) {
//     var device = devices.find((device: IDevice) => device.id === deviceIds[i]);
//     if (device) {
//       const isRouter = getIsRouter(device.type);

//       if (isRouter) {
//         routerCount++;
//       } else {
//         const isFirewall = getIsFirewall(device.type);
//         if (isFirewall) {
//           fireWallCount++;
//         }
//       }
//     }
//   }

//   return deviceIds.length - routerCount - fireWallCount;
// };

// export const getSwitchGuidStr = (networkGroup: INetworkGroup): string => {
//   return 'id';
// };
