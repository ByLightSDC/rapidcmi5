/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';

import { useGetRegions, useQueryDetails } from '@rangeos-nx/ui/api/hooks';
import { EnvironmentAwsRegion } from '@rangeos-nx/frontend/clients/devops-api';

import {
  FormControlSelectField,
  FormControlUIContext,
} from '@rangeos-nx/ui/branded';

/* MUI */
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';

const noDataAvailableMsg = 'Regions and Zones Are Currently Unavailable';

/**
 * @typedef {Object} tFieldProps
 * @property {boolean} readOnly Whether field(s) should be readOnly (not editable)
 * @property {string} [regionField='awsRegion'] Form field for regions
 * @property {string} [zoneField='awsAvailabilityZone'] Form field for zones
 * @property {string} [regionErrorProperty] Property in passed errors if different from full region field
 * @property {string} [zoneErrorProperty] Property in passed errors if different from full zone field
 * @property {boolean} [abbreviateZone = false] Whether to save value as zone letter only (e.g. 'a' instead of 'us-east-1a')
 * @property {any} errors Form errors
 */
type tFieldProps = {
  readOnly: boolean;
  regionField?: string;
  zoneField?: string;
  regionErrorProperty?: string;
  zoneErrorProperty?: string;
  abbreviateZone?: boolean;
  errors: any;
};
/**
 * Range Region / Zone Selection Fields
 * @param {tFieldProps} props field props
 * @return {JSX.Element} Render elements
 */
export default function RegionZoneFields({
  readOnly,
  regionField = 'awsRegion',
  zoneField = 'awsAvailabilityZone',
  regionErrorProperty,
  zoneErrorProperty,
  abbreviateZone = false,
  errors,
}: tFieldProps) {
  const { formMethods } = useContext(FormControlUIContext);
  const { control, clearErrors, setError, setValue, watch } = formMethods;

  //#region Region / Zone field dependencies
  const [regions, setRegions] = useState<EnvironmentAwsRegion[]>([]);
  const [zones, setZones] = useState<string[]>([]);

  const watchRegionField = watch(regionField);
  const watchZoneField = watch(zoneField);
  const regionErrorField = regionErrorProperty
    ? regionErrorProperty
    : regionField;
  const zoneErrorField = zoneErrorProperty ? zoneErrorProperty : zoneField;

  const regionQuery = useGetRegions();
  useQueryDetails({
    queryObj: regionQuery,
    errorFunction: (errorState: any) => {
      setError(regionField, {
        type: 'unavailable',
        message: noDataAvailableMsg,
      });
      setError(zoneField, {
        type: 'unavailable',
        message: noDataAvailableMsg,
      });
    },
    successFunction: (data: EnvironmentAwsRegion[]) => {
      if (data.length === 0) {
        setError(regionField, {
          type: 'unavailable',
          message: noDataAvailableMsg,
        });
        setError(zoneField, {
          type: 'unavailable',
          message: noDataAvailableMsg,
        });
      } else {
        clearErrors(regionField, zoneField);
      }
      setRegions([...data]);
    },
    // since region.zone is only editable on create - show error only then
    shouldDisplayToaster: !readOnly,
  });

  // need to default values for select fields or on change of Region
  useEffect(() => {
    const setZonesForRegion = (region: string) => {
      if (regions.length > 0) {
        const regionIndex = regions.findIndex((item) => item.region === region);
        let zones: string[] = [];
        if (regionIndex === -1) {
          zones = regions[0].zones || [];
        } else {
          zones = regions[regionIndex].zones || [];
        }
        setZones(zones || []);

        // default associated zone if not already set to a valid value
        let testZone = watchZoneField;
        if (watchZoneField && abbreviateZone) {
          testZone = region + watchZoneField;
        }
        if (!testZone || zones.indexOf(testZone) === -1)
          setValue(
            zoneField,
            zones?.length > 0
              ? abbreviateZone
                ? zones[0].replace(watchRegionField, '')
                : zones[0]
              : '',
          );
      }
    };

    if (regionQuery.isSuccess && !regionQuery.isLoading) {
      if (!readOnly) {
        // need to default values for select fields
        if (!watchRegionField) {
          if (regions.length > 0) {
            setValue(regionField, regionQuery.data[0].region);
            setZonesForRegion(regions[0].region || '');
          }
        } else {
          // for change region - reset the zone(s) list/default
          setZonesForRegion(watchRegionField);
        }
      }
    }
  }, [
    readOnly,
    regionQuery.isLoading,
    regionQuery.isSuccess,
    regions,
    watchRegionField,
  ]);
  //#endregion

  if (!regionQuery.isLoading && !regionQuery.isFetching) {
    const regionError =
      errors && Object.prototype.hasOwnProperty.call(errors, regionErrorField)
        ? errors[regionErrorField].message
        : '';
    const zoneError =
      errors && Object.prototype.hasOwnProperty.call(errors, zoneErrorField)
        ? errors[zoneErrorField].message
        : '';

    return (
      <>
        <Grid item>
          <FormControlSelectField
            error={Boolean(regionError)}
            helperText={regionError}
            control={control}
            name={regionField}
            required
            label="Region"
            readOnly={readOnly}
            sxProps={{ minWidth: '150px' }}
          >
            {regions.map((item) => (
              <MenuItem key={item.region} value={item.region}>
                {item.region}
              </MenuItem>
            ))}
          </FormControlSelectField>
        </Grid>
        <Grid item>
          <FormControlSelectField
            error={Boolean(zoneError)}
            helperText={zoneError}
            control={control}
            name={zoneField}
            required
            label="Zone"
            readOnly={readOnly}
            sxProps={{ minWidth: '150px' }}
          >
            {zones.map((zone) => {
              const displayZone = abbreviateZone
                ? zone.replace(watchRegionField, '')
                : zone;
              return (
                // minHeight is so that the "non-required" - empty value has same height as other(s)
                <MenuItem
                  key={displayZone}
                  value={displayZone}
                  style={{ minHeight: '24px' }}
                >
                  {displayZone}
                </MenuItem>
              );
            })}
          </FormControlSelectField>
        </Grid>
      </>
    );
  }
  return null;
}
