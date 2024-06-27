import { MouseEvent, useContext, useState } from "react";
import { Color, Themes } from "../Types";
import { ThemeContext } from "../context";
import { IconPalette, IconPlus, IconTrash } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

interface ColorMenuProps {

}

export default function ColorMenu() {
    const [colorMenu, setColorMenu] = useState(false);
    const [savedColors, setSavedColors] = useState<Color[]>([{Color_id: 1, Description: "Default", Hex_value: "#747bff"}, {Color_id: 2, Description: "Default", Hex_value: "#747bff"}]);
    const [newColorIDCounter, setNewColorIDCounter] = useState(-1);
    const [selectedColorID, setSelectedColorID] = useState(1);
    const [currentDescription, setCurrentDescription] = useState("");
    const theme = useContext(ThemeContext);

    const onColorChange = (option: Color, value: string) => {
        const newSavedColors = savedColors.map((color) => {
            if (color.Color_id === option.Color_id) {
                color.Hex_value = value;
            }
            return color;
        });
        setSavedColors(newSavedColors);
    }

    const addColor = () => {
        setSavedColors([...savedColors, {Color_id: newColorIDCounter, Description: "Default", Hex_value: "#747bff"}]);
        setSelectedColorID(newColorIDCounter);
        setNewColorIDCounter(newColorIDCounter - 1);
    }

    const deleteColor = (e: MouseEvent, toDelete: Color) => {
        e.stopPropagation();
        const i = savedColors.findIndex((color) => color.Color_id === toDelete.Color_id);

        console.log(i, savedColors.length)
        if (i !== 0 && savedColors.length !== 1) {
            if (i < savedColors.length - 1) {
                setSelectedColorID(savedColors[i + 1].Color_id);
            }
            else if (i === savedColors.length - 1) {
                setSelectedColorID(savedColors[i - 1].Color_id);
            }
        }

        setSavedColors(savedColors.filter((color) => color.Color_id !== selectedColorID));
    }

    const onDescriptionChange = (value: string) => {
        setCurrentDescription(value);
    }

    const onDescriptionBlur = () => {
        const newSavedColors = savedColors.map((color) => {
            if (color.Color_id === selectedColorID) {
                color.Description = currentDescription;
            }
            return color;
        });
        setSavedColors(newSavedColors);
    }

    const saveColorChanges = () => {
        console.log(savedColors);
    }

    return (
        <div>
            {!colorMenu &&
                <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => setColorMenu(!colorMenu)}>
                    <IconPalette />
                    <div className="colorSquare" style={{backgroundColor: savedColors.find((color) => color.Color_id === selectedColorID)?.Hex_value}} />
                </button>
            }
            {colorMenu &&
                <div className={"colorMenuContainer theme" + (theme === Themes.Dark ? "Dark" : "Light")}>
                    <div className="colorMenuControl">
                        <IconPalette className="palleteIcon" onClick={() => setColorMenu(!colorMenu)}/>
                        <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => saveColorChanges()}>Save Changes</button>
                        <div className="colorSquare" style={{backgroundColor: savedColors.find((color) => color.Color_id === selectedColorID)?.Hex_value}} />
                        <IconPlus onClick={() => addColor()} />
                    </div>
                    {savedColors.map((colorOption) => 
                        <div
                            className={"colorMenuOptions " + ((colorOption.Color_id === selectedColorID) ? "selectedColorOption" : "")}
                            key={colorOption.Color_id}
                            onClick={() => setSelectedColorID(colorOption.Color_id)}
                        >
                            {colorOption.Color_id === selectedColorID &&
                                <input
                                    type="text"
                                    className="description"
                                    defaultValue={colorOption.Description}
                                    onFocus={() => setCurrentDescription(colorOption.Description)}
                                    onChange={(e) => onDescriptionChange(e.target.value)}
                                    onBlur={() => onDescriptionBlur()}
                                />
                            }
                            {colorOption.Color_id !== selectedColorID &&
                                <div className="description">{colorOption.Description}</div>
                            }
                            <input
                                className="colorPicker"
                                type="color"
                                value={colorOption.Hex_value}
                                onChange={e => onColorChange(colorOption, e.target.value)}
                            />
                            {colorOption.Color_id === selectedColorID &&
                                <IconTrash onClick={(e) => deleteColor(e, colorOption)}/>
                            }
                        </div>
                    )}
                    
                </div>
            }
            
            
        </div>
    )
}