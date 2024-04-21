interface MapButtonsProps {
    mapMode: string;
    changeMapMode: () => void;
    saveSelections: () => void;
}

function MapButtons(props: MapButtonsProps) {
    return (
        <div className="mapButtonsContainer">
            <button className="mapButton" onClick={props.changeMapMode}>{props.mapMode}</button>
            <button className="mapButton" onClick={props.saveSelections}>Save</button>
        </div>
    )
}

export default MapButtons;