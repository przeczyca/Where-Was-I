import * as React from 'react';
import { expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorMenu from './ColorMenu';
import { Color, SelectedGNIS_ID } from '../Types';
import { ColorMenuContext } from '../context';

function ColorMenuTestWrapper() {
    const [selectedGNIS_IDs, setSelectedGNIS_IDs] = React.useState<Map<string, SelectedGNIS_ID>>(new Map());
    const [savedColors, setSavedColors] = React.useState<Color[]>([{ Action: "saved", Color_ID: 1, Description: "Default", HexValue: "#123456" }]);
    const [selectedColorID, setSelectedColorID] = React.useState<number>(1);
    const [, setColorChanged] = React.useState<boolean>(false);

    const changeSelectionsToDefaultColorByColorID = (colorID: number) => {
        const newSelectedGNIS_IDs = new Map(selectedGNIS_IDs);
        newSelectedGNIS_IDs.forEach((selection) => {
            const updatedSelection = {
                GNIS_ID: selection.GNIS_ID,
                Saved: selection.Saved,
                Action: selection.Action,
                Color_ID: selection.Color_ID === colorID ? 1 : selection.Color_ID
            }
            newSelectedGNIS_IDs.set(selection.GNIS_ID, updatedSelection);
        });
        setSelectedGNIS_IDs(newSelectedGNIS_IDs);
    }

    return (
        <div>
            <ColorMenuContext.Provider value={{ savedColors, setSavedColors, selectedColorID, setSelectedColorID, setColorChanged }}>
                <ColorMenu changeSelectionsToDefaultColorByColorID={changeSelectionsToDefaultColorByColorID} />
            </ColorMenuContext.Provider>
        </div>
    );
}

test("Color menu", () => {
    render(<ColorMenuTestWrapper />);

    // Color menu renders
    const closedMenuButton = screen.getByTestId("color-menu-closed");
    expect(screen.getByTestId("color-menu-closed")).toBeInTheDocument();

    // Color menu opens
    fireEvent.click(closedMenuButton);
    expect(screen.getByTestId("color-menu-open")).toBeInTheDocument();

    // Has only the default color
    const colorOptions = screen.getAllByTestId("color-option");
    expect(colorOptions.length).toEqual(1);
    expect(screen.getByDisplayValue("Default")).toBeInTheDocument();

    // Add new color
    fireEvent.click(screen.getByTestId("add-new-color"));
    expect(screen.getAllByTestId("color-option").length).toEqual(2);
    expect(screen.getByDisplayValue("New Color")).toBeInTheDocument();

    // Delete new color
    fireEvent.click(screen.getByTestId("delete-color"));
    expect(screen.getAllByTestId("color-option").length).toEqual(1);
    expect(screen.getByDisplayValue("Default")).toBeInTheDocument();

    // Color menu closes
    fireEvent.click(screen.getByTestId("palette-icon-open"));
    expect(screen.getByTestId("color-menu-closed")).toBeInTheDocument();
});