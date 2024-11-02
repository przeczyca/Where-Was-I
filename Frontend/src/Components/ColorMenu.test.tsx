import { describe, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ColorMenu from './ColorMenu'
import { SelectedGNIS_ID } from '../Types';

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
    it("renders closed color menu", () => {
        render(<ColorMenu changeSelectionsToDefaultColorByColorID={changeSelectionsToDefaultColorByColorID} />);
        screen.debug();
    });
});