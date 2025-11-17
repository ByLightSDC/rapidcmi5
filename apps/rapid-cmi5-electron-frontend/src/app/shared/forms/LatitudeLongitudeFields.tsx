/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/*
 * This component provides form controlled fields for Latitude / Longitude AND selecting point on map
 *
 * params:
 *   - latitudeFieldName - Database name of latitude field
 *   - longitudeFieldName - Database name of longitude field
 *   - readOnly (optional): indicate that fields/buttons should be disabled (default: false)
 *   - required (optional): Indication that this field is required (default: true)
 *
 *   form functions (returned from useForm) are required to access the field information
 *    - control -- for handling field directly
 *    - errors -- for displaying any error on lat / lon field
 *    - setValue -- to set the lat/lon selected on map into form fields for update
 *    - trigger -- to be able to make form check lat/lon when the other one changes
 *    - watch -- to monitor lat/lon change so we can trigger the extra validation
 *
 * NOTE: Validation for lat/lon fields need to be defined in the validationSchema sent to useForm
 *       See LatitudeLongitudeFields.stories.tsx for example of schema
 *
 */
import { useEffect, useState } from 'react';

/* MUI */
import Grid from '@mui/material/Grid';

import {
  ButtonSelectUi,
  FormControlTextField,
  ModalDialog,
} from '@rangeos-nx/ui/branded';

import OLMapView from '../components/data-display/maps/OLMapView';
import { latitudeRegex, longitudeRegex } from '@rangeos-nx/ui/validation';

type tLatLonFieldProps = {
  control: any;
  errors: any;
  latitudeFieldName: string;
  longitudeFieldName: string;
  readOnly?: boolean;
  required?: boolean;
  setValue: (name: string, value: unknown, config?: Object) => void;
  trigger: (name?: string | string[]) => Promise<boolean>;
  watch: (names?: string | string[]) => unknown;
};

export function LatitudeLongitudeFields({
  control,
  errors,
  latitudeFieldName,
  longitudeFieldName,
  readOnly = false,
  required = false,
  setValue,
  trigger,
  watch,
}: tLatLonFieldProps) {
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [location, setLocation] = useState<Record<string, string>>({
    latitude: '',
    longitude: '',
  });

  const watchLatitudeField = watch(latitudeFieldName) as string;
  const watchLongitudeField = watch(longitudeFieldName) as string;

  useEffect(() => {
    // only update the location in state if this is valid
    if (latitudeRegex.test(watchLatitudeField)) {
      setLocation((prevLocation: Record<string, string>) => {
        return {
          ...prevLocation,
          latitude: watchLatitudeField,
        };
      });
    }
    trigger([latitudeFieldName, longitudeFieldName]);
  }, [watchLatitudeField]);

  useEffect(() => {
    // only update the location in state if this is valid
    if (longitudeRegex.test(watchLongitudeField)) {
      setLocation((prevLocation: Record<string, string>) => {
        return {
          ...prevLocation,
          longitude: watchLongitudeField,
        };
      });
    }
    trigger([latitudeFieldName, longitudeFieldName]);
  }, [watchLongitudeField]);

  const handleMapButtonAction = (index: number) => {
    switch (index) {
      case 0: //cancel
        // reset internal location to current field values
        setLocation({
          latitude: watchLatitudeField,
          longitude: watchLongitudeField,
        });
        break;
      case 1: //apply
        setValue(latitudeFieldName, location['latitude']);
        setValue(longitudeFieldName, location['longitude']);
        trigger([latitudeFieldName, longitudeFieldName]);
        break;
      default:
        break;
    }
    setMapDialogOpen(false);
  };

  const latitudeError =
    errors && Object.prototype.hasOwnProperty.call(errors, latitudeFieldName)
      ? errors[latitudeFieldName].message
      : '';
  const longitudeError =
    errors && Object.prototype.hasOwnProperty.call(errors, longitudeFieldName)
      ? errors[longitudeFieldName].message
      : '';

  return (
    <>
      <ModalDialog
        buttons={['Cancel', 'Apply']}
        dialogProps={{ fullWidth: true, open: mapDialogOpen }}
        testId="map-view-dialog"
        title="Click on the map to choose your location..."
        handleAction={handleMapButtonAction}
      >
        <OLMapView location={location} setLocation={setLocation} />
      </ModalDialog>

      {!readOnly && (
        <Grid item xs={0.8}>
          <ButtonSelectUi
            id="select-map"
            onClick={() => setMapDialogOpen(true)}
          />
        </Grid>
      )}
      <Grid item xs={2.2}>
        <FormControlTextField
          control={control}
          error={Boolean(latitudeError)}
          helperText={latitudeError}
          name={latitudeFieldName}
          label="Latitude"
          readOnly={readOnly}
          required={required}
        />
      </Grid>
      <Grid item xs={2.2}>
        <FormControlTextField
          control={control}
          error={Boolean(longitudeError)}
          helperText={longitudeError}
          name={longitudeFieldName}
          label="Longitude"
          readOnly={readOnly}
          required={required}
        />
      </Grid>
    </>
  );
}
export default LatitudeLongitudeFields;
