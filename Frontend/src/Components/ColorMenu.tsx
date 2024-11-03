import { MouseEvent, useContext, useState } from "react";
import { Color, Themes } from "../Types";
import { ThemeContext, useColorMenuContext } from "../context";
import { IconPalette, IconPlus, IconTrash } from "@tabler/icons-react";
import "./ColorMenuStyles.css"

export default function ColorMenu() {
    const [colorMenu, setColorMenu] = useState(false);
    const [newColorIDCounter, setNewColorIDCounter] = useState(-1);
    const [currentDescription, setCurrentDescription] = useState("");

    const theme = useContext(ThemeContext);
    const colorMenuContext = useColorMenuContext();

    const onColorChange = (option: Color, value: string) => {
        const newSavedColors = colorMenuContext.savedColors.map((color) => {
            if (color.Color_ID === option.Color_ID) {
                color.HexValue = value;
                color.Action = color.Action === "created" ? "created" : "updated";
                colorMenuContext.setColorChanged(true);
            }
            return color;
        });
        colorMenuContext.setSavedColors(newSavedColors);
    }

    const addColor = () => {
        colorMenuContext.setSavedColors([...colorMenuContext.savedColors, { Action: "created", Color_ID: newColorIDCounter, Description: "New Color", HexValue: "#747bff" }]);
        colorMenuContext.setSelectedColorID(newColorIDCounter);
        setNewColorIDCounter(newColorIDCounter - 1);
        colorMenuContext.setColorChanged(true);
    }

    const changeSelectionsToDefaultColorByColorID = (colorID: number) => {
        const newSelectedGNIS_IDs = new Map(colorMenuContext.selectedGNIS_IDs);
        newSelectedGNIS_IDs.forEach((selection) => {
            const updatedSelection = {
                GNIS_ID: selection.GNIS_ID,
                Saved: selection.Saved,
                Action: selection.Action,
                Color_ID: selection.Color_ID === colorID ? 1 : selection.Color_ID
            }
            newSelectedGNIS_IDs.set(selection.GNIS_ID, updatedSelection);
        });
        colorMenuContext.setSelectedGNIS_IDs(newSelectedGNIS_IDs);
    }

    const deleteColor = (e: MouseEvent, toDelete: Color) => {
        e.stopPropagation();
        const i = colorMenuContext.savedColors.findIndex((color) => color.Color_ID === toDelete.Color_ID);

        if (i !== 0 && colorMenuContext.savedColors.length !== 1) {
            if (i < colorMenuContext.savedColors.length - 1) {
                colorMenuContext.setSelectedColorID(colorMenuContext.savedColors[i + 1].Color_ID);
            }
            else if (i === colorMenuContext.savedColors.length - 1) {
                colorMenuContext.setSelectedColorID(colorMenuContext.savedColors[i - 1].Color_ID);
            }
        }

        if (toDelete.Action === "saved") {
            const newSavedColors = colorMenuContext.savedColors.map((color) => {
                if (color.Color_ID === toDelete.Color_ID) {
                    color.Action = "deleted";
                }
                return color;
            });
            colorMenuContext.setSavedColors(newSavedColors);
        }
        else {
            colorMenuContext.setSavedColors(colorMenuContext.savedColors.filter((color) => color.Color_ID !== colorMenuContext.selectedColorID));
        }

        changeSelectionsToDefaultColorByColorID(toDelete.Color_ID);
        colorMenuContext.setColorChanged(true);
    }

    const onDescriptionChange = (value: string) => {
        setCurrentDescription(value);
    }

    const onDescriptionBlur = () => {
        const newSavedColors = colorMenuContext.savedColors.map((color) => {
            if (color.Color_ID === colorMenuContext.selectedColorID && color.Description !== currentDescription) {
                color.Description = currentDescription;
                color.Action = color.Action === "created" ? "created" : "updated";
                colorMenuContext.setColorChanged(true);
            }
            return color;
        });
        colorMenuContext.setSavedColors(newSavedColors);
    }

    return (
        <div data-testid="color-menu">
            {!colorMenu &&
                <button data-testid="color-menu-closed" className={"mapButton theme" + (theme === Themes.Dark ? "Dark" : "Light")} onClick={() => setColorMenu(!colorMenu)}>
                    <IconPalette />
                    <div className="colorSquare" style={{ backgroundColor: colorMenuContext.savedColors.find((color) => color.Color_ID === colorMenuContext.selectedColorID)?.HexValue }} />
                </button>
            }
            {colorMenu &&
                <div data-testid="color-menu-open" className={"colorMenuContainer theme" + (theme === Themes.Dark ? "Dark" : "Light")}>
                    <div className="colorMenuControl">
                        <IconPalette data-testid="palette-icon-open" className="palleteIcon" onClick={() => setColorMenu(!colorMenu)} />
                        <div
                            className="colorSquare"
                            style={{
                                backgroundColor: colorMenuContext.savedColors.find((color) => {
                                    color.Color_ID === colorMenuContext.selectedColorID;
                                })?.HexValue
                            }}
                        />
                        <IconPlus data-testid="add-new-color" onClick={() => addColor()} />
                    </div>

                    {colorMenuContext.savedColors.map((colorOption) => {
                        if (colorOption.Action !== "deleted") {
                            return <div
                                data-testid="color-option"
                                className={"colorMenuOptions " + ((colorOption.Color_ID === colorMenuContext.selectedColorID) ? "selectedColorOption" : "")}
                                key={colorOption.Color_ID}
                                onClick={() => colorMenuContext.setSelectedColorID(colorOption.Color_ID)}
                            >
                                {colorOption.Color_ID === colorMenuContext.selectedColorID &&
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
                                {colorOption.Color_ID !== colorMenuContext.selectedColorID &&
                                    <div className="description">{colorOption.Description}</div>
                                }
                                <input
                                    className="colorPicker"
                                    type="color"
                                    value={colorOption.HexValue}
                                    onChange={e => onColorChange(colorOption, e.target.value)}
                                    disabled={colorOption.Action === "default"}
                                />
                                {colorOption.Color_ID === colorMenuContext.selectedColorID && colorOption.Action !== "default" &&
                                    <IconTrash data-testid="delete-color" onClick={(e) => deleteColor(e, colorOption)} />
                                }
                            </div>
                        }
                    })}
                </div>
            }
        </div>
    )
}