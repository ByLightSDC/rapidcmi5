// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-prototype-builtins */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';

// /* Store */
// import {
//   menu,
//   setCounterProperty,
//   setErrorProperty,
//   setTouchedProperty,
// } from '../redux/packageReducer';

// import { menuOptionData } from '../constants/forms';
// import {
//   menuOptionData as sharedMenuOptionData,
//   tMenuOptionData,
// } from '@rapid-cmi5/ui/api/forms';
// import {
//   Package,
//   PackageCreate,
//   PackageUpdate,
// } from '@rapid-cmi5/ui/branded';

// /* Constants */
// import { Category, Topic } from '@rapid-cmi5/ui/branded';

// /**
//  * Hook that determines whether field arrays have changed in the Package Form
//  * Persists this 'touched' information along with the count so it can be displayed
//  * in a menu, see AdvancedMenu
//  * @param {any} [watch] Form watch fxn for determining fields that have changed
//  * @param {any} [errors] Form errors for determining field that have errors
//  * @param {any} [dispatch] Dispatch for notifying values have changed
//  * @param {any} [defaultData] Default data for determining whether values have changed
//  * @return {JSX.Element} React Component
//  */
// export const usePackageOptionMenu = (
//   errors?: any,
//   dispatch?: any,
//   formMethods?: any,
//   defaultData?: Package | PackageCreate | PackageUpdate,
// ) => {
//   const { getValues } = formMethods;
//   const menuSel = useSelector(menu);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [diffData, setDiffData] = useState<any>(null);

//   //#region touched
//   /**
//    * Gets whether package property has been touched
//    * @param {string} property Package Property, see packageProperties
//    * @return {boolean} Returns whether the field array for this property has been touched
//    */
//   const getPropertyTouched = (property: string): boolean => {
//     if (menuSel && menuSel.hasOwnProperty(property)) {
//       return menuSel[property].touched;
//     }
//     return false;
//   };
//   //#endregion

//   /** Triggered when a field arr count changes
//    * updates menu counter associated with the field
//    * and sets touched property
//    */
//   const onCountChange = (fieldName: string, count: number) => {
//     if (!isInitialized) {
//       return;
//     }
//     for (let i = 0; i < packageProperties.length; i++) {
//       const property = packageProperties[i];
//       const fieldArrName = getMenuOptionData(property)?.arrayFieldName;
//       if (fieldArrName && fieldArrName === fieldName) {
//         updateCounters(property, count);

//         //also called on mount (when switching topics)
//         const defaultCount = diffData.hasOwnProperty(fieldArrName)
//           ? diffData[fieldArrName]?.length
//           : 0;

//         if (defaultCount !== count) {
//           //REF probably dont need this since onWatch will trigger when
//           //user selects a value
//           //dispatch(setTouchedProperty({ property: property, value: true }));
//         }
//       }
//     }
//   };

//   /** Triggered when a field value changes
//    * FUTURE - we should trigger touched here
//    * but consideration needed for multiselect
//    * which would trigger X changes all at once
//    */
//   const onWatchChange = (fieldName: string, newValue: string) => {
//     if (!isInitialized) {
//       return;
//     }
//     for (let i = 0; i < packageProperties.length; i++) {
//       const property = packageProperties[i];

//       const fieldArrName = getMenuOptionData(property)?.arrayFieldName;

//       if (fieldArrName && fieldName.includes(fieldArrName)) {
//         dispatch(setTouchedProperty({ property: property, value: true }));
//       }
//     }
//   };

//   /**
//    * Updates count & touched information for this property
//    * Persists info in the redux store
//    * @param {string} property Package Property, see packageProperties
//    * @param {number} count Array count for this property
//    */
//   const updateCounters = (property: string, count: number) => {
//     if (!dispatch) {
//       return;
//     }
//     dispatch(setCounterProperty({ property, value: count }));
//   };

//   /**
//    * Returns how many of these types of objects exist in the form
//    * @param {string} property Package Property, see packageProperties
//    * @return {number} Returns number of items in the form field array for this topic
//    */
//   const getMenuCount = (property: string): number => {
//     const menuData = getMenuOptionData(property);
//     if (menuData) {
//       if (menuSel && menuSel.hasOwnProperty(property)) {
//         return menuSel[property].count;
//       }
//     }
//     return 0;
//   };

