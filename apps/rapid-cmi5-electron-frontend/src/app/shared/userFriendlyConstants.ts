import {
  ValidationResourceTypeEnum,
  ValidationSourceTypeEnum,
} from '@rangeos-nx/frontend/clients/devops-api';
import { Topic } from '@rangeos-nx/ui/api/hooks';

export const getFriendlyTypeStr = (typeName: string) => {
  switch (typeName) {
    case ValidationResourceTypeEnum.AnsiblePlaybook:
      return Topic.AnsiblePlaybook;
    case ValidationSourceTypeEnum.ContainerSpecification:
    case ValidationResourceTypeEnum.ContainerSpecification:
      return Topic.ContainerSpec;
    case ValidationResourceTypeEnum.GhostC2Server:
      return Topic.GhostC2Server;
    case ValidationResourceTypeEnum.GhostClient:
      return Topic.GhostClient;
    case ValidationResourceTypeEnum.GhostTrafficProfile:
      return Topic.GhostTrafficProfile;
    case ValidationResourceTypeEnum.InternetGateway:
      return Topic.InternetGateway;
    case ValidationSourceTypeEnum.Package:
    case ValidationResourceTypeEnum.Package:
      return Topic.Package;
    case ValidationResourceTypeEnum.RangeAutoIp:
      return Topic.AutoIP;
    case ValidationResourceTypeEnum.RangeBgp:
      return Topic.BGP;
    case ValidationResourceTypeEnum.RangeBgpLink:
      return Topic.BgpLink;
    case ValidationResourceTypeEnum.RangeCert:
      return Topic.Certificate;
    case ValidationResourceTypeEnum.RangeConsole:
      return Topic.Console;
    case ValidationResourceTypeEnum.RangeDnsRecord:
      return Topic.DnsRecord;
    case ValidationResourceTypeEnum.RangeDnsServer:
      return Topic.DnsServer;
    case ValidationResourceTypeEnum.RangeDnsZone:
      return Topic.DnsZone;
    case ValidationResourceTypeEnum.RangeHostNetwork:
      return Topic.HostNetwork;
    case ValidationResourceTypeEnum.RangeIp:
      return Topic.IP;
    case ValidationResourceTypeEnum.RangeL3Network:
      return Topic.Layer3Network;
    case ValidationResourceTypeEnum.RangeNetwork:
      return Topic.Network;
    case ValidationResourceTypeEnum.RangePki:
      return Topic.PKI;
    case ValidationResourceTypeEnum.RangeRouter:
      return Topic.Router;
    case ValidationResourceTypeEnum.RangeTorNet:
      return Topic.TorNetwork;
    case ValidationResourceTypeEnum.RangeVolume:
      return Topic.Volume;
    case ValidationResourceTypeEnum.VmSpecification:
      return Topic.VMSpec;
    default:
      return typeName;
  }
};
