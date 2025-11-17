// import { Topic } from '@rangeos-nx/ui/api/hooks';

// import {
//   defaultInterfaceData as defaultContainerInterface,
//   defaultPostPutData as containerSpecPd,
// } from '../views/dashboards/container-specs/constants';
// import { defaultPostPutData as agPd } from '../views/dashboards/auto-graders/constants';
// import { defaultPutData as arPd } from '../views/dashboards/ansible-roles/constants';
// import { defaultPostPutData as apPd } from '../views/dashboards/ansible-playbooks/constants';
// import { defaultPostData as filePd } from '../views/dashboards/files/constants';
// import { defaultPostPutData as ghostC2Pd } from '../views/dashboards/ghost-c2-servers/constants';
// import { defaultPostPutData as ghostAgentPd } from '../views/dashboards/ghost-agents/constants';
// import { defaultPostPutData as ghostClientPd } from '../views/dashboards/ghost-clients/constants';
// import { defaultPostPutData as ghostTrafficPd } from '../views/dashboards/ghost-traffic-profiles/constants';
// import { defaultPostPutData as hostNetworkPd } from '../views/dashboards/range-host-networks/constants';
// import { defaultPostPayload as imagePd } from '../views/dashboards/vm-images/constants';
// import { defaultPostPutData as certPd } from '../views/dashboards/range-certs/constants';
// import { defaultPostData as consolePd } from '../views/dashboards/range-consoles/constants';
// import { defaultPostPutData as cpePd } from '../views/dashboards/cpes/constants';
// import { defaultPostPutData as dnsRecordPd } from '../views/dashboards/range-dns-records/constants';
// import { defaultPostPutData as dnsZonePd } from '../views/dashboards/range-dns-zones/constants';
// import { defaultPostPutData as ipPd } from '../views/dashboards/range-ips/constants';
// import { defaultPostPutData as autoIpPd } from '../views/dashboards/range-auto-ips/constants';
// import { defaultPostPutData as autoL3Pd } from '../views/dashboards/range-auto-l3networks/constants';
// import { defaultPostPutData as l3Pd } from '../views/dashboards/range-l3networks/constants';
// import { defaultPostPutData as nwPd } from '../views/dashboards/range-networks/constants';
// import { defaultPostPutData as pkgPd } from '../views/dashboards/packages/constants';
// import { defaultPostData as deployedScenPd } from '../views/dashboards/range-resource-scenarios/constants';
// import {
//   defaultPostPutData as routerPd,
//   defaultInterfaceData as defaultRouterInterface,
// } from '../views/dashboards/range-routers/constants';
// import { defaultPostPutData as scenPd } from '../views/dashboards/scenarios/constants';
// import { defaultPostPutData as tagentPd } from '../views/dashboards/telemetry-agents/constants';
// import {
//   defaultPostPutData as vmSpecPd,
//   defaultInterfaceData as defaultVMInterface,
// } from '../views/dashboards/range-vm-specs/constants';
// import { postPutPayload as volumePd } from '../views/dashboards/range-volumes/constants';

// //blueprint
// import { defaultPostPutData as blueprintPd } from '../views/dashboards/design-tools/project-designer/forms/blueprints/constants';
// import { defaultPostPutData as contentPd } from '../views/dashboards/design-tools/project-designer/forms/range-volume-content/constants';
// import { defaultPostPutData as staticWebPd } from '../views/dashboards/design-tools/project-designer/forms/static-web/constants';
// //portmirror
// import { defaultPostPutData as portMirrorPd } from '../views/dashboards/design-tools/project-designer/forms/portmirror/constants';
// //blueprint child defaults
// const blueprintChildPd = {
//   uuid: '',
//   name: '',
// };

// /** @constant
//  * Default payloads by topic
//  * WIP - currently moving over payloads used in project designer. not implemented anywhere else
//  * @type {object}
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const topicPayloads: { [key: string]: any } = {
//   [Topic.AnsibleRole]: arPd,
//   [Topic.AnsiblePlaybook]: apPd,
//   [Topic.AutoGrader]: agPd,
//   [Topic.AutoLayer3Network]: autoL3Pd,
//   [Topic.Blueprint]: blueprintPd,
//   [Topic.BlueprintChild]: blueprintChildPd,
//   [Topic.Certificate]: certPd,
//   [Topic.ContainerSpec]: containerSpecPd,
//   [Topic.Console]: consolePd,
//   [Topic.CPE]: cpePd,
//   [Topic.DnsRecord]: dnsRecordPd,
//   [Topic.DnsZone]: dnsZonePd,
//   [Topic.File]: filePd,
//   [Topic.GhostC2Server]: ghostC2Pd,
//   [Topic.GhostAgent]: ghostAgentPd,
//   [Topic.GhostClient]: ghostClientPd,
//   [Topic.GhostTrafficProfile]: ghostTrafficPd,
//   [Topic.HostNetwork]: hostNetworkPd,
//   [Topic.Interface]: defaultContainerInterface,
//   [Topic.IP]: ipPd,
//   [Topic.AutoIP]: autoIpPd,
//   [Topic.Layer3Network]: l3Pd,
//   [Topic.Network]: nwPd,
//   [Topic.Package]: pkgPd,
//   [Topic.PortMirror]: portMirrorPd,
//   [Topic.RangeVolumesContent]: contentPd,
//   [Topic.ResourceScenario]: deployedScenPd,
//   [Topic.Router]: routerPd,
//   [Topic.RouterInterface]: defaultRouterInterface,
//   [Topic.Scenario]: scenPd,
//   [Topic.StaticWebSite]: staticWebPd,
//   [Topic.TelemetryAgent]: tagentPd,
//   [Topic.VMImage]: imagePd,
//   [Topic.VMSpec]: vmSpecPd,
//   [Topic.VMSpecInterface]: defaultVMInterface,
//   [Topic.Volume]: volumePd,
// };
