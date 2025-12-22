// common constants needed for dashboards

/**
 * @interface iListItemType
 * @property {string} [author] Creator of the list item
 * @property {string} [uuid] Id of the list item
 * @property {string} [dateEdited] Date the list item was most recently edited
 * @property {string} [name] Name of the list item
 * @property {any} [file] A file
 */
export interface iListItemType {
  author?: string;
  uuid?: string;
  dateEdited?: any; // BE does not type this field like it does dateCreated so we need to use any to handle
  name?: string;
  file?: any;
  auId?: string; // BE deviated from pattern for AU Mappings
  id?: string; // BE deviated from pattern for ghost machines
  testId?: string; // BE deviated from pattern for CMI5 Tests
  deviceId?: string; // BE deviated from pattern for Hardware Devices -- no "name"
}
