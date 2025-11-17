/* Mock Endpoints */
import { setupWorker } from 'msw/browser';
import { ansibleRole } from './ansibleRole';
import { ansiblePlaybook } from './ansiblePlaybook';
import { awsRangeSpec } from './awsRangeSpec';
import { backgroundJob } from './backgroundJob';
import { backgroundJobGraph } from './backgroundJobGraph';
import { cmi5Class } from './cmi5Class';
import { cmi5Scenario } from './cmi5Scenario';
import { container } from './container';
import { containerSpec } from './containerSpec';
import { containerTag } from './containerTag';
import { countryCodes } from './countryCodes';
import { cpe } from './cpe';
import { draft } from './drafts';
import { draftState1 } from './draftStates1';
import { environmentAws } from './environmentAws';
import { environmentAwsCredential } from './environmentAwsCredential';
import { environmentAwsSpec } from './environmentAwsSpec';
import { environmentRancherCredential } from './environmentRancherCredential';
import { environmentVsphereCredential } from './environmentVsphereCredential';
import { ghostAgent } from './ghostAgent';
import { ghostC2Server } from './ghostC2Server';
import { ghostClient } from './ghostClient';
import { ghostTraffic } from './ghostTraffic';
import { ghostTrafficProfile } from './ghostTrafficProfile';
import { graphQLQueries } from './graphQLQueries';
import { chart, chartVersions } from './chart';
import { infrastructureNode } from './infrastructureNode';
import { networkMap } from './networkMap';
import { networkOverride } from './networkOverride';
import { packages } from './package';
import { pcteNetspec } from './pcteNetspec';
import { range } from './range';
import { rangeAutoIP } from './rangeAutoIP';
import { rangeAutoL3Network } from './rangeAutoL3Network';
import { rangeBgp } from './rangeBgp';
import { rangeBgpLink } from './rangeBgpLink';
import { rangeCerts } from './rangeCerts';
import { rangeConsole } from './rangeConsole';
import { rangeDnsRecord } from './rangeDnsRecord';
import { rangeDnsServer } from './rangeDnsServer';
import { rangeDnsServerTag } from './rangeDnsServerTag';
import { rangeDnsZone } from './rangeDnsZone';
import { rangeDnsZoneTag } from './rangeDnsZoneTag';
import { rangeHostNetwork } from './rangeHostNetwork';
import { rangeIP } from './rangeIP';
import { rangeL3Network } from './rangeL3Network';
import { clusterRangeNetwork } from './clusterRangeNetwork';
import { internetGateway } from './internetGateway';
import { rangeNetwork } from './rangeNetwork';
import { rangePKI } from './rangePKI';
import { rangeRouter } from './rangeRouter';
import { rangeResourceAnsiblePlaybook } from './rangeResourceAnsiblePlaybook';
import { rangeResourceAutoIP } from './rangeResourceAutoIP';
import { rangeResourceBGP } from './rangeResourceBGP';
import { rangeResourceBgpLink } from './rangeResourceBgpLink';
import { rangeResourceCertificate } from './rangeResourceCertificate';
import { rangeResourceClusterNetwork } from './rangeResourceClusterNetwork';
import { rangeResourceConsole } from './rangeResourceConsole';
import { rangeResourceConsoleGraph } from './rangeResourceConsoleGraph';
import { rangeResourceContainer } from './rangeResourceContainer';
import { rangeResourceContainerGraph } from './rangeResourceContainerGraph';
import { rangeResourceDnsRecord } from './rangeResourceDnsRecord';
import { rangeResourceDnsServer } from './rangeResourceDnsServer';
import { rangeResourceDnsZone } from './rangeResourceDnsZone';
import { rangeResourceHostNetwork } from './rangeResourceHostNetwork';
import { rangeResourceIP } from './rangeResourceIP';
import { rangeResourceAutoL3Network } from './rangeResourceAutoL3Network';
import { rangeResourceL3Network } from './rangeResourceL3Network';
import { rangeResourceNetwork } from './rangeResourceNetwork';
import { rangeResourcePackage } from './rangeResourcePackage';
import { rangeResourcePackageGraph } from './rangeResourcePackageGraph';
import { rangeResourcePKI } from './rangeResourcePKI';
import { rangeResourceRouter } from './rangeResourceRouter';
import { rangeResourceTelemetryAgent } from './rangeResourceTelemetryAgent';
import { rangeResourceTorNetwork } from './rangeResourceTorNetwork';
import { rangeResourceTrafficTracker } from './rangeResourceTrafficTracker';
import { rangeResourceVM } from './rangeResourceVM';
import { rangeResourceVMGraph } from './rangeResourceVMGraph';
import { rangeResourceVolume } from './rangeResourceVolume';
import { rangeResourceScenario } from './rangeResourceScenario';
import { rangeResourceScenarioGraph } from './rangeResourceScenarioGraph';
import { rangeResourceScenarioPermission } from './rangeResourceScenarioPermission';
import { rangeTorNet } from './rangeTorNet';
import { rangeVmSpecification } from './rangeVmSpecification';
import { rangeVolume } from './rangeVolume';
import { regionAws } from './regionAws';
import { scenario } from './scenario';
import { scenarioMap } from './scenarioMap';
import { telemetryAgent } from './telemetryAgent';
import { trafficTracker } from './trafficTracker';
import { vmImage } from './vmImage';
import { vmRestore } from './vmRestore';
import { vmSnapshot } from './vmSnapshot';
import { volume } from './volume';
import { vsphereRangeSpec } from './vsphereRangeSpec';
import { webScrape } from './webScrape';
import { hardwareDevice } from './hardwareDevice';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(
  ...ansibleRole,
  ...ansiblePlaybook,
  ...awsRangeSpec,
  ...backgroundJob,
  ...backgroundJobGraph,
  ...cmi5Class,
  ...cmi5Scenario,
  ...container,
  ...containerTag,
  ...countryCodes,
  ...cpe,
  ...draft,
  ...draftState1,
  ...environmentAws,
  ...environmentAwsCredential,
  ...environmentAwsSpec,
  ...environmentRancherCredential,
  ...environmentVsphereCredential,
  ...ghostAgent,
  ...ghostC2Server,
  ...ghostClient,
  ...ghostTraffic,
  ...ghostTrafficProfile,
  ...graphQLQueries,
  ...chart,
  ...chartVersions,
  ...hardwareDevice,
  ...infrastructureNode,
  ...networkMap,
  ...networkOverride,
  ...packages,
  ...pcteNetspec,
  ...range,
  ...rangeAutoIP,
  ...rangeAutoL3Network,
  ...rangeBgp,
  ...rangeBgpLink,
  ...rangeCerts,
  ...rangeConsole,
  ...rangeDnsRecord,
  ...rangeDnsServer,
  ...rangeDnsServerTag,
  ...rangeDnsZone,
  ...rangeDnsZoneTag,
  ...rangeHostNetwork,
  ...rangeIP,
  ...rangeConsole,
  ...rangeL3Network,
  ...clusterRangeNetwork,
  ...internetGateway,
  ...rangeNetwork,
  ...rangePKI,
  ...rangeRouter,
  ...rangeResourceAnsiblePlaybook,
  ...rangeResourceBGP,
  ...rangeResourceBgpLink,
  ...rangeResourceCertificate,
  ...rangeResourceClusterNetwork,
  ...rangeResourceConsole,
  ...rangeResourceConsoleGraph,
  ...rangeResourceContainer,
  ...rangeResourceContainerGraph,
  ...rangeResourceDnsRecord,
  ...rangeResourceDnsServer,
  ...rangeResourceDnsZone,
  ...rangeResourceHostNetwork,
  ...rangeResourceAutoIP,
  ...rangeResourceIP,
  ...rangeResourceL3Network,
  ...rangeResourceAutoL3Network,
  ...rangeResourceNetwork,
  ...rangeResourcePackage,
  ...rangeResourcePackageGraph,
  ...rangeResourcePKI,
  ...rangeResourceRouter,
  ...rangeResourceTelemetryAgent,
  ...rangeResourceTorNetwork,
  ...rangeResourceTrafficTracker,
  ...rangeResourceVM,
  ...rangeResourceVMGraph,
  ...rangeResourceVolume,
  ...rangeResourceScenario,
  ...rangeResourceScenarioGraph,
  ...rangeResourceScenarioPermission,
  ...rangeTorNet,
  ...rangeVmSpecification,
  ...rangeVolume,
  ...regionAws,
  ...scenario,
  ...scenarioMap,
  ...telemetryAgent,
  ...trafficTracker,
  ...containerSpec,
  ...vmImage,
  ...vmRestore,
  ...vmSnapshot,
  ...volume,
  ...vsphereRangeSpec,
  ...webScrape,
);
