import React, { useEffect, useRef, useState, PropsWithChildren } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
//@ts-ignore
import uuid from "react-uuid"
import { ArrowLeftIcon, ChatIcon, HeartIcon, HomeIcon, LogoutIcon, PlusIcon, SearchIcon, ChevronDoubleRightIcon, UserIcon } from "@heroicons/react/outline";
import { ChatIcon as ChatIconSolid, HeartIcon as HeartIconSolid, HomeIcon as HomeIconSolid, PlusIcon as PlusIconSolid, SearchIcon as SearchIconSolid, ShoppingBagIcon as ShoppingBagIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/solid";
import Button from "../../components/Button";
import { GlobalContextProvider, useGlobalContext, useGlobalUpdateContext } from "../../components/GlobalContext2";
import { useRouter } from "next/router";
import { server } from "..";
import ProfilePicture from "../../components/ProfilePicture";
import Logo from "../../components/Logo";
import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../utils/db";
import User from "../../utils/User";
import { post, user } from "../../utils/type";
import Post from "../../utils/Post";
import Message from "../../utils/Message";
import Search from "../../components/Search"
import CreatePost from "../../components/CreatePost";
import ModalWithBackdrop from "../../components/ModalWithBackDrop";
import io from "socket.io-client"
import Feed, { FeedPost } from "../../components/Feed";
import ProfilePictureAndUsername from "../../components/ProfilePictureAndUsername";
import Input from "../../components/Input"
const socket = io("http://localhost:4000")
// import Profile from "./[profile]"
type set<T> = React.Dispatch<React.SetStateAction<T>>
// const server = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api";

export type clientPost = {
    caption: string;
    likes: number;
    likedBy: string[];
    likedByUsernames: { username: string }[];
    postedBy: string;
    postedByUsername: [{ username: string }];
    postedOn: number;
    imageUrl: string;
    profilePictureUrl: string;
    _id: string;
}
type AppPropsType = { posts: string, selfUser: string, messages: string };

export default function App(props: AppPropsType) {
    //@ts-ignore
    return <GlobalContextProvider>
        <Home posts={props.posts} selfUser={props.selfUser} messages={props.messages} />
    </GlobalContextProvider>
}

function Home(props: AppPropsType) {
    const { posts, selfUser, messages } = props;
    const globalContext = useGlobalContext();
    const globalUpdateContext = useGlobalUpdateContext();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const [visitingProfile, setVisitingProfile] = useState("");
    const router = useRouter();
    useEffect(() => {
        const tabHash = getLastHash(window.location.toString());
        if (tabHash) {
            setActiveTab(tabHash);
        } else {
            setActiveTab("home");
        }
    })
    //get userinfo and feed
    useEffect(() => {
        (async () => {
            const hash = Cookies.get("hash");
            if (hash === undefined) {
                window.location.href = "/"
            }
            //if value recieved from serversideprops
            if (selfUser) {
                const self: user = JSON.parse(selfUser);
                console.log("subscribibg")
                socket.emit("subscribe", { username: self.username })
                if (self.firstLogin) {
                    window.location.href = "/"
                } else {
                    if (!localStorage.messages) {
                        localStorage.messages = JSON.stringify([]);
                    }
                    const storedMessages: message[] = JSON.parse(localStorage.messages)
                    const pendingMessages: message[] = JSON.parse(messages);
                    pendingMessages.forEach(m => {
                        storedMessages.push(m)
                    })
                    const newState: typeof globalContext = { ...globalContext, username: self.username, friends: self.friendUsers, pendingMessages: storedMessages }
                    console.log("checking = ", (newState.pendingMessages && newState.pendingMessages.length > 0))
                    if (newState.pendingMessages && newState.pendingMessages.length > 0) {
                        const roomsToBeJoinedIds = removeDuplicate(newState.pendingMessages.map(message => message.roomId))
                        socket.emit("joinRooms", { roomIds: roomsToBeJoinedIds, username: self.username })
                        for (let i = 0; i < roomsToBeJoinedIds.length; i++) {
                            const messages = newState.pendingMessages.filter(message => message.roomId === roomsToBeJoinedIds[i])
                            const members = [self.username, messages[0].from];
                            const room: room = { messages: messages, members: members, id: roomsToBeJoinedIds[i] }
                            newState.rooms.push(room);
                        }
                    }
                    newState.ppBlobUrl = `${server}/getProfilePic?username=${self.username}`;
                    if (posts) {
                        newState.feedResults = JSON.parse(posts);
                    }
                    else {
                        const res = await axios.get(`${server}/feed`, { params: { hash } })
                        if (res.data.status !== "error") {
                            newState.feedResults = res.data.posts;
                        } else {
                            newState.feedResults = [];
                        }

                    }
                    newState.feedResults = newState.feedResults.map((post) => {
                        post.profilePictureUrl = `${server}/getProfilePic?username=${post.postedByUsername}`;
                        post.imageUrl = `${server}/getPostPic?postId=${post._id}&uploaderId=${post.postedBy}`;
                        return post;
                    })
                    globalUpdateContext(newState)
                    setIsSignedIn(true)
                }
            }
            //if not passed from serverside props
            else {
                axios.post(`${server}/userinfo`, { hash: hash }).then(async (res) => {
                    if (res.data.status === "ok") {
                        if (res.data.message.firstLogin) {
                            window.location.href = "/setup";
                        } else {
                            const newState = { ...globalContext, username: res.data.message.username };
                            newState.ppBlobUrl = `${server}/getProfilePic?username=${res.data.message.username}`;
                            if (posts) {
                                newState.feedResults = JSON.parse(posts);
                            } else {
                                const res = await axios.get(`${server}/feed`, { params: { hash } })
                                if (res.data.status !== "error") {
                                    newState.feedResults = res.data.posts;
                                } else {
                                    newState.feedResults = [];
                                }
                            }
                            newState.feedResults = newState.feedResults.map((post) => {
                                post.profilePictureUrl = `${server}/getProfilePic?username=${post.postedByUsername}`;
                                post.imageUrl = `${server}/getPostPic?postId=${post._id}&uploaderId=${post.postedBy}`;
                                return post;
                            })
                            globalUpdateContext(newState);
                            setIsSignedIn(true);
                        }
                    } else {
                        window.location.href = "/getstarted";
                    }
                })
            }
        })()
    }, []);
    useEffect(() => {
        const roomCreationCallback = (payload: { status: string, roomId: string, members: string[] }) => {
            console.log("room created")
            const { roomId, members } = payload;
            const newState = Object.assign({}, globalContext);
            const roomAlreadyExists = newState.rooms.filter(room => room.id === roomId).length > 0
            if (!roomAlreadyExists) {
                newState.rooms.push({ id: roomId, members: members, messages: [] })
            }
            globalUpdateContext(newState);
        }
        socket.on("roomCreated", roomCreationCallback);
        const messageCallback = (payload: { message: string, to: string, from: string, roomId: string }) => {
            console.log("room joined")
            const { roomId, message, to, from } = payload;
            const newState = Object.assign({}, globalContext);
            const room = newState.rooms.filter(room => {
                return room.id === roomId;
            })[0]
            room.messages.push({ to, from, content: message, roomId: roomId })
            const storedMessages = JSON.parse(localStorage.messages);
            storedMessages.push({ to, from, content: message, roomId: roomId })
            localStorage.messages = JSON.stringify(storedMessages);
            globalUpdateContext(newState);
        }
        socket.on("newMessage", messageCallback);
        const roomDissolvedCallback = (payload: { roomId: string }) => {
            const { roomId } = payload;
            const newState = Object.assign({}, globalContext);
            newState.rooms = newState.rooms.filter(room => room.id !== roomId);
            globalUpdateContext(newState);
        }
        socket.on("roomDissolver", roomDissolvedCallback);

        return () => {
            socket.off("roomCreated", roomCreationCallback);
            socket.off("newMessage", messageCallback);
            socket.off("roomDissolver", roomDissolvedCallback);
        }
    }, [socket, globalContext, globalUpdateContext])
    if (isSignedIn) {
        // return <App>
        return (
            <>
                <div className="h-screen w-screen flex justify-center items-center bg-slate-400">
                    {
                        activeTab === "home" &&
                        <Wrapper>
                            <Topbar></Topbar>
                            <Feed></Feed>
                            <Footer {...{ activeTab, setActiveTab }}></Footer>
                        </Wrapper>
                    }{
                        activeTab === "search" &&
                        <Wrapper>
                            <Search {...{ setVisitingProfile }}></Search>
                            <Footer {...{ activeTab, setActiveTab }}></Footer>
                        </Wrapper>
                    }
                    {
                        activeTab === "post" &&
                        <Wrapper>
                                <div className="grid grid-cols-[5fr_95fr] justify-center items-center w-full">
                                    <ArrowLeftIcon onClick={() => { router.back() }}></ArrowLeftIcon>
                                    <div className="text-center text-xl">New Post</div>
                                </div>
                                <CreatePost></CreatePost>
                                <Footer {...{ activeTab, setActiveTab }}></Footer>
                        </Wrapper>
                    }
                    {
                        activeTab === "chat" &&
                        <Wrapper>

                                <Chat></Chat>
                                <Footer {...{ activeTab, setActiveTab }}></Footer>
                        </Wrapper>
                    }
                    {
                        activeTab === "profile" &&
                        <Wrapper>

                            <Profile></Profile>
                            <Footer {...{ activeTab, setActiveTab }}></Footer>
                            {/* <Profile></Profile> */}
                        </Wrapper>
                    }
                </div>
                <Link href="/" id="toIndex" className="hidden"><a className="hidden">empty</a></Link>
                <Link href="/setup" id="toSetup" className="hidden"><a className="hidden">empty</a></Link>
            </>)
    } else {
        return <>Loading</>
    }
}

function Chat() {
    const globalContext = useGlobalContext()
    const [showFriends, setShowFriends] = useState(false);
    const { friends } = globalContext
    const [selectedUsername, setSelectedUsername] = useState("");
    const [chatView, setChatView] = useState(false);
    const globalUpdateContext = useGlobalUpdateContext();
    const router = useRouter();
    useEffect(() => {
        const callback = (payload: { status: string, roomId: string, members: string[] }) => {
            if (selectedUsername !== "") {
                setChatView(true);
            }
        }
        socket.on("roomCreated", callback);
        return () => {
            socket.off("roomCreated", callback);
        }
    }, [socket, globalContext, globalUpdateContext])
    const initaiteChat = (username: string) => {
        console.log("initiate Chat")
        socket.emit("createRoom", { members: [globalContext.username, username] });
    }
    if (chatView) {
        const rooms = globalContext.rooms;
        const room = rooms.filter((room) => {
            return room.members.includes(selectedUsername);
        })[0]
        return <ChatView username={selectedUsername} room={room} setChatView={setChatView} setSelectedUsername={setSelectedUsername}></ChatView>
    }
    return <>
        <div className="grid grid-cols-[5fr_95fr] justify-center items-center w-full">
            <ArrowLeftIcon onClick={() => { router.back() }}></ArrowLeftIcon>
            <div className="text-center text-xl">Chats</div>
        </div>
        <div className="h-full w-full grid grid-rows-[9fr_1fr]">
            {
                showFriends &&
                <ModalWithBackdrop title="Friends" onclick={() => { setShowFriends(false) }}>
                    <div className="bg-gray-400 m-2 border-2 h-full border-black rounded-md p-2">
                        {
                            friends.map(friend => {
                                return <div className="p-2" key={uuid()}>
                                    <ProfilePictureAndUsername username={friend.username} onClick={() => { setSelectedUsername(friend.username); initaiteChat(friend.username) }} ActionButton="Chat"></ProfilePictureAndUsername>
                                </div>
                            })}
                    </div>
                </ModalWithBackdrop>
            }
            <div id="chats" className="flex align-top flex-col">
                {
                    globalContext.rooms.map(room => {
                        const friendUsername = room.members.filter(member => { return member !== globalContext.username })[0];
                        console.log(globalContext)
                        console.log("friendUsername = ", room.members.filter(member => { member !== globalContext.username }));
                        return <div key={uuid()} className="my-2">
                            <ProfilePictureAndUsername username={friendUsername} onClick={() => { setSelectedUsername(friendUsername); setChatView(true) }} ActionButton="Chat" ></ProfilePictureAndUsername>
                        </div>
                    })
                }
            </div>
            <div className="h-full w-full flex align-baseline justify-end">

                <Button bonClick={(e) => {
                    setShowFriends(!showFriends)
                }} text="Friends" className="h-fit w-fit"></Button>
            </div>
        </div>

    </>
}

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
function ChatView(props: { username: string, room: room, setChatView: set<boolean>, setSelectedUsername: set<string> }) {
    const { username, room, setChatView, setSelectedUsername } = props;
    const globalContext = useGlobalContext();
    const selfUsername = globalContext.username;
    const messages = room.messages;
    console.log("rendering")
    const inputRef = useRef<HTMLInputElement>(null)
    function sendMessage() {
        console.log("sending")
        const message = inputRef.current?.value;
        const sendThis = { from: selfUsername, to: username, message: message, roomId: room.id }
        console.log("sendThis = ", sendThis);
        socket.emit("message", sendThis)

    }
    useEffect(() => {
        axios.post("api/removePendingMessages", { roomId: room.id })
    }, []);
    return <>
        <div className="grid grid-cols-[5fr_95fr] justify-center items-center w-full gap-5">
            <ArrowLeftIcon onClick={() => { setChatView(false); setSelectedUsername("") }}></ArrowLeftIcon>
            <div className="text-center text-xl">
                <ProfilePictureAndUsername username={username}></ProfilePictureAndUsername>
            </div>
        </div>
        <div className="grid grid-rows-[9.5fr_0.5fr] mb-1">
            <div className="overflow-y-auto flex items-end h-full">
                <div className="flex flex-col overflow-y-auto h-fit w-full">
                    {
                        messages.map(message => {
                            return <div className={`my-2 flex w-full ${message.from === username ? "flex-row" : "flex-row-reverse"}`} key={uuid()}>
                                <div className={`w-fit py-1 px-2 max-w-[50%] rounded-xl ${message.from === username ? "bg-gray-400" : "bg-blue-400"} break-words`}>{message.content}</div>
                            </div>
                        })
                    }
                </div>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                sendMessage()
                //@ts-ignore 
                inputRef.current.value = "";
            }} className="h-full w-full">
                <div className="h-full w-full grid grid-cols-[8fr_2fr] gap-2">
                    <Input type="text" ref={inputRef} onChange={() => { }} className="rounded-lg px-2"></Input>
                    {/*@ts-ignore*/}
                    <Button type="submit" bonClick={() => { }} text="Send" />
                </div>
            </form>
        </div >
    </>

}

