import { IconSun, IconMoon } from '@tabler/icons-react';
import { useContext } from 'react';
import { ThemeContext } from '../context';
import { MapModes, Themes } from '../Types';
import ColorMenu from './ColorMenu';

interface MapButtonsProps {
    mapMode: MapModes;
    changeMapMode: () => void;
    saveSelections: () => void;
    changeTheme: () => void;
}

function MapButtons(props: MapButtonsProps) {
    const theme = useContext(ThemeContext);

    return (
        <div className="mapButtonsContainer">
            <ColorMenu></ColorMenu>
            <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.changeMapMode}>{props.mapMode}</button>
            <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.saveSelections}>Save</button>
            <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.changeTheme}>
                {theme === Themes.Dark && <IconMoon />}
                {theme === Themes.Light && <IconSun />}
            </button>
        </div>
    )
}

export default MapButtons;