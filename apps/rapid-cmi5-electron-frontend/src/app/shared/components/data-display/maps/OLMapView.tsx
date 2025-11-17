/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-props-no-spreading */
/*
Component for picking lon lat location from map
Uses lib that is not compatible with jest
Module requires mocking, see setupTests.js
*/

//TODO integrate with open dash tile source
//import { selectMetovaApiUrl } from '@metova/frontend.api.opendash';

import React, { useEffect, useRef, useState } from 'react';
import Feature from 'ol/Feature';
import { default as VectorLayer } from 'ol/layer/Vector';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import Point from 'ol/geom/Point';
import { default as SourceVector } from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transform } from 'ol/proj';
//#REF key for integrating with opendash import XYZ from 'ol/source/XYZ';

/* MUI */
import Typography from '@mui/material/Typography';

interface PropsMap {
  location: Record<string, string>;
  precision?: number;
  setLocation?: (value: Record<string, string>) => void;
}

export function OLMapView({ location, precision = 6, setLocation }: PropsMap) {
  const hasLatitude = location['latitude']?.length > 0;
  const hasLongitude = location['longitude']?.length > 0;
  const [lat, setLat] = useState<number>(
    hasLatitude ? Number(location['latitude']) : 0,
  );
  const [lon, setLon] = useState<number>(
    hasLongitude ? Number(location['longitude']) : 0,
  );
  const [locationExists, setLocationExists] = useState(
    hasLatitude && hasLongitude,
  );
  const decimalPrecision = Math.pow(10, precision);

  const mapRef = useRef(null);
  const mapVal = useRef<Map | null>(null);
  const sourceUrl = '';

  const point = new Point([lon, lat]);
  point.transform('EPSG:4326', 'EPSG:900913');

  useEffect(() => {
    function makeMap() {
      const ref = mapRef.current;
      if (ref === null) {
        setTimeout(makeMap, 1000);
        return;
      }

      if (mapVal.current !== null) {
        return;
      }

      /*REF const urlSource = new XYZ({
        url: `https://${sourceUrl}/epd/tms/tile/{z}/{x}/{y}.png`,
        // url: "https://tms.pcte.dev/tile/{z}/{x}/{y}.png",
      });*/

      // styling for the selected point on map
      const markerStyle = new Style({
        image: new Icon({
          imgSize: [32, 32],
          anchor: [16, 32],
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          src: '/assets/icons/MapMarker.svg',
          color: 'blue',
        }),
      });

      // set point on map with layer
      const marker = new Feature({
        geometry: point,
      });

      const markerLayer = new VectorLayer({
        source: new SourceVector({
          features: [marker],
        }),
        style: markerStyle,
      });

      const map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
            //REF source: urlSource,
          }),
        ],
        target: ref,
        controls: [],
        view: new View({ zoom: 0, center: fromLonLat([0, 0]) }),
      });
      map.addLayer(markerLayer);
      markerLayer.setVisible(locationExists);

      map.on('click', (e) => {
        point.setCoordinates(e.coordinate);
        markerLayer.setVisible(true);
        setLocationExists(true);
        const coordinates = transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
        const roundedLat =
          Math.round((coordinates[1] + Number.EPSILON) * decimalPrecision) /
          decimalPrecision;
        const roundedLon =
          Math.round((coordinates[0] + Number.EPSILON) * decimalPrecision) /
          decimalPrecision;
        setLon(roundedLon);
        setLat(roundedLat);

        if (setLocation) {
          const copy = { ...location };
          copy['latitude'] = roundedLat.toString();
          copy['longitude'] = roundedLon.toString();
          setLocation(copy);
        }
      });

      mapVal.current = map;
    }
    makeMap();
  }, [sourceUrl, location, setLocation]);

  const locationLabel =
    'Latitude: ' +
    (locationExists ? `${lat}` : '') +
    '    Longitude: ' +
    (locationExists ? `${lon}` : '');
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: '8px',
        flexDirection: 'column',
        padding: '0px 24px',
      }}
    >
      <Typography sx={{ whiteSpace: 'pre' }}>{locationLabel}</Typography>
      <div
        ref={mapRef}
        style={{
          borderStyle: 'solid',
          width: '100%',
          height: '400px',
        }}
      />
    </div>
  );
}

export default OLMapView;