//to load profile route to /home?username=username#profile
function Profile() {
    const globalState = useGlobalContext();
    const selfUsername = globalState.username;
    const router = useRouter();
    const { ppBlobUrl } = globalState;
    const [userInfo, setUserInfo] = useState<Pick<user, "followingCount" | "followerUsers" | "followersCount" | "bio" | "posts" | "followingUsers" | "friendUsers">>({
        followersCount: 0,
        followingCount: 0,
        followerUsers: [{ username: "" }],
        followingUsers: [{ username: "" }],
        bio: "",
        friendUsers: [{ username: "" }],
        //@ts-ignore
        posts: [{}]
    })
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isfollowing, setIsFollowing] = useState(false);
    const [showFollowerUsers, setShowFollowerUsers] = useState(false);
    const [showFollowingUsers, setShowFollowingUsers] = useState(false);
    const [username] = useState((typeof router.query.username == "string") ? router.query.username : "");
    const [ppUrl, setPpUrl] = useState("")
    useEffect(() => {
        axios.get(`${server}/userinfo`, { params: { username } }).then(async userInfoRes => {
            if (userInfoRes.data.status === "ok") {
                axios.get(`${server}/getPostsFromUser`, { params: { username } }).then(res => {
                    if (res.data.status == "ok") {
                        const { followersCount, followingCount, followerUsers, followingUsers, bio, friendUsers } = userInfoRes.data.message
                        const posts = res.data.posts
                        setUserInfo({ followersCount, followingCount, followerUsers, followingUsers, posts, bio, friendUsers })
                        setLoadingPosts(false);
                    }
                })
                if (username !== selfUsername) {
                    setPpUrl(`${server}/getProfilePic?username=${username}`)
                } else {
                    setPpUrl(ppBlobUrl);
                }
            }
        })
        if (username !== selfUsername) {
            axios.get(`${server}/search`, { params: { searchTerm: username, hash: Cookies.get("hash"), limit: 1 } }).then(res => {
                if (res.data.status === "ok") {
                    if (res.data.results[0].isFollowing == true) {
                        setIsFollowing(true);
                    }

                }
            })
        }
    }, [])
    //try rewriting to only follow handle setFollowing outside the fucntion
    const follow = (username: string) => {
        axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: username }).then(res => {
            if (res.data.status === "ok") {
                setIsFollowing(true);
            }
        })
    }
    const unFollow = (username: string) => {
        axios.post(`${server}/unfollow`, { hash: Cookies.get("hash"), toUnFollow: username }).then(res => {
            if (res.data.status === "ok") {
                setIsFollowing(false);
            }
        })
    }
    const FollowingAndFollowerCount = () => {
        return <>
            <div onClick={(e) => {
                e.stopPropagation();
                setShowFollowingUsers(true);
            }} className="grid grid-rows-2 justify-center items-center content-center hover:cursor-pointer">
                <span className="text-center">
                    Following
                </span>
                <span className="text-center">
                    {userInfo.followingCount}
                </span>
            </div>
            <div onClick={(e) => {
                e.stopPropagation();
                setShowFollowerUsers(true)
            }} className="grid grid-rows-2 justify-center items-center hover:cursor-pointer">
                <span className="text-center">
                    Followers
                </span>
                <span className="text-center">
                    {userInfo.followersCount}
                </span>
            </div>
        </>
    }
    const userInfoUI = <div className="grid grid-cols-[100px_auto]">
        <ProfilePicture src={ppUrl}></ProfilePicture>
        <div className="flex flex-wrap justify-around ml-5">
            <FollowingAndFollowerCount></FollowingAndFollowerCount>
            <div className="flex justify-center items-center w-[200%] my-4 overflow-x-auto">{userInfo.bio}</div>
            {(username !== selfUsername) &&
                <Button bonClick={(e) => {
                    if (!isfollowing) {
                        follow(username);
                        setUserInfo({ ...userInfo, followersCount: userInfo.followersCount + 1 });
                    } else {
                        unFollow(username);
                        setUserInfo({ ...userInfo, followersCount: userInfo.followersCount - 1 });

                    }
                }} text={isfollowing ? "following" : "follow"} className={`w-full ${!isfollowing && "hover:bg-blue-500"} ${isfollowing && "hover:bg-gray-400"}`}></Button>}
        </div >
    </div>
    return <>
        {
            showFollowerUsers &&
            <ModalWithBackdrop onclick={() => { setShowFollowerUsers(false) }} title="Followers">
                {
                    userInfo.followerUsers.map(follower => {
                        return <ProfilePictureAndUsername key={uuid()} username={follower.username}></ProfilePictureAndUsername>
                    })
                }
            </ModalWithBackdrop>
        }
        {
            showFollowingUsers &&
            <ModalWithBackdrop onclick={() => { setShowFollowingUsers(false) }} title="Following">
                {
                    userInfo.followingUsers.map(following => {
                        return <ProfilePictureAndUsername key={uuid()} username={following.username}></ProfilePictureAndUsername>
                    })
                }
            </ModalWithBackdrop>
        }
        {/*Topbar without logout button*/}
        {(username !== selfUsername) &&
            <div className="h-full w-full items-center grid grid-cols-[10fr_90fr] gap-5">
                <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                    router.back()
                }}></ArrowLeftIcon>
                <span className="text-xl">{username}</span>
            </div>
        }
        {/* Topbar with logout button */}
        {
            (username === selfUsername) &&
            <div className="h-full w-full items-center grid grid-cols-[10fr_80fr_10fr] gap-5">
                <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                    router.back()
                }}></ArrowLeftIcon>
                <span className="text-xl">{username}</span>
                <LogoutIcon className="text-red-600 hover:cursor-pointer" onClick={(e) => {
                    e.stopPropagation();

                }}></LogoutIcon>
            </div>
        }
        <div className="h-full w-full mt-5 grid grid-rows-[2fr_8fr]">
            {userInfoUI}
            <div className="h-full w-full overflow-scroll">
                {loadingPosts && "loading"}
                {!loadingPosts && (
                    userInfo.posts && (
                        userInfo.posts.map(post => {
                            //@ts-ignore
                            return <FeedPost key={uuid()} post={post}></FeedPost>
                        })
                    )
                )}
            </div>

        </div >
    </>
}

