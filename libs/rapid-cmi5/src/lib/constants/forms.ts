/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { lazy } from 'react';

/* Branded */
import {
  ascSortOrder,
  defaultSearch,
  defaultSortBy,
  inputFilterType,
} from '@rangeos-nx/ui/branded';

/* Topic */
import {
  Topic,
} from '@rangeos-nx/ui/api/hooks';
import {
  ksatElementTypeFilter,
  ksatsSortBy
} from './filters';
import ActionRowKsat from '../design-tools/rapidcmi5_mdx/editors/components/ActionRowKsat';


/* Forms */

// #endregion

/**
 * @interface MenuOptions
 * @property {tMenuOptionData} [key: string] Menu Options
 */
interface MenuOptions {
  [key: string]: tMenuOptionData;
}

/**
 * @typedef {Object} tMenuOptionData
 * @property {string} arrayFieldName Field name in Package Form
 * @property {string} form Form associated with topic
 * @property {string} [itemName] Overrides topic as field label in forms
 * @property {*} renderItem Render item used to display list row
 * @property {string} route Base route associated with topic
 * @property {*} [sortableColumns] Optional column(s) with filter information to allow sort
 *   example: see actionRowSortableColumns in ActionRow
 * @property {string[]} steps Selection modal id
 * @property {string[]} stepLabels View modal id
 * @property {string | number} stepWidth Overrides default width for Stepper
 * @property {inputFilterType[]} [visibleFilters] Override for Interactable filters presented to the user
 */
export type tMenuOptionData = {
  arrayFieldName: string;
  form?: any;
  dataIdField?: string;
  renderItem?: any;
  route?: string;
  overrideRoute?: string;
  itemName?: string;
  sortableColumns?: any;
  steps?: string[];
  stepLabels?: string[];
  stepTitles?: string[];
  stepWidth?: string | number;
  title?: string;
  visibleFilters?: inputFilterType[];
};

//#region custom sorts
export const ltiCourseSortBy = {
  ...defaultSortBy,
  options: ['courseId', 'scenarioId'],
  default: 'courseId',
};
//#endregion

/** @constant
 * Menu Options
 * Contains highly reusable constants for DB Topics
 *  @type {MenuOptions[]}
 */
export const menuOptionData: MenuOptions = {
  //#endregion
  [Topic.KSAT]: {
    arrayFieldName: '',
    dataIdField: 'element_identifier',
    renderItem: ActionRowKsat,
    route: undefined,
    title: 'KSATs',
    visibleFilters: [
      defaultSearch,
      ksatElementTypeFilter,
      ksatsSortBy,
      ascSortOrder,
    ],
  },
};
