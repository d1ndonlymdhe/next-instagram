import React, { useState, createContext } from 'react';




type GlobalContextType = {
    username: string;
    setUsername: (username: string) => void
    ppBlobUrl?: string;
    setPpBlobUrl?: (ppBlobUrl: string) => void
    searchResults: string[];
    setSearchResults: (searchResults: string[]) => void
}
export const GlobalContext = createContext<GlobalContextType>({
    username: "",
    setUsername: () => { },
    ppBlobUrl: "",
    setPpBlobUrl: () => { },
    searchResults: [] as string[],
    setSearchResults: () => { }
})
export const GlobalContextProvider = (props: React.PropsWithChildren) => {
    const setUsername = (username: string) => {
        const newState = Object.assign({}, state);
        newState.username = username;
        setState(newState);
    }
    const setPpBlobUrl = (ppBlobUrl: string) => {
        setState({ ...state, ppBlobUrl: ppBlobUrl });
    }
    const setSearchResults = (searchResults: string[]) => {
        setState({ ...state, searchResults: searchResults });
    }
    const initState = {
        username: "",
        setUsername: setUsername,
        ppBlobUrl: "",
        setPpBlobUrl: setPpBlobUrl,
        searchResults: [] as string[],
        setSearchResults: setSearchResults,
    }
    const [state, setState] = useState(initState);

    return (
        <GlobalContext.Provider value={state}>
            {props.children}
        </GlobalContext.Provider>
    )
}