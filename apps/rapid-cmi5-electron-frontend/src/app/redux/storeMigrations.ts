/* eslint-disable @typescript-eslint/no-explicit-any */

import { MigrationManifest } from 'redux-persist/es/types';

export const CURRENT_STORE_VERSION = 1;

/**
 * Handles data in persisted store that needs to be migrated
 * Ex. new values that would be missing in persisted store
 * To add a migration, increment the version in persistConfig below
 * and define data migrations in this switch case
 */
export const storeMigrations: MigrationManifest = {
  0: (state: any) => {
    // migration clear out scenario designer instances
    return {
      ...state,
      project: {
        ...state.project,
        instances: undefined,
        project_range: undefined,
        project_resource_scenario_uuid: undefined,
      },
    };
  },
  1: (state: any) => {
    // migration clear out scenario designer instances
    return {
      ...state,
    };
  },
};