function Topbar() {
    return <div className="w-full h-full overflow-hidden  content-center flex items-center px-3">
        <div className="w-full grid grid-cols-[7fr_2fr] content-center">
            {/* <div className="font-billabong text-4xl">Instagram</div>
             */}
            <Logo></Logo>
            <div className="grid grid-cols-2 gap-2 content-center">
                <div>
                    <HeartIcon></HeartIcon>
                    {/* Like */}
                </div>
                <div>
                    <ChatIcon></ChatIcon>
                    {/* Chat */}
                </div>
            </div>
        </div>
    </div>
}

type footerProps = {
    activeTab: string;
    setActiveTab: set<string>;
}

function Footer(props: footerProps) {
    const { activeTab, setActiveTab } = props;
    return <div className="grid grid-cols-5 gap-16  w-full h-full items-center justify-center align-baseline sticky bg-white">
        {ReturnIconForFooter(activeTab, "home", HomeIcon, HomeIconSolid)}
        {ReturnIconForFooter(activeTab, "search", SearchIcon, SearchIconSolid)}
        {ReturnIconForFooter(activeTab, "post", PlusIcon, PlusIconSolid)}
        {ReturnIconForFooter(activeTab, "chat", ChatIcon, ChatIconSolid)}
        {ReturnIconForFooter(activeTab, "profile", UserIcon, UserIconSolid)}
    </div>
}

