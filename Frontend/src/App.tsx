import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css'
import { ColorMenuContext, ThemeContext } from './context'
import MapBoxMap, { Layer, Source } from 'react-map-gl';
import { areaLayer, selectedGNIS_IDLayer } from './map-style';
import mapboxgl, { FillLayer } from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapButtons from './Components/MapButtons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VisitedLocationsAPI } from './APIServices/VisitedLocationsAPI';
import { Color, HoverInfo, MapModes, SelectedGNIS_ID, Themes } from './Types';

const ENV = import.meta.env;
const token = ENV.VITE_MAPBOX_TOKEN_DEV;
const stateSource = ENV.VITE_STATE_SOURCE;
const countySource = ENV.VITE_COUNTY_SOURCE;

function App() {
  const [mapMode, setMapMode] = useState<MapModes>(MapModes.States);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedGNIS_IDs, setSelectedGNIS_IDs] = useState<Map<string, SelectedGNIS_ID>>(new Map());
  const [theme, setTheme] = useState(Themes.Dark);

  const useTestColors = () => {
    return [{ Color_id: 1, Description: "Default", Hex_value: "#747bff" }, { Color_id: 2, Description: "Default", Hex_value: "#747bff" }];
  }

  const [savedColors, setSavedColors] = useState<Color[]>(useTestColors());
  const [selectedColorID, setSelectedColorID] = useState(1);

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
      newGNISSelection.set(event.features[0].properties.gnis_id, { GNIS_ID: event.features[0].properties.gnis_id, Saved: false, Action: "selected", Color_id: selectedColorID });
    }
    else if (gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "deleted", Color_id: selectedColorID });
    }
    else if (gnis.Saved && gnis.Action == "deleted") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "selected", Color_id: selectedColorID });
    }
    else if (!gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
    }
    setSelectedGNIS_IDs(newGNISSelection);
  }

  const hoverArea = (hoverInfo && hoverInfo.gnis_id) || '';

  const hoverFilter = useMemo(() => ['in', 'gnis_id', hoverArea], [hoverArea]);

  const selectedGNIS_IDFilter = useMemo(() => {
    const filter = ['any', ...Array.from(selectedGNIS_IDs.values())
      .filter((selectedGNIS: SelectedGNIS_ID) => selectedGNIS.Action === 'selected')
      .map((selectedGNIS: SelectedGNIS_ID) => ['in', 'gnis_id', selectedGNIS.GNIS_ID])
    ];

    //console.log(filter);
    return filter;
  }, [selectedGNIS_IDs]);

  const hoverGNIS_IDLayer: FillLayer = useMemo(() => {
    return {
      id: 'gnis-highlighted',
      type: 'fill',
      paint: {
        'fill-outline-color': '#484896',
        'fill-color': savedColors.find((color) => color.Color_id === selectedColorID)?.Hex_value,
        'fill-opacity': 0.5
      }
    };
  }, [selectedColorID, savedColors]);

  const stateLayersWithFilters: any[] = useMemo(() => {
    const colorsAndPlaces = new Map<number, string[]>();
    savedColors.map((color) => {
      //index 0 is hex value
      colorsAndPlaces.set(color.Color_id, [color.Hex_value]);
    });

    selectedGNIS_IDs.forEach((gnis_id) => {
      colorsAndPlaces.get(gnis_id.Color_id)?.push(gnis_id.GNIS_ID);
    });

    const layers: any[] = [];

    const pushLayer = (layer: string[], key: number) => {
      if (layer.length > 1 && layer[0].charAt(0) === '#') {
        const hexValue = layer.shift();
        const layerOptions: FillLayer = {
          id: 'gnis-selected' + key,
          type: 'fill',
          paint: {
            'fill-outline-color': '#484896',
            'fill-color': hexValue,
            'fill-opacity': 0.75
          }
        };

        const filter = ['any', ...layer.map((savedGNIS_ID) => ['in', 'gnis_id', savedGNIS_ID])];

        layers.push(<Layer key={key} {...layerOptions} source-layer={stateSource} filter={filter} />);
      }
    }

    colorsAndPlaces.forEach(pushLayer);

    return layers;

  }, [savedColors, selectedGNIS_IDs]);

  const countyLayersWithFilters: any[] = useMemo(() => {
    const colorsAndPlaces = new Map<number, string[]>();
    savedColors.map((color) => {
      //index 0 is hex value
      colorsAndPlaces.set(color.Color_id, [color.Hex_value]);
    });

    selectedGNIS_IDs.forEach((gnis_id) => {
      colorsAndPlaces.get(gnis_id.Color_id)?.push(gnis_id.GNIS_ID);
    });

    const layers: any[] = [];

    const pushLayer = (layer: string[], key: number) => {
      if (layer.length > 1 && layer[0].charAt(0) === '#') {
        const hexValue = layer.shift();
        const layerOptions: FillLayer = {
          id: 'gnis-selected' + key,
          type: 'fill',
          paint: {
            'fill-outline-color': '#484896',
            'fill-color': hexValue,
            'fill-opacity': 0.75
          }
        };

        const filter = ['any', ...layer.map((savedGNIS_ID) => ['in', 'gnis_id', savedGNIS_ID])];

        layers.push(<Layer key={key} {...layerOptions} source-layer={countySource} filter={filter} />);
      }
    }

    colorsAndPlaces.forEach(pushLayer);

    return layers;

  }, [savedColors, selectedGNIS_IDs]);

  return (
    <div>
      <ColorMenuContext.Provider value={{ savedColors, setSavedColors, selectedColorID, setSelectedColorID }}>
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
              {stateLayersWithFilters}
            </Source>
          }
          {mapMode === MapModes.Counties &&
            <Source type="vector" url="mapbox://przeczyca.8b30w66c">
              <Layer {...areaLayer} source-layer={countySource} />
              <Layer {...hoverGNIS_IDLayer} source-layer={countySource} filter={hoverFilter} />
              {countyLayersWithFilters}
            </Source>
          }
        </MapBoxMap>
        <ThemeContext.Provider value={theme}>
          <MapButtons mapMode={mapMode} changeMapMode={changeMapMode} saveSelections={saveSelections} changeTheme={changeTheme} />
        </ThemeContext.Provider>
        <ToastContainer closeOnClick />
      </ColorMenuContext.Provider>
    </div>
  )
}

export default App