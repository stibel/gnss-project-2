import React, {useReducer} from 'react'
import Styles from "../styles/Styles";
import StylesDark from "../styles/StylesDark";
import {useCustomContext} from "../hooks/useCustomContext";

const StyleContext = React.createContext(null)

const styleReducer = (state, action) => {
    return state === Styles ? StylesDark : Styles
}

const StyleContextProvider = ({children}) => {
    const [curStyle, dispatchStyle] = useReducer(styleReducer, Styles)

    return <StyleContext.Provider value={{curStyle, dispatchStyle}}>{children}</StyleContext.Provider>
}


const useStyle = () => {
    return useCustomContext(StyleContext)
}

export {StyleContextProvider, useStyle}