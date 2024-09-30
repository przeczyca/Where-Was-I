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