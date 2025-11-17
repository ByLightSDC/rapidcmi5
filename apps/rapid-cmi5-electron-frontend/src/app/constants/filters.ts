/** @constant
 * Deployed Scenario Options for Sort By
 *  @type {string[]}
 */
export const resourceScenarioSortByOptions = [
  'dateCreated',
  'dateEdited',
  'deployedBy',
  'name',
  'studentUsername',
];

/** @constant
 * Deployed Scenario SortBy Filter
 *  @type {inputFilterType}
 */
export const resourceScenarioSortBy = {
  key: 'sortBy',
  label: 'Sort By',
  options: resourceScenarioSortByOptions,
  default: 'dateEdited',
  triggerPageReset: true, //because the BE sorts before page applied
};

/** @constant
 * KeyCloak User Options for Sort By
 *  @type {string[]}
 */
export const keyCloakUserSortByOptions = [
  'username',
  'email',
  'firstName',
  'lastName',
  'createdTimestamp',
];

/** @constant
 * KeyCloak User SortBy Filter
 *  @type {inputFilterType}
 */
export const keyCloakUserSortBy = {
  key: 'sortBy',
  label: 'Sort By',
  options: keyCloakUserSortByOptions,
  default: 'username',
  triggerPageReset: true, //because the BE sorts before page applied
};

/** @constant
 * KSAT Element Types allowed (not the whole ElementElementTypeEnum set)
 */
export const ksatElementTypeOptions = ['knowledge', 'skill', 'task'];

export const ksatElementTypeFilter = {
  key: 'element_type',
  label: 'Element Type(s)',
  multiple: true,
  options: ksatElementTypeOptions,
  default: [],
  triggerPageReset: true, //because the BE sorts before page applied
  divProps: { width: '145px' },
};

/** @constant
 * KeyCloak User Options for Sort By
 *  @type {string[]}
 */
export const ksatSortByOptions = ['element_type', 'element_id', 'title'];

/** @constant
 * KSATs SortBy Filter
 *  @type {inputFilterType}
 */
export const ksatsSortBy = {
  key: 'sortBy',
  label: 'Sort By',
  options: ksatSortByOptions,
  default: 'element_type',
  triggerPageReset: true, //because the BE sorts before page applied
};
