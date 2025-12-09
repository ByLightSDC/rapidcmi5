/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from '@rangeos-nx/frontend/environment';
import {
  // APIs
  AssetsChartsApiFactory,
  AssetsContainersApiFactory,
  AssetsCPEApiFactory,
  AssetsVolumesApiFactory,
  AssetsVMImagesApiFactory,
  BackgroundJobsApiFactory,
  Cmi5AUMappingApiFactory,
  Cmi5RegistrationApiFactory,
  Cmi5ScenariosApiFactory,
  CountryCodesApiFactory,
  DesignDraftsApiFactory,
  KeycloakApiFactory,
  RangeContentGhostAgentsApiFactory,
  RangeContentGhostC2ServersApiFactory,
  RangeContentGhostClientsApiFactory,
  RangeContentGhostTrafficApiFactory,
  RangeContentGhostTrafficProfileApiFactory,
  InfrastructureContentEnvironmentAWSCredentialsApiFactory,
  InfrastructureContentEnvironmentAWSSpecificationsApiFactory,
  InfrastructureContentEnvironmentRancherCredentialsApiFactory,
  InfrastructureContentEnvironmentVsphereCredentialsApiFactory,
  InfrastructureContentRangeAWSSpecificationsApiFactory,
  InfrastructureContentRangeVsphereSpecificationsApiFactory,
  LTICourseMappingApiFactory,
  ManageInfrastructureResourcesNodesApiFactory,
  ManageRangeResourcesClusterRangeNetworksApiFactory,
  ManageRangeResourcesNodesApiFactory,
  ManageRangeResourcesRangeBGPsApiFactory,
  ManageRangeResourcesRangeConsolesApiFactory,
  ManageRangeResourcesPackagesApiFactory,
  ManageRangeResourcesRangePKIsApiFactory,
  ManageRangeResourcesRangeRoutersApiFactory,
  ManageRangeResourcesScenariosApiFactory,
  ManageRangeResourcesScenarioPermissionsApiFactory,
  ManageInfrastructureResourcesEnvironmentAWSApiFactory,
  ManageInfrastructureResourcesRangesApiFactory,
  ManageRangeResourcesRangeCertificatesApiFactory,
  ManageRangeResourcesRangeContainersApiFactory,
  ManageRangeResourcesRangeDNSRecordsApiFactory,
  ManageRangeResourcesRangeDNSServersApiFactory,
  ManageRangeResourcesRangeDNSZonesApiFactory,
  ManageRangeResourcesGhostAgentsApiFactory,
  ManageRangeResourcesGhostC2ServersApiFactory,
  ManageRangeResourcesGhostClientsApiFactory,
  ManageRangeResourcesGhostMachinesApiFactory,
  ManageRangeResourcesGhostTrafficProfilesApiFactory,
  ManageRangeResourcesHardwareDevicesApiFactory,
  ManageRangeResourcesRangeHostNetworksApiFactory,
  ManageRangeResourcesInternetGatewaysApiFactory,
  ManageRangeResourcesRangeIPsApiFactory,
  ManageRangeResourcesRangeAutoL3NetworksApiFactory,
  ManageRangeResourcesRangeL3NetworksApiFactory,
  ManageRangeResourcesRangeNetworksApiFactory,
  ManageRangeResourcesRangeTelemetryAgentsApiFactory,
  ManageRangeResourcesRangeAutoGradersApiFactory,
  ManageRangeResourcesRangeTorNetsApiFactory,
  ManageRangeResourcesRangeTrafficTrackersApiFactory,
  ManageRangeResourcesRangeVMsApiFactory,
  ManageRangeResourcesRangeVolumesApiFactory,
  ManageRangeResourcesVirtualMachineSnapshotsApiFactory,
  ProvisioningServiceAnsiblePlaybooksApiFactory,
  ProvisioningServiceAnsibleRolesApiFactory,
  RangeContentAutoGradersApiFactory,
  RangeContentRangeAutoIPsApiFactory,
  RangeContentRangeConsolesApiFactory,
  RangeContentNetworkOverrideApiFactory,
  RangeContentPackagesApiFactory,
  RangeContentRangeBGPsApiFactory,
  RangeContentRangeBGPLinksApiFactory,
  RangeContentRangeCertificatesApiFactory,
  RangeContentRangeDNSRecordsApiFactory,
  RangeContentRangeDNSServersApiFactory,
  RangeContentRangeDNSZonesApiFactory,
  RangeContentClusterRangeNetworksApiFactory,
  RangeContentInternetGatewaysApiFactory,
  RangeContentRangeHostNetworksApiFactory,
  RangeContentRangeNetworksApiFactory,
  RangeContentRangeAutoL3NetworksApiFactory,
  RangeContentRangeL3NetworksApiFactory,
  RangeContentRangeIPsApiFactory,
  RangeContentRangePKIsApiFactory,
  RangeContentRangeRoutersApiFactory,
  RangeContentRangeTorNetsApiFactory,
  RangeContentRangeVolumesApiFactory,
  RangeContentScenariosApiFactory,
  RangeContentContainerSpecificationsApiFactory,
  RangeContentTelemetryAgentsApiFactory,
  RangeContentTrafficTrackersApiFactory,
  RangeContentVMSpecificationsApiFactory,
  ManageRangeResourcesRangeBGPLinksApiFactory,
  ManageRangeResourcesRangeAutoIPsApiFactory,
  RangeContentPCTEStandardNetspecApiFactory,
  ManageRangeResourcesVirtualMachineRestoresApiFactory,
  ManageRangeResourcesAnsiblePlaybookApiFactory,
  ManageRangeResourcesRangeVMExportsApiFactory,
  BootDetailsCreate,
  VersionApiFactory,
  ChartIconTypeEnum,
  Cmi5BuildApiFactory,
} from './lib';
import type { ScenarioGroup } from './lib';

