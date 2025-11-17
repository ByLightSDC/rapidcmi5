/* defaults to be used by hooks */

import { config } from '@rangeos-nx/frontend/environment';

export const defaultSortOrderBy = 'dateEdited';
export const defaultSortOrder = 'desc'; // this will put the last edited at the top

// FOR PERM CACHING ADD : staleTime: Infinity,
export const defaultQueryConfig: any = {
  // DEFAULT CONFIG FOR CALLING ON MOUNT AND AVOIDING MULTI ERROR MESSAGES
  // READ MORE : https://react-query.tanstack.com/reference/useQuery
  retry: false,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
};

export let queryHooksConfig: any = {
  headers: { Authorization: `Bearer <put the token here>` },
};

export function getIsMSWMock(): boolean {
  return config.MSW_MOCK || false;
}

export function getGraphQLUrl(): string {
  return config.DEVOPS_GQL_URL || 'http://localhost';
}

export function getGraphQLSubscriptionsUrl(): string {
  return config.DEVOPS_GQL_SUBSCRIPTIONS_URL || 'http://localhost';
}

export function getKASMUrl(): string {
  return config.KASM_API_URL || 'http://localhost';
}

export const infiniteRecordLimit = 9999;

/**
 * Returns the nested object for metadata filtering
 * - currently this is the "list" of tags from metadataTags filter
 * @param reqOptions
 * @returns {} jsonObject to match against metadata.rangeOsUI.tagValues or empty object
 */
export function getMetadataFilterParam(reqOptions: any) {
  const metadataParam: { [key: string]: any } = {};
  if (reqOptions?.metadataTags) {
    metadataParam['rangeOsUI'] = {};
    let tagValues: { [key: string]: number } = {};
    const tags = reqOptions.metadataTags.split(/,\s*/); // in case there's a space after comma
    tags.forEach((tag: string) => {
      tagValues[`${tag}`] = 0;
    });
    metadataParam['rangeOsUI']['tagValues'] = tagValues;
  }
  return metadataParam;
}
