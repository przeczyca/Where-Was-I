import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css'
import { ColorMenuContext, ThemeContext } from './context'
import MapBoxMap, { Layer, Source } from 'react-map-gl';
import { areaLayer } from './map-style';
import mapboxgl, { FillLayer } from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import MapButtons from './Components/MapButtons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { VisitedLocationsAPI } from './APIServices/VisitedLocationsAPI';
import { Color, HoverInfo, MapModes, SelectedGNIS_ID, Themes } from './Types';
import { ColorAPI } from './APIServices/ColorAPI';

const ENV = import.meta.env;
const token = ENV.VITE_MAPBOX_TOKEN_DEV;
const stateSource = ENV.VITE_STATE_SOURCE;
const countySource = ENV.VITE_COUNTY_SOURCE;

function App() {
  const [mapMode, setMapMode] = useState<MapModes>(MapModes.States);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [selectedGNIS_IDs, setSelectedGNIS_IDs] = useState<Map<string, SelectedGNIS_ID>>(new Map());
  const [selectionsChanged, setSelectionsChanged] = useState(false);
  const [theme, setTheme] = useState(Themes.Dark);

  const [savedColors, setSavedColors] = useState<Color[]>([{ Action: "default", Color_ID: 1, Description: "Default", HexValue: "#747bff" }]);
  const [selectedColorID, setSelectedColorID] = useState(1);
  const [colorChanged, setColorChanged] = useState(false);

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

  const updateVisitedLocations = () => {
    VisitedLocationsAPI.getVisitedLocations()
      .then(data => {
        setSelectedGNIS_IDs(newSelectedGNIS_IDs(data));
        setSelectionsChanged(false);
      }).catch(error => {
        toast.error("Could not get saved locations.", { theme: theme });
        console.log(error);
      });
  }

  const updateColors = () => new Promise<Color[]>(resolve => {
    ColorAPI.getColors()
      .then(data => {
        if (data instanceof TypeError) {
          // set default color anyway
          setSavedColors([{ Action: "default", Color_ID: 1, Description: "Default", HexValue: "#747bff" }]);
          setColorChanged(false);
          throw new Error("TypeError");
        }
        setSavedColors(data);
        resolve(data);
      })
      .catch(error => {
        toast.error("Could not get saved colors.", { theme: theme });
        console.log(error);
      });
  })

  useEffect(() => {
    updateVisitedLocations();
    updateColors();
  }, []);

  const saveLocationSelections = (updatedColors: Color[]) => new Promise(resolve => {
    const selections = Array.from(selectedGNIS_IDs.values());
    let index = 0;
    const colorIDMap = new Map<number, number>();
    savedColors.forEach((savedColor) => {
      if (savedColor.Action === "created") {
        colorIDMap.set(savedColor.Color_ID, updatedColors[index].Color_ID);
        index += 1;
      }
      else if (savedColor.Action !== "deleted") {
        index += 1;
      }
    });

    selections.forEach((selection, index) => {
      if (selection.Color_ID < 0 && colorIDMap.get(selection.Color_ID) !== undefined) {
        selections[index] = {
          GNIS_ID: selection.GNIS_ID,
          Saved: selection.Saved,
          Action: selection.Action,
          Color_ID: colorIDMap.get(selection.Color_ID) as number
        }
      }
    });

    VisitedLocationsAPI.saveSelectedLocations(selections)
      .then(data => {
        setSelectedGNIS_IDs(newSelectedGNIS_IDs(data));
        setSelectionsChanged(false);
        resolve("locations saved");
      })
      .catch(error => {
        toast.error("Oops, something went wrong :(", { theme: theme });
        console.log(error);
      });
  })

  const saveColorChanges = () => new Promise<Color[]>(resolve => {
    ColorAPI.patchColors(savedColors)
      .then(data => {
        if (data instanceof TypeError) {
          throw new Error("something went wrong");
        }
        return data;
      })
      .then(async () => {
        const updatedColors = await updateColors();
        resolve(updatedColors);
      })
      .catch(error => {
        console.log(error);
        toast.error("Oops, something went wrong :(", { theme: theme });
      });
  })

  async function saveSelections() {
    let updatedColors: Color[] = [];
    if (colorChanged) {
      updatedColors = await saveColorChanges();
    }
    if (selectionsChanged) {
      await saveLocationSelections(updatedColors);
    }
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
      newGNISSelection.set(event.features[0].properties.gnis_id, { GNIS_ID: event.features[0].properties.gnis_id, Saved: false, Action: "selected", Color_ID: selectedColorID });
    }
    else if (gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "deleted", Color_ID: selectedColorID });
    }
    else if (gnis.Saved && gnis.Action == "deleted") {
      newGNISSelection.delete(gnis.GNIS_ID);
      newGNISSelection.set(gnis.GNIS_ID, { GNIS_ID: gnis.GNIS_ID, Saved: gnis.Saved, Action: "selected", Color_ID: selectedColorID });
    }
    else if (!gnis.Saved && gnis.Action == "selected") {
      newGNISSelection.delete(gnis.GNIS_ID);
    }
    setSelectedGNIS_IDs(newGNISSelection);
    setSelectionsChanged(true);
  }

  const hoverArea = (hoverInfo && hoverInfo.gnis_id) || '';

  const hoverFilter = useMemo(() => ['in', 'gnis_id', hoverArea], [hoverArea]);

  const hoverGNIS_IDLayer: FillLayer = useMemo(() => {
    return {
      id: 'gnis-highlighted',
      type: 'fill',
      paint: {
        'fill-outline-color': '#484896',
        'fill-color': savedColors.find((color) => color.Color_ID === selectedColorID)?.HexValue,
        'fill-opacity': 0.5
      }
    };
  }, [selectedColorID, savedColors]);

  const generateColorsAndPlacesMap = () => {
    const colorsAndPlaces = new Map<number, string[]>();
    savedColors.map((color) => {
      //index 0 is hex value
      colorsAndPlaces.set(color.Color_ID, [color.HexValue]);
    });

    selectedGNIS_IDs.forEach((gnis_id) => {
      if (gnis_id.Action !== "deleted") {
        colorsAndPlaces.get(gnis_id.Color_ID)?.push(gnis_id.GNIS_ID);
      }
    });

    return colorsAndPlaces;
  }

  const getLayers = (layers: any[], colorsAndPlaces: Map<number, string[]>, source: string) => {
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

        layers.push(<Layer key={key} {...layerOptions} source-layer={source} filter={filter} />);
      }
    }

    colorsAndPlaces.forEach(pushLayer);

    return layers;
  }

  const layersWithFilters: any[] = useMemo(() => {
    const colorsAndPlaces = generateColorsAndPlacesMap();

    const layers: any[] = [];

    return getLayers(layers, colorsAndPlaces, mapMode === MapModes.States ? stateSource : countySource);

  }, [savedColors, selectedGNIS_IDs, mapMode]);

  return (
    <div>
      <ColorMenuContext.Provider value={{ savedColors, setSavedColors, selectedColorID, setSelectedColorID, selectedGNIS_IDs, setSelectedGNIS_IDs, setColorChanged }}>
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
              {layersWithFilters}
            </Source>
          }
          {mapMode === MapModes.Counties &&
            <Source type="vector" url="mapbox://przeczyca.8b30w66c">
              <Layer {...areaLayer} source-layer={countySource} />
              <Layer {...hoverGNIS_IDLayer} source-layer={countySource} filter={hoverFilter} />
              {layersWithFilters}
            </Source>
          }
        </MapBoxMap>
        <ThemeContext.Provider value={theme}>
          <MapButtons mapMode={mapMode} changeMapMode={changeMapMode} saveChanges={saveSelections} changeTheme={changeTheme}
            selectionsChanged={selectionsChanged} colorChanged={colorChanged}
          />
        </ThemeContext.Provider>
        <ToastContainer closeOnClick />
      </ColorMenuContext.Provider>
    </div>
  )
}

export default App