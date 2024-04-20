import type { FillLayer } from 'react-map-gl';

export const areaLayer: FillLayer = {
    id: 'counties',
    type: 'fill',
    'source-layer': 'Merged_Counties-3s0th3',
    paint: {
        'fill-outline-color': 'rgba(0,0,0,0.1)',
        'fill-color': 'rgba(0,0,0,0)'
    }
};

export const hoverGNIS_IDLayer: FillLayer = {
    id: 'gnis-highlighted',
    type: 'fill',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};

export const selectedGNIS_IDLayer: FillLayer = {
    id: 'gnis-selected',
    type: 'fill',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};