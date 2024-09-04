import { createContext, useContext } from "react";
import { ColorMenuContextInterface } from "./Types";

export const ThemeContext = createContext("dark");

export const ColorMenuContext = createContext<ColorMenuContextInterface | undefined>(undefined);

export function useColorMenuContext() {
    const colorMenuContext = useContext(ColorMenuContext);
    
    if (colorMenuContext === undefined) {
        throw new Error("useColorMenuContext must be used with a ColorMenuContext object");
    }

    return colorMenuContext;
}