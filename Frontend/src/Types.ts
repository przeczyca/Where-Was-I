export interface SelectedGNIS_ID {
    GNIS_ID: string;
    Saved: boolean;
    Action: string;
}

export interface HoverInfo {
    longitude: number;
    latitude: number;
    gnis_id: string;
}

export enum MapModes {
    States = "States",
    Counties = "Counties"
}

export enum Themes {
    Light = "light",
    Dark = "dark"
}