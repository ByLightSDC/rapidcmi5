/** @constant
 * Default options for number of rows to display per page
 * @type {any[]}
 * @default
 */
export const rowsPerPageOptionsDefault = [
  100,
  500,
  1000,
  { value: -1, label: 'All' },
];

/** @constant
 * Default number of rows per page
 * @type {number}
 * @default
 */
export const rowsPerPageDefault = 100;

/** Override Rows Per Page for Certificates
 * ~20000 per system
 */
export const rowsPerPage_Certificate = 1000;

/** Override Rows Per Page for DNS Zones
 * ~5000 per system
 */
export const rowsPerPage_DnsZone = 500;

/** Potential overrides rows per page by topic
 * If no ~ comment, assume <= 500
 */
//const rowsPerPage_BGP = 100;
//const rowsPerPage_BGPLink = 100;
//const rowsPerPage_Console = 100;
//const rowsPerPage_Container = 100;
//const rowsPerPage_DnsServer = 100;
//const rowsPerPage_DnsRecord = 100; //~20000  `50-2000 per zone
//const rowsPerPage_IP = 100; //~10000
//const rowsPerPage_Network = 100;
//const rowsPerPage_PKI = 100;
//const rowsPerPage_Router = 100;
//const rowsPerPage_TorNetwork = 100;
//const rowsPerPage_VM = 100;
//const rowsPerPage_Volume = 100;

/** Packages
 * ? per system
 */

/** Ranges
 * ~10 per system
 */

/** Deployed Scenarios
 * ~5000 per system
 */
export const rowsPerPage_Scenario = 10;

/** @constant
 * Default options for number of rows to display per page
 * @type {any[]}
 * @default
 */
export const rowsPerPageOptionsScenario = [10, 100];
