import React, { useContext, useState } from "react";
import { clientPost } from "../pages/home/index"

type message = {
    to: string;
    content: string;
    from: string;
    roomId: string;
}
type room = {
    id: string;
    members: string[];
    messages: message[];
}
type initType = {
    username: string,
    ppBlobUrl: string,
    searchResults: { username: string, isFollowing: boolean }[],
    friends: { username: string }[]
    feedResults: clientPost[]
    rooms: room[],
    chatView: boolean,
    pendingMessages?: message[]
}
const init: initType = {
    username: "",
    ppBlobUrl: "",
    friends: [{ username: "" }],
    searchResults: [{ username: "", isFollowing: false }],
    feedResults: [
        {
            postedBy: "",
            postedByUsername: [{ username: "" }],
            profilePictureUrl: "",
            likedBy: [""],
            likedByUsernames: [{ username: "" }]
            , _id: "",
            caption: "",
            imageUrl: "",
            likes: 0,
            postedOn: 0
        }
    ],
    //@ts-ignore
    rooms: [],
    chatView: false,
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