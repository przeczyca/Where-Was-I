import type { FillLayer } from 'react-map-gl';

export const countiesLayer: FillLayer = {
    id: 'counties',
    type: 'fill',
    'source-layer': 'Merged_Counties-3s0th3',
    paint: {
        'fill-outline-color': 'rgba(0,0,0,0.1)',
        'fill-color': 'rgba(0,0,0,0)'
    }
};

export const statesLayer: FillLayer = {
    id: 'states',
    type: 'fill',
    'source-layer': 'Merged_States-992622',
    paint: {
        'fill-outline-color': 'rgba(0,0,0,0.1)',
        'fill-color': 'rgba(0,0,0,0)'
    }
};

export const highlightStatesLayer: FillLayer = {
    id: 'states-highlighted',
    type: 'fill',
    source: 'states',
    'source-layer': 'Merged_States-992622',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};

export const highlightCountiesLayer: FillLayer = {
    id: 'counties-highlighted',
    type: 'fill',
    source: 'counties',
    'source-layer': 'Merged_Counties-3s0th3',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};

export const selectedStatesLayer: FillLayer = {
    id: 'states-selected',
    type: 'fill',
    source: 'states',
    'source-layer': 'Merged_States-992622',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};

export const selectedCountiesLayer: FillLayer = {
    id: 'counties-selected',
    type: 'fill',
    source: 'counties',
    'source-layer': 'Merged_Counties-3s0th3',
    paint: {
        'fill-outline-color': '#484896',
        'fill-color': '#6e599f',
        'fill-opacity': 0.75
    }
};