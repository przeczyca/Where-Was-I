import * as React from 'react';
import { describe, expect, it } from 'vitest';
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

describe("Color menu", () => {
    it("renders color menu closed", () => {
        render(<ColorMenuTestWrapper />);
        const closedMenu = screen.getByTestId("color-menu-closed");
        expect(closedMenu).toBeTruthy();
    });

    it("color menu opens and closes", () => {
        render(<ColorMenuTestWrapper />);
        let elementToTest = screen.getByTestId("color-menu-closed");
        fireEvent.click(elementToTest);
        elementToTest = screen.getByTestId("color-menu-open");
        expect(elementToTest).toBeTruthy();
        elementToTest = screen.getByTestId("palette-icon-open");
        fireEvent.click(elementToTest);
        elementToTest = screen.getByTestId("color-menu-closed");
        expect(elementToTest).toBeTruthy();
    });

    it("default color is in color menu", () => {
        render(<ColorMenuTestWrapper />);
        fireEvent.click(screen.getByTestId("color-menu-closed"));
        let elementsToTest = screen.getAllByTestId("color-option");
        expect(elementsToTest.length).toEqual(1);
        let inputElement = screen.getByDisplayValue("Default");
        expect(inputElement).toBeInTheDocument();
    });

    it("new color is added and deleted", () => {
        render(<ColorMenuTestWrapper />);
        fireEvent.click(screen.getByTestId("color-menu-closed"));
        let elementToTest = screen.getByTestId("add-new-color");
        fireEvent.click(elementToTest);
        let elementsToTest = screen.getAllByTestId("color-option");
        expect(elementsToTest.length).toEqual(2);
        elementToTest = screen.getByDisplayValue("New Color");
        expect(elementToTest).toBeInTheDocument();
        elementToTest = screen.getByTestId("delete-color");
        fireEvent.click(elementToTest);
        elementsToTest = screen.getAllByTestId("color-option");
        expect(elementsToTest.length).toEqual(1);
        elementToTest = screen.getByDisplayValue("Default");
        expect(elementToTest).toBeInTheDocument();
    })
});