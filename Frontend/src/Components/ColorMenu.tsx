import { useContext, useState } from "react";
import { Color, Themes } from "../Types";
import { ThemeContext } from "../context";
import { IconPalette } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

interface ColorMenuProps {

}

export default function ColorMenu() {
    const [colorMenu, setColorMenu] = useState(false);
    const [savedColors, setSavedColors] = useState<Color[]>([{Color_id: 1, Description: "Default", Hex_value: "#747bff"}]);
    const theme = useContext(ThemeContext);

    const onColorChange = (option: Color, value: string) => {
        const newSavedColors = savedColors.map((savedColorOption) => {
            if (savedColorOption.Color_id === option.Color_id) {
                savedColorOption.Hex_value = value;
            }
            return savedColorOption;
        });
        setSavedColors(newSavedColors);
    }

    return (
        <div>
            {!colorMenu &&
                <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => setColorMenu(!colorMenu)}>
                    <IconPalette />
                </button>
            }
            {colorMenu &&
                <div className={"colorMenuContainer theme" + (theme === Themes.Dark ? "Dark" : "Light")}>
                    <IconPalette className="palleteIcon" onClick={() => setColorMenu(!colorMenu)}/>
                    {savedColors.map((colorOption) => 
                        <div className="colorMenu" key={colorOption.Color_id}>
                            <div className="description">{colorOption.Description}</div>
                            <input
                                className="colorPicker"
                                type="color"
                                value={colorOption.Hex_value}
                                onChange={e => onColorChange(colorOption, e.target.value)}
                            />
                        </div>
                    )}
                    
                </div>
            }
            
            
        </div>
    )
}