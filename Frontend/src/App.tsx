import { useCallback, useEffect, useMemo, useState } from 'react';
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
  GNIS_ID: string;
  Saved: boolean;
  Action: string;
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

  useEffect(() => {
    fetch('http://localhost:8080/visited', { method: 'GET' })
      .then(response => response.json())
      .then(data => {
        const newMap = new Map<string, SelectedGNIS_ID>()
        data?.map((visitedLocation: SelectedGNIS_ID) => {
          newMap.set(visitedLocation.GNIS_ID, visitedLocation);
        });
        setSelectedGNIS_IDs(newMap);
      })
      .catch(error => {
        toast.error("Could not get saved locations.", { theme: themeValue });
        console.log(error);
      });
  }, []);

  const saveSelections = () => {
    const arrayOfSelected = Array.from(selectedGNIS_IDs.values());
    fetch('http://localhost:8080/visited', { method: 'POST', body: JSON.stringify(arrayOfSelected) })
      .then(response => response.json())
      .then(data => {
        const newMap = new Map<string, SelectedGNIS_ID>()
        data?.map((visitedLocation: SelectedGNIS_ID) => {
          newMap.set(visitedLocation.GNIS_ID, visitedLocation);
        });
        setSelectedGNIS_IDs(newMap);
      })
      .catch(error => {
        toast.error("Oops, something went wrong :(", { theme: themeValue });
        console.log(error);
      });

    //GitHub Pages error toast
    //toast.error("GitHub Pages is front-end only, no server or database here :(", {theme: themeValue});
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
        if (gnis.Saved && gnis.Action == "selected") {
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
      }
      else {
        newGNISSelection.set(event.features[0].properties.gnis_id, { GNIS_ID: event.features[0].properties.gnis_id, Saved: false, Action: "selected" });
      }
      setSelectedGNIS_IDs(newGNISSelection);
    }
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