export function Wrapper(props: PropsWithChildren) {
    return <div className="grid grid-rows-[6%_88%_6%] h-full w-full max-w-[500px] overflow-hidden bg-white box-border rounded-lg px-2 pt-2 font-Roboto">{props.children}</div>
}

function ReturnIconForFooter(activeTab: string, tabName: string, outline: any, solid: any) {
    const { username } = useGlobalContext();
    const router = useRouter();
    {
        if (tabName === "profile") {
            outline = React.createElement(outline, { className: "hover:cursor-pointer", onClick: () => { router.push(`?username=${username}#${tabName}`) } });
        } else {
            outline = React.createElement(outline, { className: "hover:cursor-pointer", onClick: () => { router.push(`#${tabName}`) } });
        }
        solid = React.createElement(solid, { className: "hover:cursor-pointer", onClick: () => { } });
    }

    if (activeTab === tabName) {
        return solid;
    }
    return outline;
}

function addHash(url: string, hash: string) {
    return url + "#" + hash;
}
function popHash(url: string) {
    return url.split("#")[0];

}
function removeDuplicate(arr: any[]) {
    const retArr: typeof arr = [];
    if (arr) {
        for (let i = 0; i < arr.length; i++) {
            if (!arrayIncludesDeep(arr[i], retArr)) {
                retArr.push(arr[i]);
            }
        }
        return retArr;
    }
    return arr;
}
function arrayIncludesDeep(el: any, arr: typeof el[]) {
    if (typeof el == "object") {
        for (let i = 0; i < arr.length; i++) {
            if (JSON.stringify(arr[i]) == JSON.stringify(el)) {
                return true;
            }
        }
        return false;
    } else {
        return arr.includes(el);
    }
}
function getLastHash(url: string) {
    const arr = url.split("#");
    if (arr.length > 1) {
        const afterHash = arr[arr.length - 1];
        const spliitedForQuery = afterHash.split("?");
        return spliitedForQuery[0];
    }
    return undefined;
}


