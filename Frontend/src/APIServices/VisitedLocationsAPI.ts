import { SelectedGNIS_ID } from "../Types";

const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

export const VisitedLocationsAPI = {
    getVisitedLocations: function (): Promise<SelectedGNIS_ID[]> {
        const endpoint = "/visited";
        return fetch(BASE_URL + endpoint, { method: 'GET' })
            .then(response => response.json())
            .catch(error => error);
    },

    saveSelectedLocations: function (selections: SelectedGNIS_ID[]): Promise<SelectedGNIS_ID[]> {
        const endpoint = "/visited";
        return fetch(BASE_URL + endpoint, { method: 'POST', body: JSON.stringify(selections) })
            .then(response => response.json())
            .catch(error => error);
    }
}