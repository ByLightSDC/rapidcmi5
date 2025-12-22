// pagination filter variables needed globally to handle special data for api
// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
export let paginationFiltersConfig: any = {
  author: '', // used to translate the author filter ("true" / "false") to current logged in user
  currentFilter: '', // used to keep track of text filter being edited to refocus when filters remount
};

/** @constant
 * Default label to display in filter options that allows user to specificy no filter
 *  @type {string}
 */
export const defaultUndefinedOptionLabel = 'Any';

/** @constant
 * Default Options for Sort By
 *  @type {string[]}
 */
export const defaultSortByOptions = [
  'author',
  'dateCreated',
  'dateEdited',
  'name',
];
export const defaultStatusSortByOptions = [
  'author',
  'dateCreated',
  'dateEdited',
  'name',
  'status',
];

/** @constant
 * Default Options for Sort Order
 *  @type {string[]}
 */
export const defaultSortOrderOptions = ['asc', 'desc'];

//#region Common API Filters - can be included
/** @constant
 * Default Search Filter
 *  @type {inputFilterType}
 */
export const defaultDescription = {
  key: 'description',
  label: '',
  placeholder: 'Description...',
  default: '',
};

/** @constant
 * Default Search Filter
 *  @type {inputFilterType}
 */
export const defaultName = {
  key: 'name',
  label: '',
  placeholder: 'Name...',
  default: '',
};

/** @constant
 * Default Search Filter
 *  @type {inputFilterType}
 */
export const defaultAuthor = {
  key: 'author',
  label: '',
  placeholder: 'Author...',
  default: '',
};

const emptyCpeString = '*';
/** @constant
 * Default CPE Filters
 *  @type {inputFilterType}
 */
export const defaultCpeFilters = [
  {
    key: 'lang',
    label: 'Language',
    default: emptyCpeString,
    triggerPageReset: true,
  },
  {
    key: 'other',
    label: 'Other',
    default: emptyCpeString,
    triggerPageReset: true,
  },
  {
    key: 'part',
    label: 'Part',
    default: emptyCpeString,
    options: ['a', 'o', 'h', '*', '-'],
    triggerPageReset: true,
  },
  {
    key: 'product',
    label: 'Product',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'softwareEdition',
    label: 'Software Edition',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'targetHardware',
    label: 'Target Hardware',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'targetSoftware',
    label: 'Target Software',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'update',
    label: 'Update',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'vendor',
    label: 'Vendor',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
  {
    key: 'version',
    label: 'Version',
    default: emptyCpeString,
    triggerPageReset: true, //because the BE sorts before page applied
  },
];
//#endregion

/** @constant
 * Default Search Filter
 *  @type {inputFilterType}
 */
export const defaultSearch = {
  key: 'search',
  label: '',
  placeholder: 'Search...',
  default: '',
};

/** @constant
 * Default SortBy Filter
 *  @type {inputFilterType}
 */
export const defaultSortBy = {
  key: 'sortBy',
  label: 'Sort By',
  options: defaultSortByOptions,
  default: 'dateEdited',
  triggerPageReset: true, //because the BE sorts before page applied
};
export const defaultStatusSortBy = {
  key: 'sortBy',
  label: 'Sort By',
  options: defaultStatusSortByOptions,
  default: 'dateEdited',
  triggerPageReset: true, //because the BE sorts before page applied
};

/** @constant
 * Metadata Tags Filter
 * @type {inputFilterType}
 */
export const defaultMetadataTags = {
  key: 'metadataTags',
  label: 'Tags',
  placeholder: 'tag1,tag2...',
  default: '',
};

/** @constant
 * Default Sort Order Filter
 *  @type {inputFilterType}
 */
export const defaultSortOrder = {
  key: 'sort',
  label: 'Order',
  options: defaultSortOrderOptions,
  default: 'desc',
  triggerPageReset: true, //because the BE sorts before page applied
};
export const ascSortOrder = {
  key: 'sort',
  label: 'Order',
  options: defaultSortOrderOptions,
  default: 'asc',
  triggerPageReset: true, //because the BE sorts before page applied
};

/** @constant
 * Authored By Me filter
 *  @type {inputFilterType}
 */
export const authoredByMeFilter = {
  key: 'author',
  label: 'Authored By Me',
  default: '', // this will be replaced by current user's email address as author
  isCheckbox: true,
  divProps: { width: '60px', lineHeight: 1.2 }, // use for label
};

/** @constant
 * Forced Authored By Me filter
 *  @type {inputFilterType}
 */
export const forceAuthoredByMeFilter = {
  key: 'author',
  label: 'Authored By Me',
  default: 'true', // default to "on" for bulk delete -- this will be replaced by current user's email address as author
  isCheckbox: true,
  divProps: { width: '60px', lineHeight: 1.2 }, // use for label
};

/** @constant
 * UUID filter
 *  @type {inputFilterType}
 */
export const uuidFilter = {
  key: 'uuid',
  label: 'UUID',
  placeholder: 'Enter uuid...',
  default: '',
  divProps: { width: '400px' },
};

/** @constant
 * Default Filters For Paging
 * Includes Search, MetadataTags, Sortby, Sort, and Author
 *  @type {inputFilterType}
 */
export const defaultInputFilters = [
  defaultSearch,
  defaultMetadataTags,
  defaultSortBy,
  defaultSortOrder,
  authoredByMeFilter,
];
export const defaultStatusedInputFilters = [
  defaultSearch,
  defaultMetadataTags,
  defaultStatusSortBy,
  defaultSortOrder,
  authoredByMeFilter,
];
/** @constant
 * Default Filters For Paging
 * Includes Search, Sortby, Sort and Author
 *  @type {inputFilterType}
 */
export const defaultUntaggedInputFilters = [
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  authoredByMeFilter,
];
export const defaultUntaggedStatusedInputFilters = [
  defaultSearch,
  defaultStatusSortBy,
  defaultSortOrder,
  authoredByMeFilter,
];

/** @constant
 * Default Filter Values
 * NOTE: should be kept in sync with the defaultInputFilters (individual default field) above
 * Includes search, sortBy, sort
 */
export const defaultHiddenFilterValues = {
  search: '',
  sortBy: 'dateEdited',
  sort: 'desc',
};
