/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

//#region import hooks

import {
  useGetContainerSpec,
  useDeleteContainerSpec,
  useGetContainerSpecs,
  usePostContainerSpec,
  usePutContainerSpec,
  queryKeyContainerSpecs,
} from './useContainerSpecs';



import {
  useGetRangeConsole,
  useDeleteRangeConsole,
  useGetRangeConsoles,
  usePostRangeConsole,
  usePutRangeConsole,
  queryKeyRangeConsoles,
} from './useRangeConsoles';

import {
  useGetRangeResourceContainer,
  useGetRangeResourceContainers,
  queryKeyRangeResourceContainers,
} from './useRangeResourceContainers';


import {
  useGetRangeResourceScenario,
  useGetRangeResourceScenarios,
  useGetRangeResourceScenarioOverrides,
  queryKeyRangeResourceScenarios,
  useGetRangeResourceScenarioPermissions,
  queryKeyRangeResourceScenarioPermissions,
  useDeleteRangeResourceScenario,
} from './useRangeResourceScenarios';

import {
  queryKeyAutoGraders,
  useDeleteAutoGrader,
  useGetAutoGrader,
  useGetAutoGraders,
  usePostAutoGrader,
  usePutAutoGrader,
} from './useAutoGraders';


import { queryKeyCMI5Scenarios, useGetCMI5Scenarios } from './useCMI5Scenarios';
import { queryKeyKSATs, useGetKSATs } from './lms/useKSATs';
//#endregion

/**
 * @enum {string} API Categories
 * A category is used to group one or more topics and can't be CRUD'd
 */
export enum Category {
  Assessments = 'Assessments',
  BGP = 'BGP',
  DNS = 'DNS',
  IPNetworking = 'IP Networking',
  Networking = 'Networking',
  Traffic = 'Traffic',
  RangeContent = 'Range Content',
  PKI = 'PKI',
  Routers = 'Routers ', // purposeful space so cypress can distinguish lower level topic in menu
}

/**
 * @enum {string} API Topics
 * A topic can be CRUD'd
 */
export enum Topic {
  AnsiblePlaybook = 'Ansible Playbook',
  AnsibleRole = 'Ansible Role',
  AutoGrader = 'Auto Grader',
  AutoIP = 'Auto IP',
  AutoLayer3Network = 'Auto IP Subnet',
  AwsEnvironmentCred = 'Credentials (AWS)',
  AwsRangeSpec = 'Range Spec (AWS)',
  BackgroundJob = 'Background Job',
  BGP = 'BGP',
  BgpLink = 'BGP Link',
  Blueprint = 'Blueprint', //designer only
  BlueprintChild = 'BlueprintChild', //designer only
  Certificate = 'Certificate',
  Chart = 'Chart',
  ChartSchema = 'ChartSchema',
  ClusterNetwork = 'Cluster Network',
  ClassDeployment = 'Class Deployment',
  ClassEntry = 'Class Entry',
  CMI5AuMapping = 'AU Mapping',
  CMI5Class = 'Class',
  CMI5Course = 'Course',
  CMI5Registration = 'Registration',
  CMI5Scenario = 'Class Scenario',
  Component = 'Component',
  Console = 'Console',
  ContainerImage = 'Container Image',
  ContainerSpec = 'Container Spec',
  CPE = 'CPE',
  DnsServer = 'DNS Server',
  DnsZone = 'DNS Zone',
  DnsRecord = 'DNS Record',
  Draft = 'Plan',
  DraftState = 'DraftState',
  Environment = 'Environment',
  EnvironmentSpec = 'Environment Spec',
  File = 'File',
  GhostAgent = 'Ghost Agent',
  GhostC2Server = 'Ghost C2 Server',
  GhostClient = 'Ghost Client',
  GhostMachine = 'Ghost Machine',
  GhostTraffic = 'Ghost Traffic',
  GhostTrafficProfile = 'Ghost Traffic Profile',
  HostNetwork = 'Host Network',
  Interface = 'Interface', //designer only
  InternetGateway = 'Internet Gateway',
  IP = 'IP',
  KSAT = 'KSAT',
  Layer3Network = 'IP Subnet',
  LtiCourseMapping = 'LTI Course Mapping',
  Network = 'Network',
  NetworkOverride = 'Network Override',
  Package = 'Package',
  PCTENetspec = 'PCTE Standard Netspec',
  PKI = 'PKI',
  PortMirror = 'PortMirror', //designer only
  RancherEnvironmentCred = 'Credentials (Rancher)',
  Range = 'Range',
  ResourceAutoGrader = 'Auto Grader Result',
  ResourceAnsiblePlaybook = 'ResourceAnsiblePlaybook',
  ResourceCertificate = 'ResourceCertificate',
  ResourceClusterNetwork = 'ResourceClusterNetwork',
  ResourceConsole = 'ResourceConsole',
  ResourceContainer = 'ResourceContainer',
  ResourceDnsRecord = 'ResourceDnsRecord',
  ResourceDnsServer = 'ResourceDnsServer',
  ResourceDnsZone = 'ResourceDnsZone',
  ResourceGhostC2Server = 'ResourceGhostC2Server',
  ResourceGhostTrafficProfile = 'Machine Ghost Traffic Profile',
  ResourceHardwareDevice = 'Hardware Device',
  ResourceAutoIP = 'ResourceAutoIP',
  ResourceIP = 'ResourceIP',
  ResourceLayer3Network = 'ResourceIPSubnet',
  ResourceNetwork = 'ResourceNetwork',
  ResourcePackage = 'ResourcePackage',
  ResourcePKI = 'ResourcePKI',
  ResourceRouter = 'ResourceRouter',
  ResourceScenario = 'ResourceScenario',
  ResourceScenarioPermissions = 'Scenario Access',
  ResourceVM = 'ResourceVM',
  ResourceScenarioOverrides = 'ResourceScenarioOverrides',
  Router = 'Router',
  RouterInterface = 'Router Interface', //designer only
  Scenario = 'Scenario',
  SSOGroup = 'KeyCloak UserGroup',
  SSOUser = 'KeyCloak UserName',
  TelemetryAgent = 'Telemetry Agent',
  TorNetwork = 'Tor Network',
  TrafficCapture = 'Traffic Capture',
  TrafficTracker = 'Traffic Tracker',
  VMImage = 'VM Image',
  VMSpec = 'VM Spec',
  VMSpecInterface = 'VM Spec Interface', //designer only
  Volume = 'Volume',
  DPVolume = 'DPVolume',
  RangeVolumesContent = 'RangeVolumesContent', //designer only,
  StaticWebSite = 'Static Web Site', //designer only
  VsphereEnvironmentCred = 'Credentials (vSphere)',
  VsphereRangeSpec = 'Range Spec (vSphere)',
  WebScrape = 'Web Scrape',
  Unknown = 'Unknown',
}