//#endregion

export let DEVOPS_API_URL = config.DEVOPS_API_URL || 'http://localhost:8080';

export const initializeDevOpsApiClient = (apiUrl?: string) => {
  if (apiUrl) {
    DEVOPS_API_URL = apiUrl;
  }

  //Assets
  const ContainersApi = AssetsContainersApiFactory(undefined, DEVOPS_API_URL);
  const CountryCodesApi = CountryCodesApiFactory(undefined, DEVOPS_API_URL);
  const ChartsApi = AssetsChartsApiFactory(undefined, DEVOPS_API_URL);
  const CpeApi = AssetsCPEApiFactory(undefined, DEVOPS_API_URL);
  const VMImagesApi = AssetsVMImagesApiFactory(undefined, DEVOPS_API_URL);
  const VolumesApi = AssetsVolumesApiFactory(undefined, DEVOPS_API_URL);

  //#region Infra
  const AwsEnvironmentCredentialApi =
    InfrastructureContentEnvironmentAWSCredentialsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const RancherEnvironmentCredentialApi =
    InfrastructureContentEnvironmentRancherCredentialsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const VsphereEnvironmentCredentialApi =
    InfrastructureContentEnvironmentVsphereCredentialsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const EnvironmentSpecificationApi =
    InfrastructureContentEnvironmentAWSSpecificationsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );

  const AwsRangeSpecificationApi =
    InfrastructureContentRangeAWSSpecificationsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const VsphereRangeSpecificationApi =
    InfrastructureContentRangeVsphereSpecificationsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );

  //#endregion

  //#region Keycloak

  const KeyCloakApi = KeycloakApiFactory(undefined, DEVOPS_API_URL);
  //#endregion

  //#region Deployed Infra Resources
  const EnvironmentApi = ManageInfrastructureResourcesEnvironmentAWSApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const NodesApi = ManageInfrastructureResourcesNodesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeApi = ManageInfrastructureResourcesRangesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  //#endregion

  //#region Deployed Resources
  const RangeResourceAnsiblePlaybooksApi =
    ManageRangeResourcesAnsiblePlaybookApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceBGPApi = ManageRangeResourcesRangeBGPsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceBGPLinkApi = ManageRangeResourcesRangeBGPLinksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceCertificateApi =
    ManageRangeResourcesRangeCertificatesApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceClusterNetworkApi =
    ManageRangeResourcesClusterRangeNetworksApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const RangeResourceContainerApi =
    ManageRangeResourcesRangeContainersApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceConsolesApi = ManageRangeResourcesRangeConsolesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceDnsRecordsApi =
    ManageRangeResourcesRangeDNSRecordsApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceDnsServersApi =
    ManageRangeResourcesRangeDNSServersApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceDnsZonesApi = ManageRangeResourcesRangeDNSZonesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceGhostAgentsApi = ManageRangeResourcesGhostAgentsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceGhostC2ServersApi =
    ManageRangeResourcesGhostC2ServersApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceGhostClientsApi =
    ManageRangeResourcesGhostClientsApiFactory(undefined, DEVOPS_API_URL);

  const RangeResourceGhostMachinesApi =
    ManageRangeResourcesGhostMachinesApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceGhostTrafficProfilesApi =
    ManageRangeResourcesGhostTrafficProfilesApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const RangeResourceInternetGatewaysApi =
    ManageRangeResourcesInternetGatewaysApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceHardwareDevicesApi =
    ManageRangeResourcesHardwareDevicesApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceHostNetworksApi =
    ManageRangeResourcesRangeHostNetworksApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceAutoIPsApi = ManageRangeResourcesRangeAutoIPsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceIPsApi = ManageRangeResourcesRangeIPsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceAutoL3NetworksApi =
    ManageRangeResourcesRangeAutoL3NetworksApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const RangeResourceL3NetworksApi =
    ManageRangeResourcesRangeL3NetworksApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceNetworksApi = ManageRangeResourcesRangeNetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeResourceNodesApi = ManageRangeResourcesNodesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeResourcePackagesApi = ManageRangeResourcesPackagesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourcePKIsApi = ManageRangeResourcesRangePKIsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceRoutersApi = ManageRangeResourcesRangeRoutersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceScenariosApi = ManageRangeResourcesScenariosApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceScenarioPermissionsApi =
    ManageRangeResourcesScenarioPermissionsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );

  const RangeResourceAutoGradersApi =
    ManageRangeResourcesRangeAutoGradersApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceTelemetryAgentsApi =
    ManageRangeResourcesRangeTelemetryAgentsApiFactory(
      undefined,
      DEVOPS_API_URL,
    );
  const RangeResourceTorNetworksApi =
    ManageRangeResourcesRangeTorNetsApiFactory(undefined, DEVOPS_API_URL);
  const RangeResourceTrafficTrackersApi =
    ManageRangeResourcesRangeTrafficTrackersApiFactory(
      undefined,
      DEVOPS_API_URL,
    );

  const RangeResourceVMsApi = ManageRangeResourcesRangeVMsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeResourceVolumesApi = ManageRangeResourcesRangeVolumesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const VmExportsApi = ManageRangeResourcesRangeVMExportsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const VmRestoresApi = ManageRangeResourcesVirtualMachineRestoresApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const VmSnapshotsApi = ManageRangeResourcesVirtualMachineSnapshotsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  //#endregion

  //#region Design

  const DesignDraftsApi = DesignDraftsApiFactory(undefined, DEVOPS_API_URL);
  //#endregion

  //#region Traffic
  const GhostAgentsApi = RangeContentGhostAgentsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const GhostC2ServersApi = RangeContentGhostC2ServersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const GhostClientsApi = RangeContentGhostClientsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const GhostTrafficApi = RangeContentGhostTrafficApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const GhostTrafficProfilesApi = RangeContentGhostTrafficProfileApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  //#endregion

  //#region RangeContent
  const AutoGradersApi = RangeContentAutoGradersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const NetworkOverridesApi = RangeContentNetworkOverrideApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const PackagesApi = RangeContentPackagesApiFactory(undefined, DEVOPS_API_URL);

  const PcteNetwpctApi = RangeContentPCTEStandardNetspecApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeBGPApi = RangeContentRangeBGPsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeBGPLinkApi = RangeContentRangeBGPLinksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeCertificatesApi = RangeContentRangeCertificatesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const ClusterRangeNetworksApi = RangeContentClusterRangeNetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const InternetGatewaysApi = RangeContentInternetGatewaysApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeHostNetworkApi = RangeContentRangeHostNetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeNetworksApi = RangeContentRangeNetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeAutoL3NetworksApi = RangeContentRangeAutoL3NetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeL3NetworksApi = RangeContentRangeL3NetworksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeContentConsolesApi = RangeContentRangeConsolesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeContentTorNetsApi = RangeContentRangeTorNetsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeContentRangeDNSRecordApi = RangeContentRangeDNSRecordsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeContentRangeDNSServersApi = RangeContentRangeDNSServersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeContentRangeDNSZonesApi = RangeContentRangeDNSZonesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeAutoIPsApi = RangeContentRangeAutoIPsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeIPsApi = RangeContentRangeIPsApiFactory(undefined, DEVOPS_API_URL);

  const RangePKIsApi = RangeContentRangePKIsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );

  const RangeRoutesApi = RangeContentRangeRoutersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeVolumesApi = RangeContentRangeVolumesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const RangeVmSpecsApi = RangeContentVMSpecificationsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const ScenariosApi = RangeContentScenariosApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const TelemetryAgentsApi = RangeContentTelemetryAgentsApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const TrafficTrackersApi = RangeContentTrafficTrackersApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const ContainerSpecificationsApi =
    RangeContentContainerSpecificationsApiFactory(undefined, DEVOPS_API_URL);
  //#endregion

  //#region Provisioning Services
  const AnsiblePlaybookApi = ProvisioningServiceAnsiblePlaybooksApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const AnsibleRoleApi = ProvisioningServiceAnsibleRolesApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  //#endregion

  //#region Background Jobs
  const BackgroundJobsApi = BackgroundJobsApiFactory(undefined, DEVOPS_API_URL);
  //#endregion

  //#region Build Version
  const BuildVersionApi = VersionApiFactory(undefined, DEVOPS_API_URL);
  //#endregion

  //#region Assessments
  const Cmi5AUMappingApi = Cmi5AUMappingApiFactory(undefined, DEVOPS_API_URL);
  const Cmi5RegistrationApi = Cmi5RegistrationApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  const Cmi5BuildApi = Cmi5BuildApiFactory(undefined, DEVOPS_API_URL);
  const Cmi5ScenariosApi = Cmi5ScenariosApiFactory(undefined, DEVOPS_API_URL);
  const LtiCourseMappingApi = LTICourseMappingApiFactory(
    undefined,
    DEVOPS_API_URL,
  );
  //#endregion

  return {
    ...AutoGradersApi,
    ...AwsEnvironmentCredentialApi,
    ...AwsRangeSpecificationApi,
    ...BackgroundJobsApi,
    ...BuildVersionApi,
    ...Cmi5BuildApi,
    ...Cmi5AUMappingApi,
    ...Cmi5RegistrationApi,
    ...Cmi5ScenariosApi,
    ...ContainersApi,
    ...CountryCodesApi,
    ...CpeApi,
    ...DesignDraftsApi,
    ...EnvironmentApi,
    ...EnvironmentSpecificationApi,
    ...ChartsApi,
    ...GhostAgentsApi,
    ...GhostC2ServersApi,
    ...GhostClientsApi,
    ...GhostTrafficApi,
    ...GhostTrafficProfilesApi,
    ...KeyCloakApi,
    ...LtiCourseMappingApi,
    ...AnsiblePlaybookApi,
    ...AnsibleRoleApi,
    ...NodesApi,
    ...RancherEnvironmentCredentialApi,
    ...RangeResourceAnsiblePlaybooksApi,
    ...RangeResourceBGPApi,
    ...RangeResourceBGPLinkApi,
    ...RangeResourceCertificateApi,
    ...RangeResourceClusterNetworkApi,
    ...RangeResourceConsolesApi,
    ...RangeResourceContainerApi,
    ...RangeResourceDnsRecordsApi,
    ...RangeResourceDnsServersApi,
    ...RangeResourceDnsZonesApi,
    ...RangeResourceGhostAgentsApi,
    ...RangeResourceGhostC2ServersApi,
    ...RangeResourceGhostClientsApi,
    ...RangeResourceGhostMachinesApi,
    ...RangeResourceGhostTrafficProfilesApi,
    ...RangeResourceInternetGatewaysApi,
    ...RangeResourceHardwareDevicesApi,
    ...RangeResourceHostNetworksApi,
    ...RangeResourceAutoIPsApi,
    ...RangeResourceIPsApi,
    ...RangeResourceNodesApi,
    ...RangeResourcePackagesApi,
    ...RangeResourcePKIsApi,
    ...RangeResourceRoutersApi,
    ...RangeResourceScenariosApi,
    ...RangeResourceScenarioPermissionsApi,
    ...RangeResourceAutoL3NetworksApi,
    ...RangeResourceL3NetworksApi,
    ...RangeResourceNetworksApi,
    ...RangeResourceTelemetryAgentsApi,
    ...RangeResourceAutoGradersApi,
    ...RangeResourceTorNetworksApi,
    ...RangeResourceTrafficTrackersApi,
    ...RangeResourceVMsApi,
    ...RangeResourceVolumesApi,
    ...NetworkOverridesApi,
    ...PackagesApi,
    ...PcteNetwpctApi,
    ...RangeApi,
    ...RangeBGPApi,
    ...RangeBGPLinkApi,
    ...RangeCertificatesApi,
    ...ContainerSpecificationsApi,
    ...RangeContentConsolesApi,
    ...RangeContentRangeDNSRecordApi,
    ...RangeContentRangeDNSServersApi,
    ...RangeContentRangeDNSZonesApi,
    ...RangeContentTorNetsApi,
    ...RangeAutoIPsApi,
    ...RangeIPsApi,
    ...ClusterRangeNetworksApi,
    ...InternetGatewaysApi,
    ...RangeHostNetworkApi,
    ...RangeNetworksApi,
    ...RangeAutoL3NetworksApi,
    ...RangeL3NetworksApi,
    ...RangePKIsApi,
    ...RangeRoutesApi,
    ...RangeVmSpecsApi,
    ...RangeVolumesApi,
    ...ScenariosApi,
    ...TelemetryAgentsApi,
    ...TrafficTrackersApi,
    ...VMImagesApi,
    ...VmExportsApi,
    ...VmRestoresApi,
    ...VmSnapshotsApi,
    ...VsphereEnvironmentCredentialApi,
    ...VsphereRangeSpecificationApi,
    ...VolumesApi,
  };
};
export let DevopsApiClient = initializeDevOpsApiClient();
export const overrideDevOpsApiClient = (apiUrl?: string) => {
  console.log('initializeDevOpsApiClient', apiUrl);
  DevopsApiClient = initializeDevOpsApiClient(apiUrl);
};

