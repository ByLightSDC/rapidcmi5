/* eslint-disable @typescript-eslint/no-explicit-any */

import { MigrationManifest } from 'redux-persist/es/types';

export const CURRENT_STORE_VERSION = 0;

/**
 * Handles data in persisted store that needs to be migrated
 * Ex. new values that would be missing in persisted store
 * To add a migration, increment the version in persistConfig below
 * and define data migrations in this switch case
 */
export const storeMigrations: MigrationManifest = {

};