/**
 * @enum {string} API Topic Edit Routes
 * Route to topic's list view
 * Appending `/${uuid}` to the route will present topic's Edit Form
 * Appending '/create' will route to topic's Create Form
 */
export enum TopicRoutes {
  IndividualTrainingScenario = '/scenario', //user-portal
  AnsiblePlaybook = '/components/ansible_playbooks',
  AnsibleRole = '/components/ansible_roles',
  AutoGrader = '/components/telemetry_agents/parent_agent',
  AutoIP = '/components/automatic_ips',
  AutoLayer3Network = '/components/automatic_ip_subnets',
  AwsEnvironmentCred = '/components/environment_credentials/aws',
  AwsRangeSpec = '/components/range_specifications/aws',
  BGP = '/components/bgps',
  BgpLink = '/components/bgp_links',
  Certificate = '/components/certificates',
  Chart = '/components/charts',
  ChartSchema = '',
  ClassDeployment = '/components/class_deployments',
  ClusterNetwork = '/components/cluster_networks',
  CMI5AuMapping = '/components/au_mappings',
  CMI5Class = '/classes',
  Component = '/components/components',
  Console = '/components/consoles',
  ContainerImage = '/components/container_images',
  ContainerSpec = '/components/container_specs',
  CPE = '/components/cpes',
  DnsServer = '/components/dns_servers',
  DnsZone = '/components/dns_zones',
  DnsRecord = '/components/dns_zones/parent_zone',
  Draft = '/design_tools/scenario_designer',
  Environment = '/environments',
  EnvironmentSpec = '/components/environment_specifications',
  File = '/components/files',
  GhostAgent = '/components/ghost_agents',
  GhostC2Server = '/components/ghost_c2_servers',
  GhostClient = '/components/ghost_clients',
  GhostTraffic = '/components/ghost_traffic',
  GhostTrafficProfile = '/components/ghost_traffic_profiles',
  HostNetwork = '/components/host_networks',
  InternetGateway = '/components/internet_gateways',
  IP = '/components/ip_list',
  Layer3Network = '/components/ip_subnets',
  LtiCourseMapping = '/components/lti_course_mappings',
  Network = '/components/networks',
  NetworkOverride = '/components/network_overrides',
  Package = '/components/packages',
  PCTENetspec = '/design_tools/pcte_netspecs',
  PKI = '/components/pkis',
  RancherEnvironmentCred = '/components/environment_credentials/rancher',
  Range = '/manage_ranges',
  ResourceConsole = '', //TODO
  ResourceContainer = '', //TODO
  ResourcePackage = '', //TODO
  ResourceScenario = '', //TODO
  ResourceVM = '', //TODO
  Router = '/components/routers',
  Scenario = '/components/scenarios',
  ScenarioPermissions = '', //resource only
  //NO CRUD SSOGroup = '/keycloak-groups',
  //NO CRUD SSOUser = '/keycloak-users',
  TelemetryAgent = '/components/telemetry_agents',
  TorNetwork = '/components/tor_networks',
  TrafficCapture = 'components/traffic_captures',
  TrafficTracker = '/components/traffic_trackers',
  VMImage = '/components/vm_images',
  VMSpec = '/components/vm_specifications',
  Volume = '/components/volumes',
  DPVolume = '/components/volumes',
  VsphereEnvironmentCred = '/components/environment_credentials/vsphere',
  VsphereRangeSpec = '/components/range_specifications/vsphere',
  WebScrape = '/design_tools/web_scrapes',
}

