export interface SelectedGNIS_ID {
    GNIS_ID: string;
    Saved: boolean;
    Action: string;
    Color_ID: number;
}

export interface HoverInfo {
    longitude: number;
    latitude: number;
    gnis_id: string;
}

export interface Color {
    Action: string;
    Color_ID: number;
    Description: string;
    HexValue: string;
}

export interface ColorMenuContextInterface {
    savedColors: Color[],
    setSavedColors: React.Dispatch<React.SetStateAction<Color[]>>,
    selectedColorID: number,
    setSelectedColorID: React.Dispatch<React.SetStateAction<number>>
    setColorChanged: React.Dispatch<React.SetStateAction<boolean>>
}

export enum MapModes {
    States = "States",
    Counties = "Counties"
}

export enum Themes {
    Light = "light",
    Dark = "dark"
}