/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

//#region import hooks
import {
  useGetAnsiblePlaybook,
  useGetAnsiblePlaybooks,
  useDeleteAnsiblePlaybook,
  usePostAnsiblePlaybook,
  usePutAnsiblePlaybook,
  queryKeyAnsiblePlaybooks,
} from './useAnsiblePlaybooks';
import {
  useGetAnsibleRole,
  useGetAnsibleRoles,
  useDeleteAnsibleRole,
  queryKeyAnsibleRoles,
} from './useAnsibleRoles';
import {
  useGetAwsEnvironmentCredential,
  useGetAwsEnvironmentCredentials,
  useDeleteAwsEnvironmentCredential,
  queryKeyAwsEnvironmentCreds,
} from './useAwsEnvironmentCredentials';
import {
  useGetAwsRangeSpec,
  useGetAwsRangeSpecs,
  useDeleteAwsRangeSpec,
  queryKeyAwsRangeSpecs,
} from './useAwsRangeSpecs';
import { useGetChart, useGetCharts, queryKeyCharts } from './useCharts';
import {
  useGetChartVersionSchema,
  queryKeyChartVersions,
} from './useChartVersions';
import {
  useGetClusterRangeNetwork,
  useGetClusterRangeNetworks,
  useDeleteClusterRangeNetwork,
  queryKeyClusterRangeNetworks,
} from './useClusterRangeNetworks';
import { queryKeyCMI5CourseRegistrations } from './useCMI5Registrations';
import {
  useGetContainerSpec,
  useDeleteContainerSpec,
  useGetContainerSpecs,
  usePostContainerSpec,
  usePutContainerSpec,
  queryKeyContainerSpecs,
} from './useContainerSpecs';
import { useGetCPE, useDeleteCPE, useGetCPEs, queryKeyCPEs } from './useCPEs';
import {
  useGetDraft,
  useDeleteDraft,
  useGetDrafts,
  usePostDraft,
  usePutDraft,
  queryKeyDrafts,
} from './useDrafts';
import {
  useGetDraftState,
  useDeleteDraftState,
  useGetDraftStates,
  usePostDraftState,
  queryKeyDraftStates,
} from './useDraftStates';
import {
  useGetEnvironmentSpec,
  useGetEnvironmentSpecs,
  useDeleteEnvironmentSpec,
  queryKeyEnvironmentSpecs,
} from './useEnvironmentSpecs';
import {
  queryKeyGhostAgents,
  useDeleteGhostAgent,
  useGetGhostAgent,
  useGetGhostAgents,
  usePostGhostAgent,
  usePutGhostAgent,
} from './useGhostAgents';
import {
  useGetGhostC2Server,
  useGetGhostC2Servers,
  useDeleteGhostC2Server,
  usePostGhostC2Server,
  usePutGhostC2Server,
  queryKeyGhostC2Servers,
} from './useGhostC2Servers';
import {
  useGetGhostClient,
  useGetGhostClients,
  useDeleteGhostClient,
  usePostGhostClient,
  usePutGhostClient,
  queryKeyGhostClients,
} from './useGhostClients';
import {
  useGetGhostTraffic,
  useGetGhostTrafficList,
  useDeleteGhostTraffic,
  usePostGhostTraffic,
  usePutGhostTraffic,
  queryKeyGhostTraffic,
} from './useGhostTraffic';
import {
  useGetGhostTrafficProfile,
  useGetGhostTrafficProfiles,
  useDeleteGhostTrafficProfile,
  usePostGhostTrafficProfile,
  usePutGhostTrafficProfile,
  queryKeyGhostTrafficProfiles,
} from './useGhostTrafficProfiles';
import {
  useGetInternetGateway,
  useGetInternetGateways,
  useDeleteInternetGateway,
  usePostInternetGateway,
  usePutInternetGateway,
  queryKeyInternetGateways,
} from './useInternetGateways';
import {
  queryKeyNetworkOverrides,
  useDeleteNetworkOverride,
  useGetNetworkOverride,
  useGetNetworkOverrides,
  usePostNetworkOverride,
  usePutNetworkOverride,
} from './useNetworkOverrides';
import {
  useGetPackage,
  useGetPackages,
  useDeletePackage,
  usePostPackage,
  usePutPackage,
  queryKeyPackages,
} from './usePackages';
import {
  useGetPcteNetspec,
  useGetPcteNetspecs,
  queryKeyPcteNetspecs,
} from './usePcteNetspecs';
import {
  useGetRancherEnvironmentCredential,
  useGetRancherEnvironmentCredentials,
  useDeleteRancherEnvironmentCredential,
  queryKeyRancherEnvironmentCreds,
} from './useRancherEnvironmentCredentials';
import {
  useGetRangeAutoIP,
  useGetRangeAutoIPs,
  useDeleteRangeAutoIP,
  usePostRangeAutoIP,
  usePutRangeAutoIP,
  queryKeyRangeAutoIPs,
} from './useRangeAutoIPs';
import {
  useGetRangeAutoL3Network,
  useDeleteRangeAutoL3Network,
  useGetRangeAutoL3Networks,
  usePostRangeAutoL3Network,
  usePutRangeAutoL3Network,
  queryKeyRangeAutoL3Networks,
} from './useRangeAutoL3Networks';
import {
  useGetRangeBgpLink,
  useGetRangeBgpLinks,
  useDeleteRangeBgpLink,
  queryKeyRangeBGPLinks,
} from './useRangeBgpLinks';
import {
  useGetRangeBgp,
  useGetRangeBgps,
  useDeleteRangeBgp,
  queryKeyRangeBGPs,
} from './useRangeBgps';
import {
  useGetRangeCert,
  useGetRangeCerts,
  useDeleteRangeCert,
  usePostRangeCert,
  usePutRangeCert,
  queryKeyRangeCerts,
} from './useRangeCerts';
import {
  useGetRangeConsole,
  useDeleteRangeConsole,
  useGetRangeConsoles,
  usePostRangeConsole,
  usePutRangeConsole,
  queryKeyRangeConsoles,
} from './useRangeConsoles';
import {
  useGetRangeDnsRecord,
  useDeleteRangeDnsRecord,
  useGetRangeDnsRecords,
  usePostRangeDnsRecord,
  usePutRangeDnsRecord,
} from './useRangeDnsRecords';
import {
  useGetRangeDnsServer,
  useGetRangeDnsServers,
  useDeleteRangeDnsServer,
  queryKeyRangeDnsServers,
} from './useRangeDnsServers';
import {
  useGetRangeDnsZone,
  useDeleteRangeDnsZone,
  useGetRangeDnsZones,
  usePostRangeDnsZone,
  usePutRangeDnsZone,
  queryKeyRangeDnsZones,
} from './useRangeDnsZones';
import {
  useGetRangeHostNetwork,
  useGetRangeHostNetworks,
  useDeleteRangeHostNetwork,
  usePostRangeHostNetwork,
  usePutRangeHostNetwork,
  queryKeyRangeHostNetworks,
} from './useRangeHostNetworks';
import {
  useGetRangeIP,
  useDeleteRangeIP,
  useGetRangeIPs,
  usePostRangeIP,
  usePutRangeIP,
  queryKeyRangeIPs,
} from './useRangeIPs';
import {
  useGetRangeL3Network,
  useDeleteRangeL3Network,
  useGetRangeL3Networks,
  usePostRangeL3Network,
  usePutRangeL3Network,
  queryKeyRangeL3Networks,
} from './useRangeL3Networks';
import {
  useGetRangeNetwork,
  useGetRangeNetworks,
  useDeleteRangeNetwork,
  queryKeyRangeNetworks,
} from './useRangeNetworks';
import {
  useGetRangePKI,
  useGetRangePKIs,
  useDeleteRangePKI,
  queryKeyRangePKIs,
} from './useRangePKIs';
import {
  useGetRangeResourceConsole,
  useGetRangeResourceConsoles,
} from './useRangeResourceConsoles';
import {
  useGetRangeResourceContainer,
  useGetRangeResourceContainers,
  queryKeyRangeResourceContainers,
} from './useRangeResourceContainers';
import { useGetRangeResourceGhostMachine } from './useRangeResourceGhostMachines';
import {
  useGetRangeResourceGhostTrafficProfile,
  useGetRangeResourceGhostTrafficProfiles,
  queryKeyRangeResourceGhostTrafficProfiles,
} from './useRangeResourceGhostTrafficProfiles';
import {
  useGetRangeResourcePackage,
  useGetRangeResourcePackages,
  queryKeyRangeResourcePackages,
} from './useRangeResourcePackages';
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
  queryKeyRangeResourceVMs,
  useGetRangeResourceVM,
  useGetRangeResourceVMs,
} from './useRangeResourceVMs';
import {
  useGetRangeRouter,
  useGetRangeRouters,
  useDeleteRangeRouter,
  queryKeyRangeRouters,
} from './useRangeRouters';
import {
  useGetRange,
  useDeleteRange,
  useGetRanges,
  usePostRange,
  usePutRange,
  queryKeyRanges,
} from './useRanges';
import {
  useGetRangeTorNet,
  useGetRangeTorNets,
  useDeleteRangeTorNet,
  queryKeyRangeTorNets,
} from './useRangeTorNets';
import {
  useGetRangeVmSpec,
  useDeleteRangeVmSpec,
  useGetRangeVmSpecs,
  usePostRangeVmSpec,
  usePutRangeVmSpec,
  queryKeyVmSpecs,
} from './useRangeVmSpecs';
import {
  useGetRangeVolume,
  useGetRangeVolumes,
  useDeleteRangeVolume,
  queryKeyRangeVolumes,
} from './useRangeVolumes';
import {
  useGetScenario,
  useGetScenarios,
  useDeleteScenario,
  usePostScenario,
  usePutScenario,
  queryKeyScenarios,
} from './useScenarios';
import { useGetSSOGroups, queryKeySSOGroups } from './useSSOGroups';
import { useGetSSOUsers, queryKeySSOUsers } from './useSSOUsers';
import {
  useGetTelemetryAgent,
  useGetTelemetryAgents,
  queryKeyTelemetryAgents,
} from './useTelemetryAgents';
import {
  queryKeyTrafficCaptures,
  useGetTrafficCapture,
  useGetTrafficCaptures,
} from './uesTrafficCaptures';
import {
  queryKeyTrafficTrackers,
  useDeleteTrafficTracker,
  useGetTrafficTracker,
  useGetTrafficTrackers,
  usePostTrafficTracker,
  usePutTrafficTracker,
} from './useTrafficTrackers';
import {
  useGetVmImage,
  useGetVmImages,
  useDeleteVmImage,
  queryKeyVmImages,
} from './useVmImages';
import {
  useGetVolume,
  useGetVolumes,
  useDeleteVolume,
  queryKeyVolumes,
} from './useVolumes';
import {
  useGetVsphereEnvironmentCredential,
  useGetVsphereEnvironmentCredentials,
  useDeleteVsphereEnvironmentCredential,
  queryKeyVsphereEnvironmentCreds,
} from './useVsphereEnvironmentCredentials';
import {
  useGetVsphereRangeSpec,
  useGetVsphereRangeSpecs,
  useDeleteVsphereRangeSpec,
  queryKeyVsphereRangeSpecs,
} from './useVsphereRangeSpecs';
import {
  queryKeyAutoGraders,
  useDeleteAutoGrader,
  useGetAutoGrader,
  useGetAutoGraders,
  usePostAutoGrader,
  usePutAutoGrader,
} from './useAutoGraders';
import {
  queryKeyCMI5AuMappings,
  useDeleteAUMapping,
  useGetAUMapping,
  useGetAuMappings,
  usePostAUMapping,
  usePutAUMapping,
} from './useCMI5AUMappings';
import {
  queryKeyRangeResourcePKIs,
  useGetRangeResourcePKI,
  useGetRangeResourcePKIs,
} from './useRangeResourcePKI';
import {
  queryKeyRangeResourceAnsiblePlaybooks,
  useGetRangeResourceAnsiblePlaybook,
  useGetRangeResourceAnsiblePlaybooks,
} from './useRangeResourceAnsiblePlaybooks';
import {
  queryKeyRangeResourceGhostC2Servers,
  useGetRangeResourceGhostC2Server,
  useGetRangeResourceGhostC2Servers,
} from './useRangeResourceGhostC2Servers';
import {
  queryKeyRangeResourceIPs,
  useGetRangeResourceIP,
  useGetRangeResourceIPs,
} from './useRangeResourceIPs';
import {
  queryKeyRangeResourceRouters,
  useGetRangeResourceRouter,
  useGetRangeResourceRouters,
} from './useRangeResourceRouters';
import {
  queryKeyRangeResourceCerts,
  useGetRangeResourceCertificate,
  useGetRangeResourceCertificates,
} from './useRangeResourceCertificates';
import {
  queryKeyRangeResourceDnsZones,
  useGetRangeResourceDnsZone,
  useGetRangeResourceDnsZones,
} from './useRangeResourceDnsZones';
import {
  queryKeyRangeResourceDnsRecords,
  useGetRangeResourceDnsRecord,
  useGetRangeResourceDnsRecords,
} from './useRangeResourceDnsRecords';
import {
  queryKeyRangeResourceAutoIPs,
  useGetRangeResourceAutoIP,
  useGetRangeResourceAutoIPs,
} from './useRangeResourceAutoIPs';
import {
  queryKeyRangeResourceL3Networks,
  useGetRangeResourceL3Network,
  useGetRangeResourceL3Networks,
} from './useRangeResourceL3Networks';
import {
  queryKeyRangeResourceNetworks,
  useGetRangeResourceNetwork,
  useGetRangeResourceNetworks,
} from './useRangeResourceNetworks';
import {
  queryKeyRangeResourceClusterNetworks,
  useGetRangeResourceClusterNetwork,
  useGetRangeResourceClusterNetworks,
} from './useRangeResourceClusterNetworks';
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
  [Topic.CPE]: {
    apiHook: useGetCPE,
    beTypeStr: 'CPE',
    listApiHook: useGetCPEs,
    deleteApiHook: useDeleteCPE,
    queryKey: queryKeyCPEs,
  },
  [Topic.Chart]: {
    apiHook: useGetChart,
    beTypeStr: 'Chart',
    listApiHook: useGetCharts,
    queryKey: queryKeyCharts,
  },
  [Topic.ChartSchema]: {
    apiHook: useGetChartVersionSchema,
    beTypeStr: undefined,
    listApiHook: null,
    queryKey: queryKeyChartVersions,
  },
  [Topic.File]: {
    apiHook: useGetVolume,
    beTypeStr: 'Volume',
    listApiHook: useGetVolumes,
    deleteApiHook: useDeleteVolume,
    queryKey: queryKeyVolumes,
  },
  [Topic.VMImage]: {
    apiHook: useGetVmImage,
    beTypeStr: 'VMImage',
    listApiHook: useGetVmImages,
    deleteApiHook: useDeleteVmImage,
    queryKey: queryKeyVmImages,
  },
  //#endregion

  //#region Infrastructure
  [Topic.RancherEnvironmentCred]: {
    apiHook: useGetRancherEnvironmentCredential,
    listApiHook: useGetRancherEnvironmentCredentials,
    deleteApiHook: useDeleteRancherEnvironmentCredential,
    queryKey: queryKeyRancherEnvironmentCreds,
  },
  [Topic.AwsEnvironmentCred]: {
    apiHook: useGetAwsEnvironmentCredential,
    listApiHook: useGetAwsEnvironmentCredentials,
    deleteApiHook: useDeleteAwsEnvironmentCredential,
    queryKey: queryKeyAwsEnvironmentCreds,
  },
  [Topic.VsphereEnvironmentCred]: {
    apiHook: useGetVsphereEnvironmentCredential,
    listApiHook: useGetVsphereEnvironmentCredentials,
    deleteApiHook: useDeleteVsphereEnvironmentCredential,
    queryKey: queryKeyVsphereEnvironmentCreds,
  },
  [Topic.EnvironmentSpec]: {
    apiHook: useGetEnvironmentSpec,
    listApiHook: useGetEnvironmentSpecs,
    deleteApiHook: useDeleteEnvironmentSpec,
    queryKey: queryKeyEnvironmentSpecs,
  },
  [Topic.AwsRangeSpec]: {
    apiHook: useGetAwsRangeSpec,
    listApiHook: useGetAwsRangeSpecs,
    deleteApiHook: useDeleteAwsRangeSpec,
    queryKey: queryKeyAwsRangeSpecs,
  },
  [Topic.VsphereRangeSpec]: {
    apiHook: useGetVsphereRangeSpec,
    listApiHook: useGetVsphereRangeSpecs,
    deleteApiHook: useDeleteVsphereRangeSpec,
    queryKey: queryKeyVsphereRangeSpecs,
  },
  //#endregion Infrastructure

  //#region Traffic
  [Topic.GhostAgent]: {
    apiHook: useGetGhostAgent,
    beTypeStr: 'GhostAgent',
    listApiHook: useGetGhostAgents,
    deleteApiHook: useDeleteGhostAgent,
    postApiHook: usePostGhostAgent,
    putApiHook: usePutGhostAgent,
    queryKey: queryKeyGhostAgents,
  },
  [Topic.GhostC2Server]: {
    apiHook: useGetGhostC2Server,
    beTypeStr: 'GhostC2Server',
    listApiHook: useGetGhostC2Servers,
    deleteApiHook: useDeleteGhostC2Server,
    postApiHook: usePostGhostC2Server,
    putApiHook: usePutGhostC2Server,
    queryKey: queryKeyGhostC2Servers,
  },
  [Topic.GhostClient]: {
    apiHook: useGetGhostClient,
    beTypeStr: 'GhostClient',
    listApiHook: useGetGhostClients,
    deleteApiHook: useDeleteGhostClient,
    postApiHook: usePostGhostClient,
    putApiHook: usePutGhostClient,
    queryKey: queryKeyGhostClients,
  },
  [Topic.GhostMachine]: {
    apiHook: null, // no individual ghost machine form
    listApiHook: useGetRangeResourceGhostMachine,
    queryKey: queryKeyGhostClients,
  },
  [Topic.GhostTraffic]: {
    apiHook: useGetGhostTraffic,
    beTypeStr: 'GhostTraffic',
    listApiHook: useGetGhostTrafficList,
    deleteApiHook: useDeleteGhostTraffic,
    postApiHook: usePostGhostTraffic,
    putApiHook: usePutGhostTraffic,
    queryKey: queryKeyGhostTraffic,
  },
  [Topic.GhostTrafficProfile]: {
    apiHook: useGetGhostTrafficProfile,
    beTypeStr: 'GhostTrafficProfile',
    listApiHook: useGetGhostTrafficProfiles,
    deleteApiHook: useDeleteGhostTrafficProfile,
    postApiHook: usePostGhostTrafficProfile,
    putApiHook: usePutGhostTrafficProfile,
    queryKey: queryKeyGhostTrafficProfiles,
  },
  [Topic.NetworkOverride]: {
    apiHook: useGetNetworkOverride,
    beTypeStr: 'unknown',
    listApiHook: useGetNetworkOverrides,
    deleteApiHook: useDeleteNetworkOverride,
    postApiHook: usePostNetworkOverride,
    putApiHook: usePutNetworkOverride,
    queryKey: queryKeyNetworkOverrides,
  },
  [Topic.TrafficCapture]: {
    apiHook: useGetTrafficCapture,
    beTypeStr: 'Unknown',
    listApiHook: useGetTrafficCaptures,
    //TODO deleteApiHook: useDeleteTrafficCapture,
    // postApiHook: usePostTrafficCaptures,
    // putApiHook: usePutTrafficCaptures,
    queryKey: queryKeyTrafficCaptures,
  },
  [Topic.TrafficTracker]: {
    apiHook: useGetTrafficTracker,
    beTypeStr: 'TrafficTracker',
    listApiHook: useGetTrafficTrackers,
    deleteApiHook: useDeleteTrafficTracker,
    postApiHook: usePostTrafficTracker,
    putApiHook: usePutTrafficTracker,
    queryKey: queryKeyTrafficTrackers,
  },
  //#endregion Traffic

  //#region Provisioning Services
  [Topic.AnsiblePlaybook]: {
    apiHook: useGetAnsiblePlaybook,
    beTypeStr: 'AnsiblePlaybook',
    listApiHook: useGetAnsiblePlaybooks,
    deleteApiHook: useDeleteAnsiblePlaybook,
    postApiHook: usePostAnsiblePlaybook,
    putApiHook: usePutAnsiblePlaybook,
    queryKey: queryKeyAnsiblePlaybooks,
  },
  [Topic.AnsibleRole]: {
    apiHook: useGetAnsibleRole,
    beTypeStr: 'AnsibleRole',
    listApiHook: useGetAnsibleRoles,
    deleteApiHook: useDeleteAnsibleRole,
    queryKey: queryKeyAnsibleRoles,
  },
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
  [Topic.AutoIP]: {
    apiHook: useGetRangeAutoIP,
    beTypeStr: 'RangeAutoIP',
    listApiHook: useGetRangeAutoIPs,
    deleteApiHook: useDeleteRangeAutoIP,
    postApiHook: usePostRangeAutoIP,
    putApiHook: usePutRangeAutoIP,
    queryKey: queryKeyRangeAutoIPs,
  },
  [Topic.AutoLayer3Network]: {
    apiHook: useGetRangeAutoL3Network,
    beTypeStr: 'RangeAutoL3Network',
    deleteApiHook: useDeleteRangeAutoL3Network,
    listApiHook: useGetRangeAutoL3Networks,
    postApiHook: usePostRangeAutoL3Network,
    putApiHook: usePutRangeAutoL3Network,
    queryKey: queryKeyRangeAutoL3Networks,
  },
  [Topic.BGP]: {
    apiHook: useGetRangeBgp,
    beTypeStr: 'RangeBGP',
    listApiHook: useGetRangeBgps,
    deleteApiHook: useDeleteRangeBgp,
    queryKey: queryKeyRangeBGPs,
  },
  [Topic.BgpLink]: {
    apiHook: useGetRangeBgpLink,
    beTypeStr: 'RangeBGPLink',
    listApiHook: useGetRangeBgpLinks,
    deleteApiHook: useDeleteRangeBgpLink,
    queryKey: queryKeyRangeBGPLinks,
  },
  [Topic.Certificate]: {
    apiHook: useGetRangeCert,
    beTypeStr: 'RangeCert',
    listApiHook: useGetRangeCerts,
    deleteApiHook: useDeleteRangeCert,
    postApiHook: usePostRangeCert,
    putApiHook: usePutRangeCert,
    queryKey: queryKeyRangeCerts,
  },
  [Topic.ClusterNetwork]: {
    apiHook: useGetClusterRangeNetwork,
    beTypeStr: 'ClusterRangeNetwork',
    listApiHook: useGetClusterRangeNetworks,
    deleteApiHook: useDeleteClusterRangeNetwork,
    queryKey: queryKeyClusterRangeNetworks,
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
  [Topic.DnsServer]: {
    apiHook: useGetRangeDnsServer,
    beTypeStr: 'RangeDNSServer',
    listApiHook: useGetRangeDnsServers,
    deleteApiHook: useDeleteRangeDnsServer,
    queryKey: queryKeyRangeDnsServers,
  },
  [Topic.DnsZone]: {
    apiHook: useGetRangeDnsZone,
    beTypeStr: 'RangeDNSZone',
    deleteApiHook: useDeleteRangeDnsZone,
    listApiHook: useGetRangeDnsZones,
    postApiHook: usePostRangeDnsZone,
    putApiHook: usePutRangeDnsZone,
    queryKey: queryKeyRangeDnsZones,
  },
  [Topic.DnsRecord]: {
    apiHook: useGetRangeDnsRecord,
    beTypeStr: 'RangeDNSRecord',
    deleteApiHook: useDeleteRangeDnsRecord,
    listApiHook: useGetRangeDnsRecords,
    postApiHook: usePostRangeDnsRecord,
    putApiHook: usePutRangeDnsRecord,
    queryKey: 'range-dns-records',
  },
  [Topic.HostNetwork]: {
    apiHook: useGetRangeHostNetwork,
    beTypeStr: 'RangeHostNetwork',
    listApiHook: useGetRangeHostNetworks,
    deleteApiHook: useDeleteRangeHostNetwork,
    postApiHook: usePostRangeHostNetwork,
    putApiHook: usePutRangeHostNetwork,
    queryKey: queryKeyRangeHostNetworks,
  },
  [Topic.InternetGateway]: {
    apiHook: useGetInternetGateway,
    beTypeStr: 'InternetGateway',
    listApiHook: useGetInternetGateways,
    deleteApiHook: useDeleteInternetGateway,
    postApiHook: usePostInternetGateway,
    putApiHook: usePutInternetGateway,
    queryKey: queryKeyInternetGateways,
  },
  [Topic.IP]: {
    apiHook: useGetRangeIP,
    beTypeStr: 'RangeIP',
    deleteApiHook: useDeleteRangeIP,
    listApiHook: useGetRangeIPs,
    postApiHook: usePostRangeIP,
    putApiHook: usePutRangeIP,
    queryKey: queryKeyRangeIPs,
  },
  [Topic.KSAT]: {
    apiHook: null,
    listApiHook: useGetKSATs,
    queryKey: queryKeyKSATs,
  },
  [Topic.Layer3Network]: {
    apiHook: useGetRangeL3Network,
    beTypeStr: 'RangeL3Network',
    deleteApiHook: useDeleteRangeL3Network,
    listApiHook: useGetRangeL3Networks,
    postApiHook: usePostRangeL3Network,
    putApiHook: usePutRangeL3Network,
    queryKey: queryKeyRangeL3Networks,
  },
  [Topic.Network]: {
    apiHook: useGetRangeNetwork,
    beTypeStr: 'RangeNetwork',
    listApiHook: useGetRangeNetworks,
    deleteApiHook: useDeleteRangeNetwork,
    queryKey: queryKeyRangeNetworks,
  },
  [Topic.Package]: {
    apiHook: useGetPackage,
    beTypeStr: 'Package',
    listApiHook: useGetPackages,
    deleteApiHook: useDeletePackage,
    postApiHook: usePostPackage,
    putApiHook: usePutPackage,
    queryKey: queryKeyPackages,
  },
  [Topic.PCTENetspec]: {
    apiHook: useGetPcteNetspec,
    beTypeStr: 'Unknown',
    listApiHook: useGetPcteNetspecs,
    queryKey: queryKeyPcteNetspecs,
  },
  [Topic.PKI]: {
    apiHook: useGetRangePKI,
    beTypeStr: 'RangePki',
    listApiHook: useGetRangePKIs,
    deleteApiHook: useDeleteRangePKI,
    queryKey: queryKeyRangePKIs,
  },
  [Topic.Router]: {
    apiHook: useGetRangeRouter,
    beTypeStr: 'RangeRouter',
    listApiHook: useGetRangeRouters,
    deleteApiHook: useDeleteRangeRouter,
    queryKey: queryKeyRangeRouters,
  },
  [Topic.Scenario]: {
    apiHook: useGetScenario,
    beTypeStr: 'Scenario',
    listApiHook: useGetScenarios,
    deleteApiHook: useDeleteScenario,
    postApiHook: usePostScenario,
    putApiHook: usePutScenario,
    queryKey: queryKeyScenarios,
  },
  [Topic.TelemetryAgent]: {
    apiHook: useGetTelemetryAgent,
    beTypeStr: 'TelemetryAgent',
    listApiHook: useGetTelemetryAgents,
    queryKey: queryKeyTelemetryAgents,
  },
  [Topic.TorNetwork]: {
    apiHook: useGetRangeTorNet,
    beTypeStr: 'RangeTorNet',
    listApiHook: useGetRangeTorNets,
    deleteApiHook: useDeleteRangeTorNet,
    queryKey: queryKeyRangeTorNets,
  },
  [Topic.VMSpec]: {
    apiHook: useGetRangeVmSpec,
    beTypeStr: 'VMSpecification',
    deleteApiHook: useDeleteRangeVmSpec,
    listApiHook: useGetRangeVmSpecs,
    postApiHook: usePostRangeVmSpec,
    putApiHook: usePutRangeVmSpec,
    queryKey: queryKeyVmSpecs,
  },
  [Topic.Volume]: {
    apiHook: useGetRangeVolume,
    beTypeStr: 'RangeVolume',
    listApiHook: useGetRangeVolumes,
    deleteApiHook: useDeleteRangeVolume,
    queryKey: queryKeyRangeVolumes,
  },
  [Topic.DPVolume]: {
    apiHook: useGetRangeVolume,
    beTypeStr: 'RangeVolume',
    listApiHook: useGetRangeVolumes,
    queryKey: queryKeyRangeVolumes,
  },
  //#endregion Range Content

  //#region Resources
  [Topic.ResourceAnsiblePlaybook]: {
    apiHook: useGetRangeResourceAnsiblePlaybook,
    listApiHook: useGetRangeResourceAnsiblePlaybooks,
    queryKey: queryKeyRangeResourceAnsiblePlaybooks,
  },
  [Topic.ResourceCertificate]: {
    apiHook: useGetRangeResourceCertificate,
    listApiHook: useGetRangeResourceCertificates,
    queryKey: queryKeyRangeResourceCerts,
  },
  [Topic.ResourceClusterNetwork]: {
    apiHook: useGetRangeResourceClusterNetwork,
    listApiHook: useGetRangeResourceClusterNetworks,
    queryKey: queryKeyRangeResourceClusterNetworks,
  },
  [Topic.ResourceContainer]: {
    apiHook: useGetRangeResourceContainer,
    listApiHook: useGetRangeResourceContainers,
    queryKey: queryKeyRangeResourceContainers,
  },
  [Topic.ResourceConsole]: {
    apiHook: useGetRangeResourceConsole,
    listApiHook: useGetRangeResourceConsoles,
    queryKey: queryKeyRangeResourceVMs,
  },
  [Topic.ResourceDnsRecord]: {
    apiHook: useGetRangeResourceDnsRecord,
    listApiHook: useGetRangeResourceDnsRecords,
    queryKey: queryKeyRangeResourceDnsRecords,
  },
  [Topic.ResourceDnsZone]: {
    apiHook: useGetRangeResourceDnsZone,
    listApiHook: useGetRangeResourceDnsZones,
    queryKey: queryKeyRangeResourceDnsZones,
  },
  [Topic.ResourceGhostC2Server]: {
    apiHook: useGetRangeResourceGhostC2Server,
    listApiHook: useGetRangeResourceGhostC2Servers,
    queryKey: queryKeyRangeResourceGhostC2Servers,
  },
  [Topic.ResourceGhostTrafficProfile]: {
    apiHook: useGetRangeResourceGhostTrafficProfile,
    listApiHook: useGetRangeResourceGhostTrafficProfiles,
    queryKey: queryKeyRangeResourceGhostTrafficProfiles,
  },
  [Topic.ResourceAutoIP]: {
    apiHook: useGetRangeResourceAutoIP,
    listApiHook: useGetRangeResourceAutoIPs,
    queryKey: queryKeyRangeResourceAutoIPs,
  },
  [Topic.ResourceIP]: {
    apiHook: useGetRangeResourceIP,
    listApiHook: useGetRangeResourceIPs,
    queryKey: queryKeyRangeResourceIPs,
  },
  [Topic.ResourceLayer3Network]: {
    apiHook: useGetRangeResourceL3Network,
    listApiHook: useGetRangeResourceL3Networks,
    queryKey: queryKeyRangeResourceL3Networks,
  },
  [Topic.ResourceNetwork]: {
    apiHook: useGetRangeResourceNetwork,
    listApiHook: useGetRangeResourceNetworks,
    queryKey: queryKeyRangeResourceNetworks,
  },
  [Topic.ResourcePackage]: {
    apiHook: useGetRangeResourcePackage,
    listApiHook: useGetRangeResourcePackages,
    queryKey: queryKeyRangeResourcePackages,
  },
  [Topic.ResourcePKI]: {
    apiHook: useGetRangeResourcePKI,
    listApiHook: useGetRangeResourcePKIs,
    queryKey: queryKeyRangeResourcePKIs,
  },
  [Topic.ResourceRouter]: {
    apiHook: useGetRangeResourceRouter,
    listApiHook: useGetRangeResourceRouters,
    queryKey: queryKeyRangeResourceRouters,
  },
  [Topic.ResourceScenario]: {
    apiHook: useGetRangeResourceScenario,
    listApiHook: useGetRangeResourceScenarios,
    overrideApiHook: useGetRangeResourceScenarioOverrides,
    queryKey: queryKeyRangeResourceScenarios,
  },
  [Topic.ResourceVM]: {
    apiHook: useGetRangeResourceVM,
    listApiHook: useGetRangeResourceVMs,
    queryKey: queryKeyRangeResourceVMs,
  },
  [Topic.ResourceScenarioPermissions]: {
    apiHook: null,
    listApiHook: useGetRangeResourceScenarioPermissions,
    queryKey: queryKeyRangeResourceScenarioPermissions,
  },

  [Topic.Range]: {
    apiHook: useGetRange,
    deleteApiHook: useDeleteRange,
    listApiHook: useGetRanges,
    postApiHook: usePostRange,
    putApiHook: usePutRange,
    queryKey: queryKeyRanges,
  },
  //#endregion Resources

  //#region Design
  [Topic.Blueprint]: {
    apiHook: null,
    listApiHook: null,
    queryKey: 'none',
  },
  [Topic.Draft]: {
    apiHook: useGetDraft,
    deleteApiHook: useDeleteDraft,
    listApiHook: useGetDrafts,
    postApiHook: usePostDraft,
    putApiHook: usePutDraft,
    queryKey: queryKeyDrafts,
  },
  [Topic.DraftState]: {
    apiHook: useGetDraftState,
    deleteApiHook: useDeleteDraftState,
    listApiHook: useGetDraftStates,
    postApiHook: usePostDraftState,
    queryKey: queryKeyDraftStates,
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
  [Topic.CMI5AuMapping]: {
    apiHook: useGetAUMapping,
    listApiHook: useGetAuMappings,
    deleteApiHook: useDeleteAUMapping,
    postApiHook: usePostAUMapping,
    putApiHook: usePutAUMapping,
    queryKey: queryKeyCMI5AuMappings,
  },
  [Topic.CMI5Registration]: {
    apiHook: null,
    listApiHook: null,
    queryKey: queryKeyCMI5CourseRegistrations,
  },
  [Topic.CMI5Scenario]: {
    apiHook: null,
    listApiHook: useGetCMI5Scenarios,
    queryKey: queryKeyCMI5Scenarios,
    deleteApiHook: useDeleteRangeResourceScenario, // although we fetch
  },
  //#endregion CMI5

  //#region KeyCloak
  [Topic.SSOGroup]: {
    apiHook: null,
    listApiHook: useGetSSOGroups,
    queryKey: queryKeySSOGroups,
  },
  [Topic.SSOUser]: {
    apiHook: null,
    listApiHook: useGetSSOUsers,
    queryKey: queryKeySSOUsers,
  },
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