/**
 * @enum {string} API Topic Override Routes
 * Relative route to topic's override list view (/manage_ranges/<rangeId>/<scenarioId>/<TopicOverrideRoute>)
 */
export const TopicOverrideRoutes = {
  AnsiblePlaybook: 'ansible_playbooks',
  AutoIP: 'automatic_ips',
  AutoLayer3Network: 'automatic_ip_subnets',
  BGP: 'bgps',
  BgpLink: 'bgp_links',
  Certificate: 'certificates',
  ClusterNetwork: 'cluster_networks',
  Console: 'consoles',
  ContainerSpec: 'containers',
  CMI5Registration: 'course_registrations',
  DnsServer: 'dns_servers',
  DnsZone: 'dns_zones',
  DnsRecord: 'dns_records',
  GhostAgent: 'ghost_agents',
  GhostC2Server: 'ghost_c2_servers',
  GhostClient: 'ghost_clients',
  GhostMachine: 'ghost_machines',
  GhostTrafficProfile: 'ghost_traffic_profiles',
  HardwareDevice: 'hardware_devices',
  HostNetwork: 'host_networks',
  InternetGateway: 'internet_gateways',
  IP: 'ip',
  Layer3Network: 'ip_subnets',
  Network: 'networks',
  Package: 'packages',
  PKI: 'pkis',
  Router: 'routers',
  ScenarioPermissions: 'access',
  TelemetryAgent: 'telemetry_agents',
  TorNetwork: 'tor_networks',
  TrafficTracker: 'traffic_trackers',
  VMSpec: 'vms',
  Volume: 'volumes',
};

/**
 * @typedef {Object} tTopicHooks
 * @property {*} apiHook API Hook used to resolve UIUD to name
 * @property {string} [beTypeStr] BE version of FE Topic
 * @property {*} [deleteApiHook] API Hook used to deleta an item
 * @property {*} listApiHook API Hook used to retrieve list
 * @property {*} [postApiHook] API Hook used to create an item
 * @property {*} [putApiHook] API Hook used to update an item
 * @property {*} [overrideApiHook] API Hook used to retrieve deployed item for override
 * @property {string} queryKey React query key associated with topic
 */
type tTopicHooks = {
  apiHook: any;
  beTypeStr?: string;
  deleteApiHook?: any;
  listApiHook: any;
  postApiHook?: any;
  putApiHook?: any;
  overrideApiHook?: any;
  queryKey: string;
};

/**
 * @interface
 * @property {tTopicHooks} [key: string] Api Hooks
 */
interface iApiHooks {
  [key: string]: tTopicHooks;
}
/**
 *  *  @type {iApiHooks[]}

 * @enum {string} API Topic Hooks
 * List of hooks associated with each topic
 */
/** @constant
 * apiTopicsHookData
 * Contains list of hooks associated with each topic
 * Look up beTypeStr in swagger DraftStateCreate Schema
 *  @type {iApiHooks[]}
 */