export async function getServerSideProps(context: { req: NextApiRequest }) {
    type message = {
        to: string;
        content: string;
        from: string;
    }
    const hash = context.req.cookies.hash!;
    let flatPost: post[] = [];
    const connection = await connect();
    if (hash) {
        //@ts-ignore
        const reqUser = await User.findOne({ hash: hash }, "username followingCount followersCount firstLogin bio posts pendingMessages")
            .populate("followerUsers", "username")
            .populate("followingUsers", "username")
            .populate("friendUsers", "username") as user;
        console.log("requser = ", reqUser);
        if (reqUser) {
            const following = reqUser.followingUsers;
            const pendingMessagesCount = reqUser?.pendingMessages?.length;
            let messages: message[] = []
            if (pendingMessagesCount && pendingMessagesCount > 0) {
                messages = await Message.find({ _id: { $in: reqUser.pendingMessages } });
                console.log("messages = ", messages);
            }
            if (following.length > 0) {
                let posts: post[] = await Post.aggregate([
                    {
                        $redact: {
                            $cond: {
                                if: { $in: ["$postedBy", following] },
                                then: "$$DESCEND",
                                else: "$$PRUNE"
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "likedBy",
                            foreignField: "_id",
                            let: { ids: "$likedBy" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ["$_id", "$$ids"]
                                        }
                                    }
                                },
                                { $project: { username: 1, _id: 0 } },
                            ],
                            as: "likedByUsernames"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "postedBy",
                            foreignField: "_id",
                            let: { id: "$postedBy" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$_id", "$$id"]
                                        }
                                    }
                                },
                                { $project: { username: 1, _id: 0 } }
                            ],
                            as: "postedByUsername"
                        }
                    },
                ]).sort({ postedOn: -1 });
                console.log("returning ok")
                // console.log("req user = ", JSON.stringify(reqUser));
                return {
                    props: { posts: JSON.stringify(posts), selfUser: JSON.stringify(reqUser), messages: JSON.stringify(messages) }
                }
            } else {
                return {
                    props: { posts: "[]", selfUser: JSON.stringify(reqUser), messages: JSON.stringify(messages) }
                }
            }
        } else {
            return {
                props: { posts: "[]", selfUser: "{}", messages: "[]" }
            }
        }
    }
}