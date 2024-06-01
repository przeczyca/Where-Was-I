import { useContext, useState } from "react";
import { Themes } from "../Types";
import { ThemeContext } from "../context";
import { IconPalette, IconSelector } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

interface ColorMenuProps {

}

export default function ColorMenu() {
    const [colorMenu, setColorMenu] = useState(false);
    const [colorPicker, setColorPicker] = useState(false);
    const theme = useContext(ThemeContext);

    const showColorOptions = () => {
        console.log("show color options");
    }

    return (
        <div>
            <button className={"mapButton mapButton" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => setColorMenu(!colorMenu)}>
                <IconPalette />
            </button>
            <div className={"colorMenu mapButton" + (theme === Themes.Dark ? "Dark" : "Light")}>
                <div className="description">Default </div>
                <div className="square" />
                <IconSelector className="colorMenuIcon" onClick={() => setColorPicker(!colorPicker)} />
            </div>
        </div>
    )
}