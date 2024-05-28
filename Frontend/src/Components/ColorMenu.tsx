import { useContext, useState } from "react";
import { Themes } from "../Types";
import { ThemeContext } from "../context";
import { IconPalette } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

interface ColorMenuProps {

}

export default function ColorMenu() {
    const [colorMenu, setColorMenu] = useState(false);
    const theme = useContext(ThemeContext);

    const openColorMenu = () => {

    }

    const closeColorMenu = () => {

    }

    return (
        <div>
            <button className={"mapButton mapButton" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={openColorMenu}>
                <IconPalette />
            </button>
            <div className={"colorMenu mapButton" + (theme === Themes.Dark ? "Dark" : "Light")}>
                <div className="description">Default </div>
                <div className="square" />
            </div>
        </div>
    )
}