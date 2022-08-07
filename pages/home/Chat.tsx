import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Wrapper } from "./index";
const socket = io("http://localhost:4000")
export default function Chat() {
    const [connected, setConnected] = useState(false);
    if (!connected) {
        return <div>Loading</div>
    }
    return <Wrapper>
        <div>Chat</div>

    </Wrapper>

}

function Messages(props: any) {
    return <div></div>
}