//   /**
//    * Aggregates counts for objects in the form into categories
//    * @param {Category} category Category to tally
//    * @return {number} Number of items
//    */
//   const getCategoryCount = (category: Category) => {
//     switch (category) {
//       case Category.Networking:
//         return (
//           getMenuCount(Topic.TorNetwork) +
//           getMenuCount(Topic.InternetGateway) +
//           getMenuCount(Topic.IP) +
//           getMenuCount(Topic.AutoIP) +
//           getMenuCount(Topic.HostNetwork) +
//           getMenuCount(Topic.Network) +
//           getMenuCount(Topic.Layer3Network) +
//           getMenuCount(Topic.AutoLayer3Network) +
//           getMenuCount(Topic.Router) +
//           getMenuCount(Topic.BgpLink) +
//           getMenuCount(Topic.BGP) +
//           getMenuCount(Topic.DnsRecord) +
//           getMenuCount(Topic.DnsServer) +
//           getMenuCount(Topic.DnsZone)
//         );
//       case Category.IPNetworking:
//         return (
//           getMenuCount(Topic.Network) +
//           getMenuCount(Topic.IP) +
//           getMenuCount(Topic.AutoIP) +
//           getMenuCount(Topic.Layer3Network) +
//           getMenuCount(Topic.AutoLayer3Network)
//         );
//       case Category.Routers:
//         return (
//           getMenuCount(Topic.Router) +
//           getMenuCount(Topic.BgpLink) +
//           getMenuCount(Topic.BGP)
//         );
//       case Category.BGP:
//         return getMenuCount(Topic.BgpLink) + getMenuCount(Topic.BGP);
//       case Category.DNS:
//         return (
//           getMenuCount(Topic.DnsRecord) +
//           getMenuCount(Topic.DnsServer) +
//           getMenuCount(Topic.DnsZone)
//         );
//       case Category.Traffic:
//         return (
//           getMenuCount(Topic.GhostAgent) +
//           getMenuCount(Topic.GhostC2Server) +
//           getMenuCount(Topic.GhostClient) +
//           getMenuCount(Topic.GhostTrafficProfile) +
//           getMenuCount(Topic.TrafficTracker)
//         );
//       case Category.RangeContent:
//         return (
//           getMenuCount(Topic.AnsiblePlaybook) +
//           getMenuCount(Topic.Console) +
//           getMenuCount(Topic.ContainerSpec) +
//           getMenuCount(Topic.Volume) +
//           getMenuCount(Topic.VMSpec)
//         );
//       case Category.PKI:
//         return getMenuCount(Topic.PKI) + getMenuCount(Topic.Certificate);
//       case Category.Assessments:
//         return getMenuCount(Topic.TelemetryAgent);
//     }
//     return 0;
//   };

//   /** useEffect initializes counters for each property */
//   useEffect(() => {
//     if (!isInitialized && getValues) {
//       if (
//         !defaultData ||
//         !defaultData.hasOwnProperty('containerSpecifications')
//       ) {
//         return;
//       }

//       try {
//         setDiffData(JSON.parse(JSON.stringify(defaultData)));
//       } catch (e) {
//         console.log(
//           'Error [PackageOptionMenu] Could not clone package data for diffing',
//         );
//       }

//       for (let i = 0; i < packageProperties.length; i++) {
//         const property = packageProperties[i];
//         const fieldArrName = getMenuOptionData(property)?.arrayFieldName;

//         if (fieldArrName) {
//           const val = getValues(fieldArrName);

//           // *** special case - only ONE Traffic Tracker in a package
//           if (property === Topic.TrafficTracker) {
//             updateCounters(property, val ? 1 : 0);
//           } else if (val?.length > 0) {
//             updateCounters(property, val.length);
//           } else {
//             updateCounters(property, 0);
//           }
//           dispatch(setTouchedProperty({ property: property, value: false }));
//         }
//       }

//       setIsInitialized(true);
//     }
//   }, [defaultData, isInitialized]);

//   //#region errors
//   /**
//    * Updates error information for this property
//    * Persists info in the redux store
//    * @param {string} property Package Property, see packageProperties
//    * @param {boolean} hasError Error indication for this property
//    */
//   const updateHasErrors = (property: string, hasError: boolean) => {
//     if (!errors || !dispatch) {
//       return;
//     }

//     dispatch(setErrorProperty({ property, value: hasError }));
//   };

//   /**
//    * Returns whether there are any errors for this topic
//    * @param {string} property Package Property, see packageProperties
//    * @return {boolean} Returns number of items in the form field array for this topic
//    */
//   const getTopicHasErrors = (property: string): boolean => {
//     const menuData = getMenuOptionData(property);
//     if (menuData) {
//       if (menuSel && menuSel.hasOwnProperty(property)) {
//         return menuSel[property].hasError;
//       }
//     }
//     return false;
//   };

