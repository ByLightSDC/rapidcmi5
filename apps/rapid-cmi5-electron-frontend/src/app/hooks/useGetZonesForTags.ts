import { useEffect, useState } from 'react';
import { useGetRangeDnsZones, useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { RangeDNSZone } from '@rangeos-nx/frontend/clients/devops-api';

export function useGetZonesForTags() {
  const [zonesByTag, setZonesByTag] = useState<Record<string, string[]>>({});

  const zoneQuery = useGetRangeDnsZones();
  useQueryDetails({
    queryObj: zoneQuery,
  });

  /* eslint-disable no-prototype-builtins */
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (zoneQuery.isSuccess) {
      const tagList: Record<string, string[]> = {};

      const zones = zoneQuery.data?.data ? zoneQuery.data.data : zoneQuery.data;
      (zones as RangeDNSZone[]).forEach((zone: RangeDNSZone) => {
        if (zone.tagSelectors) {
          zone.tagSelectors.forEach((tag: string) => {
            if (tagList.hasOwnProperty(tag)) {
              tagList[tag].push(zone.name as string);
            } else {
              tagList[tag] = [zone.name as string];
            }
          });
        }
      });
      setZonesByTag(tagList);
    }
  }, [zoneQuery.isSuccess]);

  return [zonesByTag, zoneQuery.isSuccess] as const;
}