// export the api types for items which do NOT have an autogenerated type
export type tChartCreate = {
  cpe: string;
  file: any;
  iconType: ChartIconTypeEnum;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
};

export type tContainerCreate = {
  name: string;
  tag: string;
  file: string;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
};

export type tCountryCodes = {
  country: string;
  alpha2: string;
  alpha3: string;
  numeric: string;
};

export type tAnsibleRoleCreate = {
  name: string;
  file: any;
  systemCpeUuids: string[];
  description?: string;
  metadata?: any;
  roleVariablesSchema?: any;
  scenarioGroups?: ScenarioGroup[];
};

export type tKeycloakUser = {
  id?: string;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  disableableCredentialTypes?: [];
  requiredActions?: [];
  notBefore?: number;
  access?: {
    manageGroupMembership?: boolean;
    view?: boolean;
    mapRoles?: boolean;
    impersonate?: boolean;
    manage?: boolean;
  };
};

export type tVmImageCreate = {
  name: string;
  file: any;
  description?: string;
  metadata?: any;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  signal?: AbortSignal;
  filename?: string;
  bootDetails?: BootDetailsCreate;
};

export type tVolumeCreate = {
  name: string;
  description?: string;
  volumeType: string;
  file: any;
  metadata?: any;
  //currently present in BE, but per @AT should not be modified by UI
  //publicUrl?: string;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
};

