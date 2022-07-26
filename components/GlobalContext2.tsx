import React, { useContext, useState } from "react";
import { clientPost } from "../pages/home/index"
type initType = {
    username: string,
    ppBlobUrl: string,
    searchResults: { username: string, isFollowing: boolean }[],
    feedResults: clientPost[]
}
const init: initType = {
    username: "",
    ppBlobUrl: "",
    searchResults: [{ username: "", isFollowing: false }],
    feedResults: [{ postedBy: "", postedByUsername: [{ username: "" }], profilePictureUrl: "", likedBy: [""], likedByUsernames: [{ username: "" }], _id: "", caption: "", imageUrl: "", likes: 0, postedOn: 0 }],
}

const GlobalContext = React.createContext(init);
const GlobalUpdateContext = React.createContext((newState: typeof init) => { });

export function useGlobalContext() {
    return useContext(GlobalContext);
}
export function useGlobalUpdateContext() {
    return useContext(GlobalUpdateContext);
}

//@ts-ignore
export function GlobalContextProvider(props: React.PropsWithChildren) {
    const { children } = props;
    const [state, setState] = useState(init);
    function updateState(newState: any) {
        setState(newState);
    }
    return <GlobalContext.Provider value={state}>
        <GlobalUpdateContext.Provider value={(newState: typeof init) => { updateState(newState) }}>
            {children}
        </GlobalUpdateContext.Provider>
    </GlobalContext.Provider>
}