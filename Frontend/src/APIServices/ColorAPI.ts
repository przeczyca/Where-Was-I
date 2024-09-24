import { Color } from "../Types";

const BASE_URL = import.meta.env.VITE_BASE_SERVER_URL;

export const ColorAPI = {
    getColors: function (): Promise<Color[]> {
        const endpoint = "/colors";
        return fetch(BASE_URL + endpoint, { method: 'GET' })
            .then(response => response.json())
            .catch(error => error);
    },

    patchColors: function (colors: Color[]): Promise<Color[]> {
        const endpoint = "/colors";
        return fetch(BASE_URL + endpoint, { method: 'PATCH', body: JSON.stringify(colors) })
            .then((response) => response.json())
            .catch(error => error);
    }
}