//   /**
//    * Aggregates whether there are errors for topics into categories
//    * @param {Category} category Category to tally
//    * @return {boolean} Whether any items in category has errors
//    */
//   const getCategoryHasErrors = (category: Category) => {
//     switch (category) {
//       case Category.Networking:
//         return (
//           getTopicHasErrors(Topic.TorNetwork) ||
//           getTopicHasErrors(Topic.InternetGateway) ||
//           getTopicHasErrors(Topic.IP) ||
//           getTopicHasErrors(Topic.AutoIP) ||
//           getTopicHasErrors(Topic.Layer3Network) ||
//           getTopicHasErrors(Topic.AutoLayer3Network) ||
//           getTopicHasErrors(Topic.HostNetwork) ||
//           getTopicHasErrors(Topic.Network) ||
//           getTopicHasErrors(Topic.Router) ||
//           getTopicHasErrors(Topic.BgpLink) ||
//           getTopicHasErrors(Topic.BGP) ||
//           getTopicHasErrors(Topic.DnsRecord) ||
//           getTopicHasErrors(Topic.DnsServer) ||
//           getTopicHasErrors(Topic.DnsZone)
//         );
//       case Category.IPNetworking:
//         return (
//           getTopicHasErrors(Topic.Network) ||
//           getTopicHasErrors(Topic.IP) ||
//           getTopicHasErrors(Topic.AutoIP) ||
//           getTopicHasErrors(Topic.Layer3Network) ||
//           getTopicHasErrors(Topic.AutoLayer3Network)
//         );
//       case Category.Routers:
//         return (
//           getTopicHasErrors(Topic.Router) ||
//           getTopicHasErrors(Topic.BgpLink) ||
//           getTopicHasErrors(Topic.BGP)
//         );
//       case Category.BGP:
//         return getTopicHasErrors(Topic.BgpLink) || getTopicHasErrors(Topic.BGP);
//       case Category.DNS:
//         return (
//           getTopicHasErrors(Topic.DnsRecord) ||
//           getTopicHasErrors(Topic.DnsServer) ||
//           getTopicHasErrors(Topic.DnsZone)
//         );
//       case Category.Traffic:
//         return (
//           getTopicHasErrors(Topic.GhostAgent) ||
//           getTopicHasErrors(Topic.GhostC2Server) ||
//           getTopicHasErrors(Topic.GhostClient) ||
//           getTopicHasErrors(Topic.GhostTrafficProfile) ||
//           getTopicHasErrors(Topic.TrafficTracker)
//         );
//       case Category.RangeContent:
//         return (
//           getTopicHasErrors(Topic.AnsiblePlaybook) ||
//           getTopicHasErrors(Topic.Console) ||
//           getTopicHasErrors(Topic.ContainerSpec) ||
//           getTopicHasErrors(Topic.Volume) ||
//           getTopicHasErrors(Topic.VMSpec)
//         );
//       case Category.PKI:
//         return (
//           getTopicHasErrors(Topic.PKI) || getTopicHasErrors(Topic.Certificate)
//         );
//       case Category.Assessments:
//         return getTopicHasErrors(Topic.TelemetryAgent);
//     }
//     return false;
//   };

//   // #region Use Effect for topics
//   useEffect(() => {
//     updateHasErrors(Topic.AnsiblePlaybook, Boolean(errors?.ansiblePlaybooks));
//   }, [errors?.ansiblePlaybooks]);

//   useEffect(() => {
//     updateHasErrors(Topic.BGP, Boolean(errors?.rangeBGPs));
//   }, [errors?.rangeBGPs]);

//   useEffect(() => {
//     updateHasErrors(Topic.BgpLink, Boolean(errors?.rangeBGPLinks));
//   }, [errors?.rangeBGPLinks]);

//   useEffect(() => {
//     updateHasErrors(Topic.Certificate, Boolean(errors?.rangeCerts));
//   }, [errors?.rangeCerts]);

//   useEffect(() => {
//     updateHasErrors(Topic.Console, Boolean(errors?.rangeConsoles));
//   }, [errors?.rangeConsoles]);

//   useEffect(() => {
//     updateHasErrors(
//       Topic.ContainerSpec,
//       Boolean(errors?.containerSpecifications),
//     );
//   }, [errors?.containerSpecifications]);

//   useEffect(() => {
//     updateHasErrors(Topic.GhostAgent, Boolean(errors?.ghostAgents));
//   }, [errors?.ghostAgents]);

//   useEffect(() => {
//     updateHasErrors(Topic.GhostC2Server, Boolean(errors?.ghostC2Servers));
//   }, [errors?.ghostC2Servers]);

//   useEffect(() => {
//     updateHasErrors(Topic.GhostClient, Boolean(errors?.ghostClients));
//   }, [errors?.ghostClients]);

//   useEffect(() => {
//     updateHasErrors(
//       Topic.GhostTrafficProfile,
//       Boolean(errors?.ghostTrafficProfiles),
//     );
//   }, [errors?.ghostTrafficProfiles]);

