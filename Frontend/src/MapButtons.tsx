import { IconSun, IconMoon } from '@tabler/icons-react';
import { useContext } from 'react';
import { ThemeContext } from './context';

interface MapButtonsProps {
    mapMode: string;
    changeMapMode: () => void;
    saveSelections: () => void;
    changeTheme: () => void;
}

function MapButtons(props: MapButtonsProps) {
    const theme = useContext(ThemeContext);

    return (
        <div className="mapButtonsContainer">
            <button className={"mapButton mapButton" + (theme === "dark" ? "Dark" : "Light")} onClick={props.changeMapMode}>{props.mapMode}</button>
            <button className={"mapButton mapButton" + (theme === "dark" ? "Dark" : "Light")} onClick={props.saveSelections}>Save</button>
            <button className={"mapButton mapButton" + (theme === "dark" ? "Dark" : "Light")} onClick={props.changeTheme}>
                {theme === "dark" && <IconMoon />}
                {theme === "light" && <IconSun />}
            </button>
        </div>
    )
}

export default MapButtons;