export const apiTopicsHookData: iApiHooks = {
  //#region Assets

  //#endregion Provisioning Services

  //#region Range Content
  [Topic.AutoGrader]: {
    apiHook: useGetAutoGrader,
    beTypeStr: 'AutoGrader',
    listApiHook: useGetAutoGraders,
    deleteApiHook: useDeleteAutoGrader,
    postApiHook: usePostAutoGrader,
    putApiHook: usePutAutoGrader,
    queryKey: queryKeyAutoGraders,
  },


  [Topic.Console]: {
    apiHook: useGetRangeConsole,
    beTypeStr: 'RangeConsole',
    deleteApiHook: useDeleteRangeConsole,
    listApiHook: useGetRangeConsoles,
    postApiHook: usePostRangeConsole,
    putApiHook: usePutRangeConsole,
    queryKey: queryKeyRangeConsoles,
  },
  [Topic.ContainerSpec]: {
    apiHook: useGetContainerSpec,
    beTypeStr: 'ContainerSpecification',
    deleteApiHook: useDeleteContainerSpec,
    listApiHook: useGetContainerSpecs,
    postApiHook: usePostContainerSpec,
    putApiHook: usePutContainerSpec,
    queryKey: queryKeyContainerSpecs,
  },
  
 
  [Topic.KSAT]: {
    apiHook: null,
    listApiHook: useGetKSATs,
    queryKey: queryKeyKSATs,
  },

  //#endregion Range Content

  [Topic.ResourceContainer]: {
    apiHook: useGetRangeResourceContainer,
    listApiHook: useGetRangeResourceContainers,
    queryKey: queryKeyRangeResourceContainers,
  },
  [Topic.ResourceScenario]: {
    apiHook: useGetRangeResourceScenario,
    listApiHook: useGetRangeResourceScenarios,
    overrideApiHook: useGetRangeResourceScenarioOverrides,
    queryKey: queryKeyRangeResourceScenarios,
  },
  [Topic.ResourceScenarioPermissions]: {
    apiHook: null,
    listApiHook: useGetRangeResourceScenarioPermissions,
    queryKey: queryKeyRangeResourceScenarioPermissions,
  },

  //#endregion Resources

  //#region Design
  [Topic.Blueprint]: {
    apiHook: null,
    listApiHook: null,
    queryKey: 'none',
  },
  [Topic.PortMirror]: {
    apiHook: null,
    listApiHook: null,
    queryKey: 'none',
  },
  [Topic.RangeVolumesContent]: {
    apiHook: null,
    listApiHook: null,
    queryKey: 'none',
  },
  [Topic.StaticWebSite]: {
    apiHook: null,
    listApiHook: null,
    queryKey: 'none',
  },
  //#endregion Design

  //#region CMI5


  [Topic.CMI5Scenario]: {
    apiHook: null,
    listApiHook: useGetCMI5Scenarios,
    queryKey: queryKeyCMI5Scenarios,
    deleteApiHook: useDeleteRangeResourceScenario, // although we fetch
  },
  //#endregion CMI5

  //#region KeyCloak


  //#endregion KeyCloak
};

/**
 * Retrieves the associated hooks for given BE string
 * @param {string} beStr BE type string to look for
 * @returns apiHooks or undefined
 */
export const getApiHookDataByBeStr = (beStr: string) => {
  return Object.entries(apiTopicsHookData).find(
    ([key, value]) => value.beTypeStr === beStr,
  );
};

/** @constant
 * allowsBulkDelete
 * Contains list of topics which allow bulk delete
 */
export const allowsBulkDelete = [
  Topic.AnsiblePlaybook,
  Topic.AnsibleRole,
  Topic.AutoIP,
  Topic.AutoLayer3Network,
  Topic.AwsEnvironmentCred,
  Topic.AwsRangeSpec,
  Topic.BgpLink,
  Topic.BGP,
  Topic.Certificate,
  Topic.ClusterNetwork,
  Topic.CMI5Scenario,
  Topic.Console,
  Topic.ContainerSpec,
  Topic.CPE,
  Topic.DnsServer,
  Topic.EnvironmentSpec,
  Topic.File,
  Topic.GhostAgent,
  Topic.GhostC2Server,
  Topic.GhostClient,
  Topic.GhostTraffic,
  Topic.GhostTrafficProfile,
  Topic.HostNetwork,
  Topic.InternetGateway,
  Topic.IP,
  Topic.Layer3Network,
  Topic.Network,
  Topic.NetworkOverride,
  Topic.PKI,
  Topic.RancherEnvironmentCred,
  Topic.Router,
  Topic.TorNetwork,
  Topic.TrafficTracker,
  Topic.VMImage,
  Topic.VMSpec,
  Topic.Volume,
  Topic.VsphereEnvironmentCred,
  Topic.VsphereRangeSpec,
];