//   useEffect(() => {
//     updateHasErrors(Topic.DnsServer, Boolean(errors?.rangeDNSServers));
//   }, [errors?.rangeDNSServers]);

//   useEffect(() => {
//     updateHasErrors(Topic.DnsZone, Boolean(errors?.rangeDNSZones));
//   }, [errors?.rangeDNSZones]);

//   useEffect(() => {
//     updateHasErrors(Topic.DnsRecord, Boolean(errors?.rangeDNSRecords));
//   }, [errors?.rangeDNSRecords]);

//   useEffect(() => {
//     updateHasErrors(Topic.InternetGateway, Boolean(errors?.internetGateways));
//   }, [errors?.internetGateways]);

//   useEffect(() => {
//     updateHasErrors(Topic.IP, Boolean(errors?.rangeIPs));
//   }, [errors?.rangeIPs]);
//   useEffect(() => {
//     updateHasErrors(Topic.AutoIP, Boolean(errors?.rangeAutoIPs));
//   }, [errors?.rangeAutoIPs]);

//   useEffect(() => {
//     updateHasErrors(Topic.Layer3Network, Boolean(errors?.rangeL3Networks));
//   }, [errors?.rangeL3Networks]);
//   useEffect(() => {
//     updateHasErrors(
//       Topic.AutoLayer3Network,
//       Boolean(errors?.rangeAutoL3Networks),
//     );
//   }, [errors?.rangeL3Networks]);

//   useEffect(() => {
//     updateHasErrors(Topic.HostNetwork, Boolean(errors?.rangeHostNetworks));
//   }, [errors?.rangeHostNetworks]);

//   useEffect(() => {
//     updateHasErrors(Topic.Network, Boolean(errors?.rangeNetworks));
//   }, [errors?.rangeNetworks]);

//   useEffect(() => {
//     updateHasErrors(Topic.PKI, Boolean(errors?.rangePkis));
//   }, [errors?.rangePkis]);

//   useEffect(() => {
//     updateHasErrors(Topic.Router, Boolean(errors?.rangeRouters));
//   }, [errors?.rangeRouters]);

//   useEffect(() => {
//     updateHasErrors(Topic.TelemetryAgent, Boolean(errors?.telemetryAgents));
//   }, [errors?.telemetryAgents]);

//   useEffect(() => {
//     updateHasErrors(Topic.TorNetwork, Boolean(errors?.rangeTorNets));
//   }, [errors?.rangeTorNets]);

//   useEffect(() => {
//     updateHasErrors(Topic.TrafficTracker, Boolean(errors?.trafficTracker));
//   }, [errors?.trafficTracker]);

//   useEffect(() => {
//     updateHasErrors(Topic.VMSpec, Boolean(errors?.vmSpecifications));
//   }, [errors?.vmSpecifications]);

//   useEffect(() => {
//     updateHasErrors(Topic.Volume, Boolean(errors?.rangeVolumes));
//   }, [errors?.rangeVolumes]);
//   // #endregion useEffects
//   //#end region errors

//   return {
//     getPropertyTouched,
//     getCategoryCount,
//     getCategoryHasErrors,
//     getMenuCount,
//     getTopicHasErrors,
//     onWatchChange,
//     onCountChange,
//   };
// };

// /** @constant
//  * Package Properties
//  *  @type {string[]}
//  */
// export const packageProperties = [
//   Topic.AnsiblePlaybook,
//   Topic.BGP,
//   Topic.BgpLink,
//   Topic.Certificate,
//   Topic.Console,
//   Topic.ContainerSpec,
//   Topic.DnsServer,
//   Topic.DnsZone,
//   Topic.DnsRecord,
//   Topic.IP,
//   Topic.AutoIP,
//   Topic.GhostAgent,
//   Topic.GhostC2Server,
//   Topic.GhostClient,
//   Topic.GhostTrafficProfile,
//   Topic.InternetGateway,
//   Topic.Layer3Network,
//   Topic.AutoLayer3Network,
//   Topic.HostNetwork,
//   Topic.Network,
//   Topic.PKI,
//   Topic.Router,
//   Topic.TelemetryAgent,
//   Topic.TorNetwork,
//   Topic.TrafficTracker,
//   Topic.VMSpec,
//   Topic.Volume,
// ];

// /**
//  * Returns data for a menu option
//  * @param {string} property Package Property
//  * @return {tMenuOptionData} Menu option data
//  */
// export const getMenuOptionData = (property: string): tMenuOptionData | null => {
//   if (sharedMenuOptionData.hasOwnProperty(property)) {
//     return sharedMenuOptionData[property];
//   }
//   if (menuOptionData.hasOwnProperty(property)) {
//     return menuOptionData[property];
//   }
//   return null;
// };
