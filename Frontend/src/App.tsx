import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css'
import { ThemeContext } from './context'
import MapBoxMap, { Layer, Source } from 'react-map-gl';
import { areaLayer, hoverGNIS_IDLayer, selectedGNIS_IDLayer } from './map-style';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapButtons from './Components/MapButtons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VisitedLocationsAPI } from './APIServices/VisitedLocationsAPI';
import { HoverInfo, MapModes, SelectedGNIS_ID, Themes } from './Types';

const ENV = import.meta.env;
const token = ENV.VITE_MAPBOX_TOKEN_DEV;
const stateSource = ENV.VITE_STATE_SOURCE;
const countySource = ENV.VITE_COUNTY_SOURCE;

function App() {
  const [mapMode, setMapMode] = useState<MapModes>(MapModes.States);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedGNIS_IDs, setSelectedGNIS_IDs] = useState<Map<string, SelectedGNIS_ID>>(new Map());
  const [theme, setTheme] = useState(Themes.Dark);

  const changeMapMode = () => {
    switch (mapMode) {
      case MapModes.States:
        setMapMode(MapModes.Counties);
        break;
      case MapModes.Counties:
        setMapMode(MapModes.States);
        break;
    }
    setHoverInfo(null);
  }

  const changeTheme = () => {
    switch (theme) {
      case Themes.Dark:
        setTheme(Themes.Light);
        return;
      case Themes.Light:
        setTheme(Themes.Dark);
    }
  }

  const newSelectedGNIS_IDs = (data: SelectedGNIS_ID[]) => {
    const newMap = new Map<string, SelectedGNIS_ID>()
    if (data) {
      data.map((visitedLocation: SelectedGNIS_ID) => {
        newMap.set(visitedLocation.GNIS_ID, visitedLocation);
      });
    }
    return newMap;
  }

  useEffect(() => {
    VisitedLocationsAPI.getVisitedLocations()
      .then(data => setSelectedGNIS_IDs(newSelectedGNIS_IDs(data)))
      .catch(error => {
        toast.error("Could not get saved locations.", { theme: theme });
        console.log(error);
      });
  }, []);

  const saveSelections = () => {
    const selections = Array.from(selectedGNIS_IDs.values());
    VisitedLocationsAPI.saveSelectedLocations(selections)
      .then(data => setSelectedGNIS_IDs(newSelectedGNIS_IDs(data)))
      .catch(error => {
        toast.error("Oops, something went wrong :(", { theme: theme });
        console.log(error);
      });

    //GitHub Pages error toast
    //toast.error("GitHub Pages is front-end only, no server or database here :(", { theme: themeValue });
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
    if (event.features[0] === undefined) {
      return;
    }

    const gnis = selectedGNIS_IDs.get(event.features[0].properties.gnis_id);
    const newGNISSelection = new Map(selectedGNIS_IDs);
    if (gnis === undefined) {
      newGNISSelection.set(event.features[0].properties.gnis_id, { GNIS_ID: event.features[0].properties.gnis_id, Saved: false, Action: "selected" });
    }
    else if (gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "deleted" });
    }
    else if (gnis.Saved && gnis.Action == "deleted") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "selected" });
    }
    else if (!gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
    }
    setSelectedGNIS_IDs(newGNISSelection);
  }

  const hoverArea = (hoverInfo && hoverInfo.gnis_id) || '';

  const hoverFilter = useMemo(() => ['in', 'gnis_id', hoverArea], [hoverArea]);

  const selectedGNIS_IDFilter = useMemo(() => ['any', ...Array.from(selectedGNIS_IDs.values())
    .filter((selectedGNIS: SelectedGNIS_ID) => selectedGNIS.Action === 'selected')
    .map((selectedGNIS: SelectedGNIS_ID) => ['in', 'gnis_id', selectedGNIS.GNIS_ID])
  ], [selectedGNIS_IDs]);

  return (
    <div>
      <MapBoxMap
        mapboxAccessToken={token}
        initialViewState={{
          latitude: 38.88,
          longitude: -98,
          zoom: 3
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={`mapbox://styles/mapbox/${theme}-v11`}
        onClick={onClick}
        onMouseMove={onHover}
        interactiveLayerIds={['counties', 'states']}
      >
        {mapMode === MapModes.States &&
          <Source type="vector" url='mapbox://przeczyca.cq49tua3'>
            <Layer {...areaLayer} source-layer={stateSource} />
            <Layer {...hoverGNIS_IDLayer} source-layer={stateSource} filter={hoverFilter} />
            <Layer {...selectedGNIS_IDLayer} source-layer={stateSource} filter={selectedGNIS_IDFilter} />
          </Source>
        }
        {mapMode === MapModes.Counties &&
          <Source type="vector" url="mapbox://przeczyca.8b30w66c">
            <Layer {...areaLayer} source-layer={countySource} />
            <Layer {...hoverGNIS_IDLayer} source-layer={countySource} filter={hoverFilter} />
            <Layer {...selectedGNIS_IDLayer} source-layer={countySource} filter={selectedGNIS_IDFilter} />
          </Source>
        }
      </MapBoxMap>
      <ThemeContext.Provider value={theme}>
        <MapButtons mapMode={mapMode} changeMapMode={changeMapMode} saveSelections={saveSelections} changeTheme={changeTheme} />
      </ThemeContext.Provider>
      <ToastContainer closeOnClick />
    </div>
  )
}

export default App