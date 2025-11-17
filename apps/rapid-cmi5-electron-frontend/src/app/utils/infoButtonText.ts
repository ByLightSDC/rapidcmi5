const resourceQuantityInfoAddendum =
  '\nAssume bytes if units are unspecified or value contains exponents (Ex. 1e10)';

const infoButtonText: Record<string, Record<string, string>> = {
  ansiblePlaybook: {
    requiresElevatedPrivileges:
      'Whether Ansible Playbook requires elevated privileges to execute',
    parentPlaybooks:
      'Optional Playbook(s) which must run before this Playbook runs',
  },
  ansibleRole: {
    filename: 'File name of the upload',
    roleVariablesSchema: 'JSON Schema for Role Variables',
  },
  autoGrader: {
    context: 'Optional additional information to pass to the script at runtime',
    script: 'Script to execute on each received event',
    answer: 'Participants will not be able to see this answer.',
  },
  awsRangeSpec: {
    environmentCredential: 'Environment Credentials (AWS)',
    kubeApiserverArg: 'Optional kubernetes API server arguments',
    kubeControllerManagerArg:
      'Optional kubernetes controller manager arguments',
    kubeletArg: 'Optional kubelet arguments',
    kubernetesVersion: 'Kubernetes version',
    clusterCidr: 'CIDR of the cluster pod network',
    serviceCidr: ' CIDR of the cluster service network',
    systemDefaultRegistry:
      'Default container registry used during cluster provisioning',
    registryConfigs: 'Map of registry FQDN/IP to configuration values',
    configBundle: 'CA bundle for registry',
    configVerification: 'Skip verification of registry TLS',
    registryMirrors: 'Map of registry FQDN/IP to mirror values',
    mirrorEndpoints:
      'CRI plugin will try the endpoints one by one until a working one is found. The endpoint must be a valid url with host specified. The scheme, host and path from the endpoint URL will be used.',
    mirrorRewrites:
      'Rewrites are repository rewrite rules for a namespace. When fetching image resources from an endpoint and a key matches the repository via regular expression matching it will be replaced with the corresponding value from the map in the resource request.',
    // Machine Pool
    controlPlaneRole: 'Assign the Control Plane role to machines in this pool',
    etcdRole: 'Assign the ETCD role to machines in this pool',
    labels: 'Labels to assign to machines in this pool',
    poolName: 'Name of the machine pool, should be unique for a range',
    quantity: 'Number of machines in the pool',
    workerRole: 'Assign the worker role to machines in this pool',
    taints: 'Taints to assign to machines in this pool',
    taintEffect: 'Effect of the taint on pods that do not tolerate the taint',
    unhealthyNodeTimeout:
      'Time before a machine is considered unhealthy if it cannot be reached',
    // Machine Config - required
    configIamInstanceProfile: 'AWS IAM Instance Profile',
    configInstanceType: 'AWS Ec2 Instance type',
    configRootSize: 'AWS root disk size',
    configSecurityGroup: 'AWS VPC security group',
    configSecurityGroupReadOnly:
      'Whether or not to skip adding default rules to security groups',
    configSubnetId: 'AWS VPC subnet Id',
    configTags: 'AWS Tags',
    // Machine Config - optional
    configAccessKey: 'AWS access key',
    configAmi: 'AMI AWS machine image Id',
    configApiVersion: 'API Version of the schema',
    configBlockDurationMinutes: 'AWS spot instance duration in minutes',
    configDeviceName: 'AWS root device name',
    configEncryptEbsVolume:
      'Whether to encrypt the EBS volume using the AWS managed CMK',
    configEndpoint: 'Endpoint URL (hostname only or fully qualified URI)',
    configKeypairName: 'AWS keypair to use; requires --amazonec2-ssh-keypath',
    configHttpEndpoint:
      'Specify to enable the HTTP metadata endpoint on your instances',
    configHttpTokens:
      'State of token usage for your instance metadata requests',
    configInsecureTransport: 'Whether to disable SSL when sending requests',
    configKind:
      'String value representing the REST resource this object represents.' +
      '\nServers may infer this from the endpoint the client submits requests to.' +
      '\nIn CamelCase. CANNOT BE UPDATED.',
    configKmsKey: 'Custom KMS key using the AWS Managed CMK',
    configMonitoring: 'Whether to enable CloudWatch monitoring',
    configOpenPort: 'Port to make accessible from the Internet',
    configPrivateAddressOnly: 'Whether to only use a private IP address',
    configRequestSpotInstance: 'Whether to request spot instance',
    configRetries: 'Retry count for recoverable failures (use -1 to disable)',
    configSecretKey: 'AWS secret key',
    configSessionToken: 'AWS Session Token',
    configSshKeyContents: 'File contents for sshKeyContents',
    configSshUser: 'SSH User Name',
    configSpotPrice: 'AWS spot instance bid price (dollars/hour)',
    configUseEbsOptimizedInstance:
      'Whether to create an EBS optimized instance',
    configUsePrivateAddress: 'Whether to force the usage of private IP address',
    configUserData: 'File contents for userdata',
    configVolumeType: 'Amazon EBS volume type',
    configVpcId: 'AWS VPC Id',
    //
  },
  cmiAUMapping: {
    auId: 'Maps a Lesson AU (Assignable Unit) to a Scenario. \nThis is required if your lesson embeds a Scenario.',
  },
  cmiCourse: {
    courseId: 'LMS Course Id',
    promptClass:
      'If checked, an instructor can pre-deploy multiple instances of a scenario and assign them to a Class Id. Partipants launching the course will be prompted to enter the Class Id. If a match is found, the participant will be assigned the next available instance. Class Ids can be managed on the CLASSES dashboard.',
  },
  file: {
    volumeType: 'Should match x-volume-type from helm chart schema',
    filename: 'File name of the upload',
  },
  container: { tag: 'Used to pick the version of a container' },
  chart: {
    instructions: 'Select an exported v3 helm chart in tar.gz or tgz format',
  },
  clusterRangeNetwork: {
    persist:
      'If true, the Cluster Network will not be automatically cleaned up when no Range Networks reference it',
    // labels  handled as JSX.Element directly on form
  },
  cpe: {
    part: 'a for a class of applications\no for a class of operating systems\nh for a class of hardware devices\n* for any\n- for not applicable',
    lang: 'Defines the language supported in the user interface of the product',
    other:
      'Any other general descriptive or identifying information which is vendor- or product-specific and which does not logically fit in any other attribute value',
    product: 'Most common and recognizable title or name of the product',
    softwareEdition:
      'Characterizes how the product is tailored to a particular market or class of end users',
    targetHardware:
      'Characterizes the instruction set architecture (e.g., x86) on which the product operates',
    targetSoftware:
      'Characterizes the software computing environment within which the product operates',
    update:
      'Vendor-specific alphanumeric strings characterizing the particular update, service pack, or point release of the product',
    vender: 'Person or organization that manufactured or created the product',
    version:
      'Vendor-specific alphanumeric strings characterizing the particular release version of the product',
  },
  environmentAwsCredential: {
    accessKeyId: 'Id of an AWS access key',
    accessKeySecret: 'Secret for the access key',
    defaultRegion: 'Default region to use when creating clusters in AWS',
    environmentCredentialRancher: 'Credentials (Rancher)',
  },
  environmentRancherCredential: {
    accessKey: 'Id of a Rancher access key',
    caCerts: 'Rancher CA certificates',
    insecureTls: 'Ignore TLS certificate warnings',
    secretKey: 'Secret for the access key',
    timeout: 'Rancher connection timeout',
    tokenKey: 'Id of a Rancher token key',
    url: 'Rancher URL',
  },
  environmentVsphereCredential: {
    password: 'Password for vSphere User',
    vcenter: 'Host Name for Vcenter',
    port: 'Port for Vcenter Host',
    environmentCredentialRancher: 'Credentials (Rancher)',
  },
  environmentSpec: {},
  ghostAgent: {
    c2Server:
      'Optional Ghost C2 Server, if not specified runtime control of the agent is not possible',
    profile: 'Optional Ghost Traffic Profile to execute on startup',
    parentPlaybooks:
      'Optional Playbook(s) which must run before this Agent is installed',
  },
  ghostC2Server: {
    hostname: 'Hostname of the C2 Server',
    storage: 'Optional size of Ghost database',
  },
  ghostClient: {
    c2Server:
      'Optional Ghost C2 Server, if not specified runtime control of the client is not possible',
    profile: 'Optional Ghost Traffic Profile to execute on startup',
  },
  ghostTraffic: {
    loop: 'Whether to repeat traffic patterns until the end time is reached or execute only once',
    // #region events
    events: 'Sequence of events to execute',
    // all events
    eventDelayBefore:
      'Optional delay in milliseconds before executing this event',
    eventDelayAfter:
      'Optional delay in milliseconds after executing this event',
    // browser events
    eventBrowseSite: 'Site to browse to',
    eventClickTarget: 'Target of the element to click',
    eventCrawlSites: 'List of sites to crawl',
    eventRandomSites: 'List of sites to randomly browse to',
    eventTypeKeysTarget: 'Target of the element to send keypresses to',
    eventTypeKeysKeys: 'Keys to send to the element',
    // cmd events
    eventRandom:
      'If true, a randomly selected command will be executed each loop; otherwise, all commands will be executed sequentially each loop',
    eventShellCommands: 'One or more commands to execute in sequence',
    // DNS events
    eventDnsHostname: 'Hostname to resolve',
    eventDnsNameserver: 'Optional specific nameserver to query',
    // ICMP events
    eventIcmpHost: 'Host to ping',
    eventIcmpCount: 'Number of ICMP requests to send',
    eventIcmpInterval: 'Interval in seconds between requests',
    eventIcmpSize: 'Size of the ICMP request packet',
    // SFTP events
    eventSftpHostName: 'Hostname or IP to connect to',
    eventSftpUserName: 'Username of a valid SFTP user',
    eventSftpPassword: 'Password of a valid SFTP user',
    // Outlook events
    eventOutlookFrom:
      'A from email address. Note that if Outlook is not configured to use this email address, email may not be sent',
    eventOutlookCreateTo:
      'Zero or more to email addresses. A single value of "random" can also be given to select a random address.',
    eventOutlookReplyTo:
      'Zero or more to email addresses. A single value of "all" can also be given to reply to all addresses on the original thread.',
    eventOutlookCreateCc:
      'Zero or more cc email addresses. A single value of "random" can also be given to select a random address.',
    eventOutlookReplyCc:
      'Zero or more cc email addresses. A single value of "all" can also be given to reply to all addresses on the original thread.',
    eventOutlookCreateBcc:
      'Zero or more bcc email addresses. A single value of "random" can also be given to select a random address.',
    eventOutlookReplyBcc:
      'Zero or more bcc email addresses. A single value of "all" can also be given to reply to all addresses on the original thread.',
    eventOutlookCreateSubject:
      'The subject of the email being sent. A value of "random" can also be given to assign a random subject.',
    eventOutlookReplySubject:
      'The subject of the email being sent. A value of "parent" can be given to assign a subject in the format "RE: (original subject)".',
    eventOutlookCreateBody:
      'The body of the email being sent. A value of "random" can also be given to assign a random body.',
    eventOutlookReplyBody:
      'The body of the email being sent. A value of "random+parent" can also be given to assign a random reply.',
    eventOutlookCreateBodyType: 'The type of the body being sent.',
    eventOutlookReplyBodyType:
      'The type of the body being sent. A value of "parent" can be used to reply with the original message type',
    // #endregion

    // #region commands
    // curl commands
    commandDelayBefore:
      'Optional delay in milliseconds before executing the even',
    commandDelayAfter:
      'Optional delay in milliseconds after executing the event',
    curlCommand: "curl command arguments to execute (do not include 'curl')",
    // #endregion

    // #region config
    // curl / brower config
    configStickiness: 'Determines how often the same site is visited in a row',
    configStickinessDepthMin:
      'Minimum number of requests to make on the same site',
    configStickinessDepthMax:
      'Maximum number of requests to make on the same site',
    // browser config
    configCrawlTasksMaximum: 'Maximum number of requests to make when crawling',
    configActionsBeforeRestart:
      'Restarts the browser process after navigating this many times (Windows clients only)',
    configVisitedRemember:
      'Number of sites to remember that were previously visited; these will not be randomly chosen again',
    configIncognito: 'Whether the browser should be started in incognito mode',
    configBlockStyles: 'Whether styles should be blocked',
    configBlockImages: 'Whether images should be blocked',
    configBlockFlash: 'Whether flash should be blocked',
    configBlockScripts: 'Whether scripts should blocked',
    configEnableJavascript:
      'Whether javascript should be enabled in the webdriver. Must be true if using executeScript events',
    configIsHeadless:
      'Whether the browser will be launched in headless (no-UI) mode. Must be true for containerized Ghost Clients',
    // command / sftp config
    configDelayJitter:
      'Amount of jitter percentage after a random command is selected/executed',
    // command config
    configExecutionProbability:
      'Probability between 0-100 that the given command will be executed',
    // sftp config
    configTimeBetweenCommandsMin:
      'Minimum number of milliseconds between commands',
    configTimeBetweenCommandsMiax:
      'Maximum number of milliseconds between commands',
    // #endregion
  },
  global: {
    scenarioGroups:
      'Assign Access Groups to restrict access to this resource. You can add users to your Access Groups from the Manage Access section of your deployed Scenario.',
  },
  hardwareDevice: {
    deviceId:
      'Unique and memorable device identifier representing a hardware network device. Can be attached to a scenario via a Range Host Network.',
  },
  hostNetwork: {
    deviceId:
      'Unique and memorable device identifier representing a hardware network device that is directly connected to this network',
  },
  internetGateway: {
    // labels  handled as JSX.Element directly on form
  },
  networkOverride: {
    asn: 'Autonomous System Number for this Network',
  },
  package: {},
  range: {
    bootstrapType: 'Type of range to bootstrap - only used by unmanaged ranges',
    cmi5Key: 'CMI5 content partition key',
    kubeconfig:
      ' Kubeconfig YAML to configure access to the Kubernetes cluster',
    suspendBootstrap:
      'Whether to suspend bootstrapping of the range - only used by unmanaged ranges',
  },
  rangeBgp: {
    asn: 'Autonomous System Number for this BGP Network',
  },
  rangeBgpLink: {
    node1ASN: 'Specify Autonomous System Number (ASN) for Node 1',
    node2ASN: 'Specify Autonomous System Number (ASN) for Node 2',
  },
  rangeCert: {
    algorithm: 'Key algorithm and size for the newly generated private key',
    cn: 'Common name (CN) for the requested CSR',
    hosts: 'Subject Alternate Names for the requested CSR',
    profile:
      'Signing profile for the signer\nIf empty will use a default profile',
    rangePki: 'Name of the PKI server to request the certificate from',
    subjects:
      'Certificate Subjects for the Certificate Signing Request (CSR). You must specify at least one.',
  },
  rangeConsole: {
    groups: 'SSO groups that have access to this range console',
    parameters: 'Guacamole Connection Parameters',
    userNames: 'SSO usernames that have access to this range console',
  },
  rangeDnsRecord: {
    data:
      'A\t\tEx. 10.10.10.10' +
      '\nAAAA\tEx. aaaa:aaaa::aaaa' +
      '\nCNAME\tEx. bylight.com' +
      '\nothers\t@',
    name:
      'Record Name is expressed as a contiguous set of characters without interior spaces' +
      '\n  Ex. bylight.com' +
      '\n\n...or as a string enclosed in double quotes' +
      '\n  Ex. "delimited name"',
    // '\nInside a " delimited string any character can occur, except for a " itself, which must be quoted using \\ (back slash).',
    recordClass: 'Class of the record',
    ttl: 'Time to live of the record',
    type: 'Type of record',
  },
  rangeDnsServer: {
    tagSelectors: 'Manage DNS Zones with the following tags',
    type: 'Type of DNS Server',
  },
  rangeDnsZone: {
    // name -- this has a special formatted element in DnsZoneForm
    zone: 'Settings for this zone',
    tagSelectors: 'DNS Server Tags for this DNS Zone',
  },
  rangeIP: {
    controlled: 'Whether or not to set the IP out to public internet',
    location:
      'IP Address, location fields, and Country are optional. When specified, IP Address must be valid for the subnet. If all of these fields are blank and a subnet with DHCP enabled is specified, the IP address will be automatically assigned.',
    rangeL3Network: '',
  },
  rangeL3Network: {
    dhcpConfig_dhcpServer:
      'IP address of the RangeOS provided DHCP server - choose an address not used in your subnet',
    dhcpConfig_dnsServers: 'Optional DNS Server IP addresses (IPv4 or IPv6)',
    dhcpConfig_staticReservations:
      'Optional static reservations of MAC addresses to IP addresses',
    dhcpConfig_pools: 'Optional DHCP IP Address pool ranges',
  },
  rangeNetwork: {
    clusterRangeNetwork:
      'Optional Cluster Range Network. If specified, this Range Network will be linked to a cluster-wide network that can be shared between scenarios.',
  },
  rangePKI: {
    certificates: '',
    intermediate: '',
    pkiCsr: '',
    parentCAHost: 'Name of a parent PKI to sign an intermediate',
    keyPair: '',
    bundleProfile:
      'Signing Profile for the signer.\nDefault will be provided if unspecified',
    certificates_expiry: 'Number of hours before certificate profile expires',
    certificates_usage: '',
    intermediate_expiry:
      'Number of hours before the intermediate profile expires',
    csr_hosts: 'Subject Alternate Names for the requested CSR',
    csr_names:
      'Certificate Subject(s) for the requested CSR. You must specify at least one.',
    csr_key_algo: 'Key algorithm and size for the newly generated private key',
    csr_cn: 'Common Name (CN) for the requested CSR',
  },
  rangeRouter: {
    dhcp: 'Whether a DHCP server should be enabled on the router interfaces when associated IP Subnets have a configured DHCP server.',
    location: 'Specify a longitude and latitude location, or a country',
  },
  rangeTorNet: {
    version: 'Tor version',
    tor_Node_Name: 'Name of the Tor node',
    tor_Node_Range_Ip: 'IP source of this node on the network',
    tor_Node_Dns_Range_Ip:
      'DNS Server source for optional IP address on the network',
  },
  rangeVmSpec: {
    cloudInit_userData:
      'Optional script to be executed on each instance during cloud initialization process. Contains NoCloud inline cloud-init userdata. Go text templates are supported but only deterministic template functions are available.',
    cloudInit_userDataParameters:
      'Optional template parameters. Go text templates are supported in parameter values, and non-deterministic functions (ex. randAlpha) can be used. Keys are available as parameter data in the userData template.',
    controlNetNicEnabled: 'Whether the Control Network NIC is enabled',
    controlNetNicModel:
      'Specify network driver on your VM (it must be supported by the VM)',
    cpuCores: 'Number of CPU cores',
    memory:
      'Quantity of requested memory to be allocated.' +
      resourceQuantityInfoAddendum,
    disk_storage:
      'Quantity of requested storage space to be allocated.' +
      resourceQuantityInfoAddendum,
    disk_storageClass:
      'Kubernetes storage class to use for this disk. Ex. block-storage',
    bootImage_storage:
      'Quantity of requested storage space to be allocated.' +
      resourceQuantityInfoAddendum,
    // bootImage_accessMode: 'Method used to mount boot disk',
    // bootImage_vmDiskDriver: 'Optional disk driver',
    firmware_efi:
      'Whether or not image requires EFI BIOS? Must be true if secureBoot is true.',
    firmware_secureBoot:
      'Whether or not VM requires secure boot? If true, EFI must also be true.',
    // interface_vmNicModel: 'Optional NIC Model',
    interface_id:
      'Optional unique identifier, only used with advanced networking',
    interface_defaultGateway:
      'Whether the default gateway will be assigned based on the Range IP attached to this interface',
    interface_macAddress:
      'Specify MAC address assigned to the interface. Default will be provided if unspecified.\nexample: 11:22:33:44:55:66',
    interface_mirrorPorts:
      'Optional list of network ports to mirror to this interface',
  },
  containerSpec: {
    advancedNetworking:
      'Advanced networking mode allows network interfaces to be assigned to specific pods in the associated chart.',
    chart: 'A valid v3 Helm Chart. Select from the available charts.',
    controlNetNicEnabled:
      'Whether the control network NIC is enabled. At least 1 interface is required if disabled.',
    interface_id:
      'Optional unique identifier, only used with advanced networking',
    interface_defaultGateway:
      'Whether the default gateway of the associated Range IP will be attached to this interface',
    interface_macAddress:
      'Specify MAC address assigned to the interface. Default will be provided if unspecified.\nexample: 11:22:33:44:55:66',
    interface_mirrorPorts:
      'Optional list of network ports to mirror to this interface',
    interface_rangeIpName:
      'Optional name of the Range IP that is injected into the container helm values',
    parameters:
      'Optional templated parameters to use with the chart. Go text templates are supported in values, and non-deterministic functions (ex. randAlpha) can be used. This can be used to inject random data at runtime or provide simple overridable chart values, for example.',
  },
  telemetryAgent: {
    interval: 'Interval that the script will run',
    targetRangeVm: 'Range VM to have Telegraf Installed for scoring students',
  },
  vmImage: {
    adminPassword: 'Credentials for VM login',
    cpuCores: 'Number of default CPU cores',
    filename: 'File name of the upload',
    inputDevice: 'Optional input device type, defaults to usb if not specified',
    minimumMemory:
      'Minimum quantity of memory to be allocated.' +
      resourceQuantityInfoAddendum,
    recommendedMemory:
      'Recommended quantity of memory to be allocated.' +
      resourceQuantityInfoAddendum,
    minimumStorage:
      'Requested size of storage volume.' + resourceQuantityInfoAddendum,
  },
  volume: {
    storage: 'Requested size of storage volume.' + resourceQuantityInfoAddendum,
    storageClass: 'Type of storage to use for this disk. Ex. efs-sc',
    volume: 'File UUID to be provisioned into the range',
  },
  vsphereRangeSpec: {
    environmentCredential: 'Environment Credentials (vSphere)',
    kubernetesVersion: 'Kubernetes version',
    clusterCidr: 'CIDR of the cluster pod network',
    serviceCidr: ' CIDR of the cluster service network',
    systemDefaultRegistry:
      'Default container registry used during cluster provisioning',
    registryConfigs: 'Map of registry FQDN/IP to configuration values',
    configBundle: 'CA bundle for registry',
    configVerification: 'Skip verification of registry TLS',
    registryMirrors: 'Map of registry FQDN/IP to mirror values',
    mirrorEndpoints:
      'CRI plugin will try the endpoints one by one until a working one is found. The endpoint must be a valid url with host specified. The scheme, host and path from the endpoint URL will be used.',
    mirrorRewrites:
      'Rewrites are repository rewrite rules for a namespace. When fetching image resources from an endpoint and a key matches the repository via regular expression matching it will be replaced with the corresponding value from the map in the resource request.',
    kubeApiserverArg: 'Optional kubernetes API server arguments',
    kubeletArg: 'Optional kubelet arguments',
    kubeControllerManagerArg:
      'Optional kubernetes controller manager arguments',
    controlPlaneRole: 'Assign the Control Plane role to machines in this pool',
    etcdRole: 'Assign the ETCD role to machines in this pool',
    workerRole: 'Assign the worker role to machines in this pool',
    quantity: 'Number of machines in the pool',
    machineOS: 'Operating system of machines in this pool',
    labels: 'Labels to assign to machines in this pool',
    unhealthyNodeTimeout:
      'Time before a machine is considered unhealthy if it cannot be reached',
    taints: 'Taints to assign to machines in this pool',
    taintEffect: 'Effect of the taint on pods that do not tolerate the taint',
    poolName: 'Name of the machine pool, should be unique for a range',
    configCpuCount: 'Number of vSphere CPUs for docker VM',
    configDiskSize: 'Size of vSphere disk for docker VM',
    configMemorySize: 'Size of vSphere memory for docker VM',
    configCreationType: 'Type of a new virtual machine to create',
    configDatacenter: 'Datacenter for vSphere virtual machine',
    configCloneFrom: 'Name of what to clone',
    configCloudConfig:
      'Filepath to a cloud-config yaml file to put into the ISO user-data',
    configCloudInit:
      'Cloud-init vSphere filepath or url to add to guestinfo, filepath will be read and base64 encoded before adding',
    configDataStore: 'Datastore for vSphere virtual machine',
    configDataStoreCluster: 'Datastore cluster for vSphere virtual machine',
    configFolder:
      'vSphere folder for the docker VM. This folder must already exist in the datacenter',
    configPool: 'vSphere resource pool for docker VM',
    configNonB2dImageFields: 'Fields available when using a non-B2D image',
    configSshUser: 'SSH User for a non-B2D image',
    configSshPassword: 'Password for SSH User for a non-B2D image',
    configSshPort: 'SSH Port for a non-B2D image',
    configSshUserGroup:
      "SSH User Group for a non-B2D image. The uploaded keys will need chown'ed, defaults to staff e.g. docker:staff",
    configOs: 'Desired machine OS for a non-B2D image',
    configParams:
      'Configuration parameters for vSphere vm (used for guestinfo)',
    configNetworks:
      'vSphere networks where the virtual machine will be attached',
    configTags: 'vSphere tag id e.g. urn:xxx',
  },
  webScrape: {
    SCRAPE_RECURSIVE_DEPTH: 'Navigation depth',
  },
};

export const getInfoText = (
  formName: string,
  fieldName: string,
  defaultText = '',
) => {
  if (!Object.prototype.hasOwnProperty.call(infoButtonText, formName)) {
    return defaultText;
  }
  if (
    !Object.prototype.hasOwnProperty.call(infoButtonText[formName], fieldName)
  ) {
    return defaultText;
  }
  return infoButtonText[formName][fieldName];
};
