import { IconSun, IconMoon } from '@tabler/icons-react';
import { useContext } from 'react';
import { ThemeContext } from '../context';
import { MapModes, Themes } from '../Types';
import ColorMenu from './ColorMenu';

interface MapButtonsProps {
    mapMode: MapModes;
    changeMapMode: () => void;
    saveChanges: () => void;
    changeTheme: () => void;
    selectionsChanged: boolean;
    colorChanged: boolean;
}

function MapButtons(props: MapButtonsProps) {
    const theme = useContext(ThemeContext);

    return (
        <div className="mapButtonsContainer">
            <ColorMenu />
            <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.changeMapMode}>{props.mapMode}</button>
            {(props.selectionsChanged || props.colorChanged) &&
                <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.saveChanges}>Save Changes</button>
            }
            <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={props.changeTheme}>
                {theme === Themes.Dark && <IconMoon />}
                {theme === Themes.Light && <IconSun />}
            </button>
        </div>
    )
}

export default MapButtons;