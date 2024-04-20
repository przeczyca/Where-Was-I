import { useCallback, useMemo, useState } from 'react';
import './App.css'
import Map, { Layer, Source } from 'react-map-gl';
import { countiesLayer, statesLayer, highlightCountiesLayer, highlightStatesLayer, selectedStatesLayer, selectedCountiesLayer } from './map-style';
import mapboxgl from 'mapbox-gl';

const token = import.meta.env.VITE_MAPBOX_TOKEN;

interface HoverInfo {
  longitude: number;
  latitude: number;
  countyName: string | undefined;
  stateName: string;
};

function App() {
  const [mapMode, setMapMode] = useState<string>('states');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedStates, setSelectedStates] = useState<Array<number>>([]);
  const [selectedCounties, setSelectedCounties] = useState<Array<{ countyName: string, stateName: string }>>([]);

  // ToDo: useEffect for getting selectedStatesAndCounties

  const changeMapMode = () => {
    if (mapMode === 'states') {
      setMapMode('counties');
      setHoverInfo(null);
    }
    else {
      setMapMode('states');
      setHoverInfo(null);
    }
  }

  const onHover = useCallback((event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (mapMode === 'states') {
      const state = event.features && event.features[0];
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lng,
        countyName: undefined,
        stateName: state && state.properties.state_name
      });
    }
    else {
      const county = event.features && event.features[0];
      setHoverInfo({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lng,
        countyName: county && county.properties.county_nam,
        stateName: county && county.properties.state_name
      })
    }
  }, [mapMode]);

  const onClick = (event: mapboxgl.EventData) => {
    if (mapMode === 'states') {
      const index = selectedStates.indexOf(event.features[0].properties.state_name);
      if (index > -1) {
        const newStateSelection = selectedStates.filter(state => state !== event.features[0].properties.state_name);
        setSelectedStates(newStateSelection);
      }
      else {
        setSelectedStates([...selectedStates, event.features[0].properties.state_name]);
      }
    }

    else if (mapMode === 'counties') {
      const index = selectedCounties.findIndex((county) => county.stateName === event.features[0].properties.state_name && county.countyName === event.features[0].properties.county_nam);
      if (index > -1) {
        const newCountySelection = selectedCounties.filter((county) => county.stateName !== event.features[0].properties.state_name || county.countyName !== event.features[0].properties.county_nam);
        setSelectedCounties(newCountySelection);
      }
      else {
        setSelectedCounties([...selectedCounties, { stateName: event.features[0].properties.state_name, countyName: event.features[0].properties.county_nam }]);
      }
    }
  }

  const hoverCounty = (hoverInfo && hoverInfo.countyName) || '';
  const hoverState = (hoverInfo && hoverInfo.stateName) || '';

  const countyHoverFilter = useMemo(() => ['all', ['in', 'county_nam', hoverCounty], ['in', 'state_name', hoverState]], [hoverCounty]);
  const stateHoverFilter = useMemo(() => ['in', 'state_name', hoverState], [hoverState]);

  const selectedStateFilter = useMemo(() => ['any', ...selectedStates.map((state) => ['in', 'state_name', state])], [selectedStates]);
  const selectedCountyFilter = useMemo(() => ['any', ...selectedCounties.map((county) => ['all', ['in', 'county_nam', county.countyName], ['in', 'state_name', county.stateName]])], [selectedCounties]);

  return (
    <div>
      <button onClick={changeMapMode}>{mapMode}</button>
      <button>Save</button>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          latitude: 38.88,
          longitude: -98,
          zoom: 3
        }}
        style={{ width: 600, height: 400 }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        onClick={onClick}
        onMouseMove={onHover}
        interactiveLayerIds={['counties', 'states']}
      >
        {mapMode === 'states' &&
          <Source type="vector" url='mapbox://przeczyca.cq49tua3'>
            <Layer {...statesLayer} />
            <Layer {...highlightStatesLayer} filter={stateHoverFilter} />
            <Layer {...selectedStatesLayer} filter={selectedStateFilter} />
          </Source>
        }
        {mapMode === 'counties' &&
          <Source type="vector" url="mapbox://przeczyca.8b30w66c">
            <Layer {...countiesLayer} />
            <Layer {...highlightCountiesLayer} filter={countyHoverFilter} />
            <Layer {...selectedCountiesLayer} filter={selectedCountyFilter} />
          </Source>
        }
      </Map>
    </div>
  )
}

export default App
