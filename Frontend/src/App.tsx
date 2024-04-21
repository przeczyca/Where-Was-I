import { useCallback, useMemo, useState } from 'react';
import './App.css'
import Map, { Layer, Source } from 'react-map-gl';
import { areaLayer, hoverGNIS_IDLayer, selectedGNIS_IDLayer } from './map-style';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapButtons from './MapButtons';

const token = import.meta.env.VITE_MAPBOX_TOKEN;
const stateSource = import.meta.env.VITE_STATE_SOURCE;
const countySource = import.meta.env.VITE_COUNTY_SOURCE;

interface HoverInfo {
  longitude: number;
  latitude: number;
  gnis_id: string;
};

function App() {
  const [mapMode, setMapMode] = useState<string>('States');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedGNIS_IDs, setSelectedGNIS_IDs] = useState<Array<string>>([]);

  const changeMapMode = () => {
    if (mapMode === 'States') {
      setMapMode('Counties');
      setHoverInfo(null);
    }
    else {
      setMapMode('States');
      setHoverInfo(null);
    }
  }

  const saveSelections = () => {
    console.log(selectedGNIS_IDs);
  }

  const onHover = useCallback((event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const area = event.features && event.features[0];
    setHoverInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lng,
      gnis_id: area && area.properties.gnis_id
    });
  }, [mapMode]);

  const onClick = (event: mapboxgl.EventData) => {
    if (event.features[0]) {
      const index = selectedGNIS_IDs.indexOf(event.features[0].properties.gnis_id);
      if (index > -1) {
        const newGNISSelection = selectedGNIS_IDs.filter(state => state !== event.features[0].properties.gnis_id);
        setSelectedGNIS_IDs(newGNISSelection);
      }
      else {
        setSelectedGNIS_IDs([...selectedGNIS_IDs, event.features[0].properties.gnis_id]);
      }
    }
  }

  const hoverArea = (hoverInfo && hoverInfo.gnis_id) || '';

  const hoverFilter = useMemo(() => ['in', 'gnis_id', hoverArea], [hoverArea]);

  const selectedGNIS_IDFilter = useMemo(() => ['any', ...selectedGNIS_IDs.map((gnis_id) => ['in', 'gnis_id', gnis_id])], [selectedGNIS_IDs]);

  return (
    <div>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          latitude: 38.88,
          longitude: -98,
          zoom: 3
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onClick={onClick}
        onMouseMove={onHover}
        interactiveLayerIds={['counties', 'states']}
      >
        {mapMode === 'States' &&
          <Source type="vector" url='mapbox://przeczyca.cq49tua3'>
            <Layer {...areaLayer} source-layer={stateSource} />
            <Layer {...hoverGNIS_IDLayer} source-layer={stateSource} filter={hoverFilter} />
            <Layer {...selectedGNIS_IDLayer} source-layer={stateSource} filter={selectedGNIS_IDFilter} />
          </Source>
        }
        {mapMode === 'Counties' &&
          <Source type="vector" url="mapbox://przeczyca.8b30w66c">
            <Layer {...areaLayer} source-layer={countySource} />
            <Layer {...hoverGNIS_IDLayer} source-layer={countySource} filter={hoverFilter} />
            <Layer {...selectedGNIS_IDLayer} source-layer={countySource} filter={selectedGNIS_IDFilter} />
          </Source>
        }
      </Map>
      <MapButtons mapMode={mapMode} changeMapMode={changeMapMode} saveSelections={saveSelections} />
    </div>
  )
}

export default App