export type tWebScrapeCreate = {
  environment: {
    KASM_PROTOCOL?: string;
    KASM_HOSTNAME?: string;
    KASM_PORT?: string;
    SCRAPE_URL?: string;
    SCRAPE_RECURSIVE_DEPTH?: string;
  };
};

export type tWebScrape = {
  //REF
  // kasm_id: string;
  // status: string;
  // user_id: string;
  // username: string;
  // session_token: string;
  // kasm_url: string;
  name: string;
  created: string;
  size: string;
};

//Enum
export enum NoneOptionEnum {
  None = 'none',
}

// re-export any interfaces from ./lb as a type

//Types & Interfaces
export type {
  BackgroundJob,
  BackgroundJobHistory,
  BootImageCreate,
  BuildVersionInfo,
  Chart,
  ChartVersion,
  CloudInitConfig,
  ClusterRangeNetwork,
  ClusterRangeNetworkCreate,
  ClusterRangeNetworkUpdate,
  Cmi5AuMappingCreate,
  Cmi5AuMappingUpdate,
  Cmi5AUMapping,
  AutoGraderCreate,
  AutoGraderUpdate,
  AutoGrader,
  Cmi5Registration,
  Container,
  ContainerInterface,
  ContainerSpecification,
  ContainerSpecificationCreate,
  ContainerSpecificationUpdate,
  ContainerSpecificationOverride,
  CourseMappingCreate,
  CourseMappingUpdate,
  CourseMapping,
  CPE,
  CpeCreate,
  CpeUpdate,
  DeployedAnsiblePlaybook,
  DeployedClusterRangeNetwork,
  DeployedGhostAgent,
  DeployedGhostC2Server,
  DeployedGhostClient,
  DeployedGhostTrafficProfile,
  DeployedInternetGateway,
  DeployedPackageDetail,
  DeployedRangeBGP,
  DeployedRangeBGPLink,
  DeployedRangeCert,
  DeployedRangeConsole,
  DeployedRangeDNSRecord,
  DeployedRangeDNSServer,
  DeployedRangeDNSZone,
  DeployedRangeHostNetwork,
  DeployedRangeAutoL3Network,
  DeployedRangeL3Network,
  DeployedRangeNetwork,
  DeployedRangeAutoIP,
  DeployedRangeIP,
  DeployedRangePki,
  DeployedRangeRouter,
  DeployedScenario,
  DeployedScenarioPermission,
  DeployedRangeTorNet,
  DeployedRangeVolume,
  DeployedScenarioDetail,
  DeployedTelemetryAgent,
  DeployedTrafficTracker,
  Draft,
  DraftCreate,
  DraftUpdate,
  DraftState,
  DraftStateCreate,
  EnvironmentAws,
  EnvironmentAwsCreate,
  EnvironmentAwsUpdate,
  EnvironmentAwsRegion,
  EnvironmentCredentialAws,
  EnvironmentCredentialAwsCreate,
  EnvironmentCredentialAwsUpdate,
  EnvironmentCredentialRancher,
  EnvironmentCredentialRancherCreate,
  EnvironmentCredentialRancherUpdate,
  EnvironmentCredentialVsphere,
  EnvironmentCredentialVsphereCreate,
  EnvironmentCredentialVsphereUpdate,
  EnvironmentSpecificationAws,
  EnvironmentSpecificationAwsCreate,
  EnvironmentSpecificationAwsUpdate,
  GhostAgent,
  GhostAgentCreate,
  GhostAgentUpdate,
  GhostC2Server,
  GhostC2ServerCreate,
  GhostC2ServerUpdate,
  GhostClient,
  GhostClientCreate,
  GhostClientUpdate,
  GhostMachine,
  GhostTraffic,
  GhostTrafficCreate,
  GhostTrafficUpdate,
  GhostTrafficProfile,
  GhostTrafficProfileCreate,
  GhostTrafficProfileUpdate,
  GhostTrafficDetails,
  GuacamoleConnectionParameters,
  InternetGateway,
  InternetGatewayCreate,
  InternetGatewayUpdate,
  InternetGatewayOverride,
  NetworkDevice,
  NetworkDeviceCreate,
  NetworkDeviceUpdate,
  NetworkOverride,
  NetworkOverrideCreate,
  NetworkOverrideUpdate,
  Package,
  PackageCreate,
  PackageUpdate,
  PcteStandardNetspec,
  AnsiblePlaybook,
  AnsiblePlaybookCreate,
  AnsiblePlaybookUpdate,
  AnsibleRoleDetails,
  AnsibleRole,
  AnsibleRoleUpdate,
  Node,
  NodeInterface,
  Range,
  RangeCreate,
  RangeUpdate,
  RangeAutoIP,
  RangeAutoIpCreate,
  RangeAutoIpUpdate,
  RangeAutoIpOverride,
  RangeBGP,
  RangeBgpCreate,
  RangeBgpUpdate,
  RangeBgpOverride,
  RangeBGPLink,
  RangeBgpLinkCreate,
  RangeBgpLinkUpdate,
  RangeBgpLinkOverride,
  RangeCert,
  RangeCertCreate,
  RangeCertUpdate,
  RangeCertOverride,
  RangeConsole,
  RangeConsoleCreate,
  RangeConsoleUpdate,
  RangeConsoleOverride,
  RangeContainer,
  RangeDNSRecord,
  RangeDnsRecordCreate,
  RangeDnsRecordUpdate,
  RangeDnsRecordOverride,
  RangeDNSServer,
  RangeDnsServerCreate,
  RangeDnsServerUpdate,
  RangeDnsServerOverride,
  RangeDNSZone,
  RangeDnsZoneCreate,
  RangeDnsZoneUpdate,
  RangeDnsZoneOverride,
  RangeHostNetwork,
  RangeHostNetworkCreate,
  RangeHostNetworkUpdate,
  RangeIP,
  RangeIpCreate,
  RangeIpUpdate,
  RangeIpOverride,
  RangeAutoL3Network,
  RangeAutoL3NetworkCreate,
  RangeAutoL3NetworkUpdate,
  RangeAutoL3NetworkOverride,
  RangeL3Network,
  RangeL3NetworkCreate,
  RangeL3NetworkUpdate,
  RangeL3NetworkOverride,
  RangeNetwork,
  RangeNetworkCreate,
  RangeNetworkUpdate,
  RangeNode,
  RangePki,
  RangePkiCreate,
  RangePkiUpdate,
  RangePkiOverride,
  RangePkiCertificateProfile,
  RangePkiIntermediateProfile,
  RangePkiKeyPair,
  RangeRouter,
  RangeRouterCreate,
  RangeRouterUpdate,
  RangeRouterOverride,
  RangeRouterInterface,
  RangeSpecificationAws,
  RangeSpecificationAwsCreate,
  RangeSpecificationAwsUpdate,
  RangeSpecificationVsphere,
  RangeSpecificationVsphereCreate,
  RangeSpecificationVsphereUpdate,
  RangeTorNet,
  RangeTorNetCreate,
  RangeTorNetUpdate,
  RangeTorNetOverride,
  RangeVM, //deployed vm
  RangeVmExportForm,
  RangeVolume,
  RangeVolumeCreate,
  RangeVolumeUpdate,
  RangeVolumeOverride,
  Scenario,
  ScenarioCreate,
  ScenarioUpdate,
  ScenarioOverridesOverride,
  ScenariosCreateByRangeIdRequest,
  ScenariosUpdateByRangeIdUuidRequest,
  ScenariosDeployRequest,
  ScenariosValidateRequest,
  ScenariosValidateBeforeCreateRequest,
  TelemetryAgent,
  TelemetryAgentCreate,
  TelemetryAgentUpdate,
  TrafficTracker,
  TrafficTrackerCreate,
  TrafficTrackerUpdate,
  Stream,
  StreamCreate,
  StreamUpdate,
  Validation,
  ValidationDuplicateResource,
  ValidationInvalidField,
  ValidationMissingResource,
  ValidationMissingResourceType,
  ValidationResource,
  ValidationSource,
  VMDisk,
  VMImage,
  VmImageUpdate,
  VMInterface,
  VmInterfaceCreate,
  VirtualMachineRestore,
  VirtualMachineSnapshot,
  VMSpecification,
  VmSpecificationCreate,
  VmSpecificationUpdate,
  VmSpecificationOverride,
  Volume,
  VolumeUpdate,
} from './lib';

