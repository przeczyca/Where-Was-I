import { MouseEvent, useContext, useState } from "react";
import { Color, Themes } from "../Types";
import { ThemeContext, useColorMenuContext } from "../context";
import { IconPalette, IconPlus, IconTrash } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

export default function ColorMenu(props: { changeSelectionsToDefaultColorByColorID: (colorID: number) => void }) {
    const [colorMenu, setColorMenu] = useState(false);
    const [newColorIDCounter, setNewColorIDCounter] = useState(-1);
    const [currentDescription, setCurrentDescription] = useState("");

    const theme = useContext(ThemeContext);
    const colorMenuContext = useColorMenuContext();

    const onColorChange = (option: Color, value: string) => {
        const newSavedColors = colorMenuContext.savedColors.map((color) => {
            if (color.Color_id === option.Color_id) {
                color.Hex_value = value;
                color.Action = "changed";
            }
            return color;
        });
        colorMenuContext.setSavedColors(newSavedColors);
    }

    const addColor = () => {
        colorMenuContext.setSavedColors([...colorMenuContext.savedColors, { Action: "created", Color_id: newColorIDCounter, Description: "New Color", Hex_value: "#747bff" }]);
        colorMenuContext.setSelectedColorID(newColorIDCounter);
        setNewColorIDCounter(newColorIDCounter - 1);
    }

    const deleteColor = (e: MouseEvent, toDelete: Color) => {
        e.stopPropagation();
        const i = colorMenuContext.savedColors.findIndex((color) => color.Color_id === toDelete.Color_id);

        if (i !== 0 && colorMenuContext.savedColors.length !== 1) {
            if (i < colorMenuContext.savedColors.length - 1) {
                colorMenuContext.setSelectedColorID(colorMenuContext.savedColors[i + 1].Color_id);
            }
            else if (i === colorMenuContext.savedColors.length - 1) {
                colorMenuContext.setSelectedColorID(colorMenuContext.savedColors[i - 1].Color_id);
            }
        }

        if (toDelete.Action === "saved") {
            const newSavedColors = colorMenuContext.savedColors.map((color) => {
                if (color.Color_id === toDelete.Color_id) {
                    color.Action = "deleted";
                }
                return color;
            });
            colorMenuContext.setSavedColors(newSavedColors);
        }
        else {
            colorMenuContext.setSavedColors(colorMenuContext.savedColors.filter((color) => color.Color_id !== colorMenuContext.selectedColorID));
        }

        props.changeSelectionsToDefaultColorByColorID(toDelete.Color_id);
    }

    const onDescriptionChange = (value: string) => {
        setCurrentDescription(value);
    }

    const onDescriptionBlur = () => {
        const newSavedColors = colorMenuContext.savedColors.map((color) => {
            if (color.Color_id === colorMenuContext.selectedColorID) {
                color.Description = currentDescription;
                color.Action = color.Action === "created" ? "created" : "updated";
            }
            return color;
        });
        colorMenuContext.setSavedColors(newSavedColors);
    }

    const saveColorChanges = () => {
        console.log(colorMenuContext.savedColors);
    }

    return (
        <div>
            {!colorMenu &&
                <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => setColorMenu(!colorMenu)}>
                    <IconPalette />
                    <div className="colorSquare" style={{ backgroundColor: colorMenuContext.savedColors.find((color) => color.Color_id === colorMenuContext.selectedColorID)?.Hex_value }} />
                </button>
            }
            {colorMenu &&
                <div className={"colorMenuContainer theme" + (theme === Themes.Dark ? "Dark" : "Light")}>
                    <div className="colorMenuControl">
                        <IconPalette className="palleteIcon" onClick={() => setColorMenu(!colorMenu)} />
                        <button className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => saveColorChanges()}>Save Changes</button>
                        <div
                            className="colorSquare"
                            style={{
                                backgroundColor: colorMenuContext.savedColors.find((color) => {
                                    color.Color_id === colorMenuContext.selectedColorID;
                                })?.Hex_value
                            }}
                        />
                        <IconPlus onClick={() => addColor()} />
                    </div>

                    {colorMenuContext.savedColors.map((colorOption) => {
                        if (colorOption.Action !== "deleted") {
                            return <div
                                className={"colorMenuOptions " + ((colorOption.Color_id === colorMenuContext.selectedColorID) ? "selectedColorOption" : "")}
                                key={colorOption.Color_id}
                                onClick={() => colorMenuContext.setSelectedColorID(colorOption.Color_id)}
                            >
                                {colorOption.Color_id === colorMenuContext.selectedColorID &&
                                    <input
                                        type="text"
                                        className="description"
                                        defaultValue={colorOption.Description}
                                        onFocus={() => setCurrentDescription(colorOption.Description)}
                                        onChange={(e) => onDescriptionChange(e.target.value)}
                                        onBlur={() => onDescriptionBlur()}
                                        disabled={colorOption.Action === "default"}
                                    />
                                }
                                {colorOption.Color_id !== colorMenuContext.selectedColorID &&
                                    <div className="description">{colorOption.Description}</div>
                                }
                                <input
                                    className="colorPicker"
                                    type="color"
                                    value={colorOption.Hex_value}
                                    onChange={e => onColorChange(colorOption, e.target.value)}
                                    disabled={colorOption.Action === "default"}
                                />
                                {colorOption.Color_id === colorMenuContext.selectedColorID && colorOption.Action !== "default" &&
                                    <IconTrash onClick={(e) => deleteColor(e, colorOption)} />
                                }
                            </div>
                        }
                    })}
                </div>
            }
        </div>
    )
}