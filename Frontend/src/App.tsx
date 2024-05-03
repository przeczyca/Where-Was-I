import { useCallback, useMemo, useState } from 'react';
import './App.css'
import { ThemeContext } from './context'
import MapBoxMap, { Layer, Source } from 'react-map-gl';
import { areaLayer, hoverGNIS_IDLayer, selectedGNIS_IDLayer } from './map-style';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapButtons from './MapButtons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const token = import.meta.env.VITE_MAPBOX_TOKEN;
const stateSource = import.meta.env.VITE_STATE_SOURCE;
const countySource = import.meta.env.VITE_COUNTY_SOURCE;

interface HoverInfo {
  longitude: number;
  latitude: number;
  gnis_id: string;
};

interface SelectedGNIS_ID {
  gnis_id: string;
  saved: boolean;
  action: string;
}

function App() {
  const [mapMode, setMapMode] = useState<string>('States');
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedGNIS_IDs, setSelectedGNIS_IDs] = useState<Map<string, SelectedGNIS_ID>>(new Map());
  const [themeValue, setTheme] = useState("dark");

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

  const changeTheme = () => {
    if (themeValue === "dark") {
      setTheme("light");
    }
    else {
      setTheme("dark");
    }
  }

  const saveSelections = () => {
    const arrayOfSelected = Array.from(selectedGNIS_IDs.values());
    fetch('http://localhost:8080/visited', { method: 'POST', body: JSON.stringify(arrayOfSelected) })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => {
        toast.error("Oops, something went wrong :(");
        console.log(error);
      });

    //GitHub Pages error toast
    //toast.error("GitHub Pages is front-end only, no server or database here :(");
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
      const gnis = selectedGNIS_IDs.get(event.features[0].properties.gnis_id);
      const newGNISSelection = new Map(selectedGNIS_IDs);
      if (gnis) {
        if (gnis.saved && gnis.action == "selected") {
          newGNISSelection.delete(gnis.gnis_id);
          newGNISSelection.set(gnis.gnis_id, { gnis_id: gnis.gnis_id, saved: gnis.saved, action: "deleted" });
        }
        else if (gnis.saved && gnis.action == "deleted") {
          newGNISSelection.delete(gnis.gnis_id);
          newGNISSelection.set(gnis.gnis_id, { gnis_id: gnis.gnis_id, saved: gnis.saved, action: "selected" });
        }
        else if (!gnis.saved && gnis.action == "selected") {
          newGNISSelection.delete(gnis.gnis_id);
        }
      }
      else {
        newGNISSelection.set(event.features[0].properties.gnis_id, { gnis_id: event.features[0].properties.gnis_id, saved: false, action: "selected" });
      }
      setSelectedGNIS_IDs(newGNISSelection);
    }
  }

  const hoverArea = (hoverInfo && hoverInfo.gnis_id) || '';

  const hoverFilter = useMemo(() => ['in', 'gnis_id', hoverArea], [hoverArea]);

  const selectedGNIS_IDFilter = useMemo(() => ['any', ...Array.from(selectedGNIS_IDs.values()).map((selctedGNIS: SelectedGNIS_ID) => ['in', 'gnis_id', selctedGNIS.gnis_id])], [selectedGNIS_IDs]);

  return (
    <div>
      <MapBoxMap
        mapboxAccessToken={token}
        initialViewState={{
          latitude: 38.88,
          longitude: -98,
          zoom: 2.5
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={`mapbox://styles/mapbox/${themeValue}-v9`}
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
      </MapBoxMap>
      <ThemeContext.Provider value={themeValue}>
        <MapButtons mapMode={mapMode} changeMapMode={changeMapMode} saveSelections={saveSelections} changeTheme={changeTheme} />
      </ThemeContext.Provider>
      <ToastContainer closeOnClick />
    </div>
  )
}

export default App