//Enums
export {
  ScenariosCreate1Request,
  AwsMachineConfigInstanceTypeEnum,
  AwsMachineConfigZoneEnum,
  BackgroundJobStateEnum,
  BackgroundJobHistoryStatusEnum,
  ChartIconTypeEnum,
  CloudInitDataSourceType,
  CpeCreatePartEnum,
  DeployedPackageDetailStatusEnum,
  DeployedRangeConsoleStatusEnum,
  DeployedScenarioDetailStatusEnum,
  DriversDiskEnum,
  DriversNetworkEnum,
  GhostBrowserEventBrowseTypeEnum,
  GhostBrowserEventClickTargetTypeEnum,
  GhostBrowserEventTypeKeysTargetTypeEnum,
  GhostMachineStatusEnum,
  GhostMachineStatusUpEnum,
  GhostTrafficBrowserBrowserTypeEnum,
  GhostTrafficBrowserHandlerEnum,
  GhostOutlookEventCreateTypeEnum,
  GhostOutlookEventCreateBodyTypeEnum,
  GhostOutlookEventReplyBodyTypeEnum,
  InputDeviceType,
  ScenarioGroup,
  RangeBootstrapTypeEnum,
  RangeContainerStatusEnum,
  RangeConsoleProtocolEnum,
  RangeDNSServerTypeEnum,
  RangeRouterInterfaceType,
  RangeRouterProtocolsEnum,
  RangeSpecificationAwsCniEnum,
  RangeSpecificationAwsKubernetesVersionEnum,
  RangeSpecificationVsphereCniEnum,
  RangeSpecificationVsphereKubernetesVersionEnum,
  RangeStatusEnum,
  RangeVMStatusEnum,
  RangeTypeEnum,
  RangeVMKubevirtVmStatusEnum,
  RangeTorNetVersionEnum,
  ValidationCodeEnum,
  ValidationResourceTypeEnum,
  ValidationSeverityEnum,
  ValidationSourceTypeEnum,
  VmNicModel,
  VsphereMachineConfigCreateCreationTypeEnum,
  VsphereMachinePoolMachineOSEnum,
  MachineTaintEffectEnum,
  MetaIconTypeEnum,
  BootDetailsMachineTypeEnum,
} from './lib';
