/*
https://www.react-simple-maps.io/docs/zoomable-group/
*/
import { useState } from 'react';

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';
import { geoPath } from 'd3-geo';

import TextField from '@mui/material/TextField';

const geojson = require('./countries-110m.json');

export const RSMap = (props: { lat: number; lon: number }) => {
  const [scale, setScale] = useState<number>(1.5);
  const [longitude, setLon] = useState<number>(props.lon);
  const [latitude, setLat] = useState<number>(props.lat);

  const handleClick = (e: any, geo: any, projection: any) => {
    //code from Markers
    //const [x, y] = projection(coordinates)

    const gPath = geoPath().projection(projection);
    const dim = e.target.getBoundingClientRect();
    const cx = e.clientX - dim.left;
    const cy = e.clientY - dim.top;

    const [geoX, geoY] = gPath.bounds(geo)[0];

    //we need root SVG element of our map
    const svg = e.nativeEvent.path[4];

    //adjust for SVG width on the page / internal rendering width
    const adjustScale = scale * (svg.clientWidth / svg.viewBox.baseVal.width);

    // these are the coords in SVG coordinate system
    const clickCoordsInsideSvg = [
      geoX + cx / adjustScale,
      geoY + cy / adjustScale,
    ];

    const coords = projection.invert(clickCoordsInsideSvg);
    setLon(coords[0]);
    setLat(coords[1]);
    /*console.log('projection', projection);*/
    //projection.invert(clickCoordsInsideSvg)

    /*console.log('test');
    console.log('lon lat', lon + ',' + lat);
    console.log(typeof geo.svgPath);
    const arr = geo.svgPath.substring(1).split(',');//.reverse.join(',');
    console.log('arrStr', arr)
    console.log(projection.invert(geo.svgPath));*/
  };

  const onChangeLon = (e: any) => {
    setLon(Number(e.target.value));
  };

  const onChangeLat = (e: any) => {
    setLat(Number(e.target.value));
  };

  const onChangeScale = (e: any) => {
    setScale(Number(e.target.value));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <TextField
          id="lon"
          name="lon"
          margin="dense"
          variant="outlined"
          label="Lon"
          value={longitude}
          size="small"
          onChange={onChangeLon}
        />
        <TextField
          id="lat"
          name="lat"
          margin="dense"
          variant="outlined"
          label="Lat"
          value={latitude}
          size="small"
          onChange={onChangeLat}
        />
        <TextField
          id="scale"
          name="scale"
          margin="dense"
          variant="outlined"
          label="Scale"
          value={scale}
          size="small"
          onChange={onChangeScale}
        />
      </div>
      <div>
        <ComposableMap projection="geoMercator">
          <ZoomableGroup
            zoom={scale}
            onMoveEnd={({ coordinates, zoom }) => {
              setScale(zoom);
            }}
          >
            <Geographies
              geography={geojson}
              stroke="black"
              fill="#0063BF"
              enableBackground="false"
            >
              {({ geographies, projection }) =>
                geographies.map((geo: any) => {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                      onClick={(e) => handleClick(e, geo, projection)}
                    />
                  );
                })
              }
            </Geographies>
            <Marker coordinates={[longitude, latitude]}>
              <circle r={8} fill="rgba(4, 135, 77, 0.8)" />
            </Marker>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};
