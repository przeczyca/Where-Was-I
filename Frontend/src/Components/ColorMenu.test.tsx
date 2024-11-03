import { describe, expect, it } from 'vitest'
import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import ColorMenu from './ColorMenu'
import { Color, ColorMenuContextInterface, SelectedGNIS_ID } from '../Types';
import { useState } from 'react';
import { ColorMenuContext } from '../context';

let cmc: ColorMenuContextInterface;

renderHook(() => {
    const [savedColors, setSavedColors] = useState<Color[]>([{ Action: "saved", Color_ID: 1, Description: "Default", HexValue: "#123456" }]);
    const [selectedColorID, setSelectedColorID] = useState<number>(1);
    const [, setColorChanged] = useState<boolean>(false);
    cmc = {
        savedColors: savedColors,
        setSavedColors: setSavedColors,
        selectedColorID: selectedColorID,
        setSelectedColorID: setSelectedColorID,
        setColorChanged: setColorChanged,
    }
});

const testgnisid: SelectedGNIS_ID = { GNIS_ID: "12345", Saved: true, Action: "saved", Color_ID: 1 }

const selectedGNIS_IDs = new Map([["12345", testgnisid]]);

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
    return newSelectedGNIS_IDs;
}

describe("Color menu", () => {
    it("renders color menu closed", () => {
        render(
            <ColorMenuContext.Provider value={cmc}>
                <ColorMenu changeSelectionsToDefaultColorByColorID={changeSelectionsToDefaultColorByColorID} />
            </ColorMenuContext.Provider>
        );
        const closedMenu = screen.getByTestId("color-menu-closed");
        expect(closedMenu).toBeTruthy();
    });
    it("color menu opens on click", () => {
        render(
            <ColorMenuContext.Provider value={cmc}>
                <ColorMenu changeSelectionsToDefaultColorByColorID={changeSelectionsToDefaultColorByColorID} />
            </ColorMenuContext.Provider>
        );
        let elementToTest = screen.getByTestId("color-menu-closed");
        fireEvent.click(elementToTest);
        elementToTest = screen.getByTestId("color-menu-open");
        expect(elementToTest).toBeTruthy();
    });
});