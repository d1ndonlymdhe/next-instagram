import React, { useEffect, useRef, useState, createContext, useContext, Children, PropsWithChildren } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
//@ts-ignore
import uuid from "react-uuid"
import { ArrowLeftIcon, ChatIcon, HeartIcon, HomeIcon, LogoutIcon, PlusIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "@heroicons/react/outline";
import { ChatIcon as ChatIconSolid, HeartIcon as HeartIconSolid, HomeIcon as HomeIconSolid, PlusIcon as PlusIconSolid, SearchIcon as SearchIconSolid, ShoppingBagIcon as ShoppingBagIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/solid";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Spinner from "../../components/Spinner";
import Error from "../../components/Error";
import { GlobalContextProvider, useGlobalContext, useGlobalUpdateContext } from "../../components/GlobalContext2";
import { useRouter } from "next/router";
import { server } from "..";
import ProfilePicture from "../../components/ProfilePicture";
import Logo from "../../components/Logo";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { connect } from "../../utils/db";
import User from "../../utils/User";
import { user } from "../../utils/type";
import Post from "../../utils/Post";
// import Profile from "./[profile]"
type set<T> = React.Dispatch<React.SetStateAction<T>>
// const server = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api";

type post = {
    caption: string;
    likes: number;
    likedBy: string[];
    postedBy: string;
    postedByUsername: string;
    postedOn: number;
    imageUrl: string;
    profilePictureUrl: string;
    _id: string;

}
type AppPropsType = { posts: post[] };

export default function App(props: AppPropsType) {
    const { posts } = props;
    return <GlobalContextProvider>
        <Home posts={props.posts} />
    </GlobalContextProvider>
}

function Home(props: AppPropsType) {
    const globalContext = useGlobalContext();
    const globalUpdateContext = useGlobalUpdateContext();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const { posts } = props;
    const [isSearching, setisSearching] = useState(false);
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
    useEffect(() => {
        const hash = Cookies.get("hash");
        if (hash === undefined) {
            window.location.href = "/"
        }

        axios.post(`${server}/userinfo`, { hash: hash }).then(async (res) => {
            if (res.data.status === "ok") {
                if (res.data.message.firstLogin) {
                    window.location.href = "/setup";
                } else {

                    const newState = { ...globalContext, username: res.data.message.username };
                    const imgRes = await fetch(`${server}/getProfilePic?username=${res.data.message.username}`);
                    if (imgRes) {
                        const img = await imgRes.blob();
                        newState.ppBlobUrl = URL.createObjectURL(img);
                    }
                    console.log(posts);
                    newState.feedResults = posts;
                    // axios.get(`${server}/feed`, { params: { hash } }).then(res => {
                    //     const posts = res.data.posts;
                    //     newState.feedResults = posts;
                    // })
                    // fetch(`${server}/getProfilePic?username=${res.data.message.username}`).then(res => res.blob())
                    globalUpdateContext(newState);
                    setIsSignedIn(true);
                }
            } else {
                window.location.href = "/getstarted";
            }
        })
    }, []);
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
                        activeTab === "profile" &&
                        <Wrapper>

                            <Profile></Profile>
                                <Footer {...{ activeTab, setActiveTab }}></Footer>
                            {/* <Profile></Profile> */}
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
                </div>
                <Link href="/" id="toIndex" className="hidden"><a className="hidden">empty</a></Link>
                <Link href="/setup" id="toSetup" className="hidden"><a className="hidden">empty</a></Link>
            </>)
    } else {
        return <>Loading</>
    }
}

function Feed() {
    const globalContext = useGlobalContext();
    const posts = globalContext.feedResults;
    return <div className="h-full w-full overflow-y-scroll overflow-x-hidden">

        {
            posts.map((post) => {
                return <FeedPost key={uuid()} post={post}></FeedPost>
            })
        }
    </div>
}

function FeedPost(props: { post: post }) {
    useEffect(() => {
        const postPictures = document.getElementsByClassName("postPicture");
        for (let i = 0; i < postPictures.length; i++) {
            const postPicture = postPictures[i];
            //@ts-ignore
            postPictures[i].style.height = window.getComputedStyle(postPictures[0]).width;
        }
    })
    const { post } = props;
    return <div className="grid grid-rows-[1fr_auto_1fr] items-center h-fit w-full my-2 gap-2 ">
        <ProfilePictureAndUsername {...{ profilePictureUrl: post.profilePictureUrl, username: post.postedByUsername }}></ProfilePictureAndUsername>
        <div className="postPicture w-full">
            <img src={post.imageUrl}></img>
        </div>
        <div className="h-full w-full grid grid-rows-2">
            <div className="h-full w-full grid grid-cols-[1fr_9fr] items-center">
                <HeartIcon></HeartIcon>
                <div className="underline hover:cursor-pointer ml-2">
                    Liked By
                </div>
            </div>
            <div className="pl-2">
                {post.caption}
            </div>
        </div>
    </div>
}
function ProfilePictureAndUsername(props: { profilePictureUrl: string, username: string }) {
    const router = useRouter();
    const { profilePictureUrl, username } = props;
    const clickHandler = () => {
        router.push(`?username=${username}#profile`, `?username=${username}#profile`, { scroll: true })
    }
    return <div onClick={() => { clickHandler() }} className="h-full w-full grid grid-cols-[1fr_9fr] items-center hover:cursor-pointer">
        <div className="w-full">
            <img src={profilePictureUrl} className="rounded-full border-2 border-black"></img>
        </div>
        <div onClick={() => { clickHandler() }} className="h-full w-full ml-2 grid items-center hover:cursor-pointer">
            {username}
        </div>
    </div>
}
type SearchPropType = {
    setVisitingProfile: set<string>
}

function Search(props: SearchPropType) {
    const { setVisitingProfile } = props;
    const globalState = useGlobalContext();
    const updateGlobalState = useGlobalUpdateContext()
    const { username } = globalState;
    const searchRef = useRef<HTMLInputElement>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchComplete, setSearchComplete] = useState(false);
    const [forRerender, setForReRender] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const initiateSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSearching(true);
        setError("");
        const searchTerm = searchRef?.current?.value;
        if (searchTerm && searchTerm != "") {
            axios.get(`${server}/search`, { params: { searchTerm, hash: Cookies.get("hash") } }).then(res => {
                if (res.data.status === "ok") {
                    updateGlobalState({ ...globalState, searchResults: res.data.results });
                    setSearchComplete(true);
                    setIsSearching(false)
                } else {
                    setError(res.data.message.error)
                }
            })
        }
    }
    type searchBarProps = {
        initiateSearch: (e: React.FormEvent) => void;
    }
    const Searchbar = React.forwardRef<HTMLInputElement, searchBarProps>(
        (props, ref) => {
            const { initiateSearch } = props;
            return <form onSubmit={(e) => {
                initiateSearch(e)
            }}>
                <div className="h-full w-full grid grid-cols-[10fr_90fr_10fr] gap-2 px-2 items-center">
                    <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                        router.back()
                    }}></ArrowLeftIcon>
                    <Input onChange={() => { }} ref={ref} placeholder="Search" autoFocus={true} className="h-4/6"></Input>
                    <button><SearchIcon></SearchIcon></button>
                </div>
            </form>

        }
    );
    Searchbar.displayName = "SearchBar"
    type SearchResultsProps = {
        isSearching: boolean;
        searchComplete: boolean;
        setVisitingProfile: set<string>
    }
    function SearchResults(props: SearchResultsProps) {
        const globalState = useGlobalContext();
        const { isSearching, searchComplete, setVisitingProfile } = props;
        const { username } = globalState;
        const [searchResults, setSearchResults] = useState(globalState.searchResults);

        const router = useRouter();

        //loading
        if (isSearching) {
            return <div className="h-full w-full flex items-center justify-center">
                <Spinner></Spinner>
            </div>
        }
        //if query not return anything
        if (searchResults[0] == undefined) {
            return <div className="h-full w-full flex items-center justify-center">
                <div>No user found</div>
            </div>
        }
        //if search results in default state
        if (searchResults[0].username == "") {
            return <div className="h-full w-full"></div>
        }
        return (<div className="h-full flex flex-col my-5 mx-5">
            {
                searchResults.map(result => {
                    if (result.username !== username) {
                        return <div onClick={() => {
                            setVisitingProfile(result.username);
                            router.push(`?username=${result.username}#profile`);
                        }} key={uuid()}>
                            <div className="flex flex-row items-center justify-between my-3 border border-black rounded-sm py-2 px-3 hover:cursor-pointer">
                                <div className="flex flex-row items-center justify-between">
                                    <img alt="Profile Picture" src={`${server}/getProfilePic?username=${result.username}`} height="50" width="50" className="rounded-full border border-black "></img>
                                    <div className="text-center mx-5">{result.username}</div>
                                </div>
                                <Button key={uuid()} bonClick={(e) => {
                                    e.stopPropagation();
                                    if (!result.isFollowing) {
                                        //try extracting logic to fucntion
                                        axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: result.username }).then(res => {
                                            console.log("follow res = ", res);
                                            if (res.data.status === "ok") {
                                                const tempResults: (typeof searchResults) = Object.assign([], searchResults);
                                                tempResults[searchResults.indexOf(result)].isFollowing = true;
                                                setSearchResults(tempResults);
                                                setForReRender(!forRerender);
                                            }
                                        })
                                    } else {
                                        axios.post(`${server}/unfollow`, { hash: Cookies.get("hash"), toUnFollow: result.username }).then(res => {
                                            if (res.data.status === "ok") {
                                                const tempResults: (typeof searchResults) = Object.assign([], searchResults);
                                                tempResults[searchResults.indexOf(result)].isFollowing = false;
                                                setSearchResults(tempResults);
                                                setForReRender(!forRerender);
                                            }
                                        })
                                    }
                                }} text={`${result.isFollowing ? "Following" : "Follow"}`} className={`${result.isFollowing ? "bg-slate-500" : "bg-blue-400"}`}></Button>
                            </div>
                        </div>
                    }
                })
            }
        </div>
        )
    }
    return <>
        <Searchbar ref={searchRef} {...{ initiateSearch }} ></Searchbar>
        {error !== "" &&
            <div className="h-full w-full flex justify-center items-center">
                <Error message={error} className="px-3 py-2"></Error>
            </div>
        }
        {error == "" && <SearchResults {...{ isSearching, searchComplete, setVisitingProfile }}></SearchResults>}
    </>
}

//to load profile route to /home?username=username#profile
function Profile() {
    const globalState = useGlobalContext();
    const selfUsername = globalState.username;
    const router = useRouter();
    const { ppBlobUrl } = globalState;
    let [followersCount, setFollowersCount] = useState(0);
    let [followingCount, setFollowingCount] = useState(0);
    const [isfollowing, setIsFollowing] = useState(false);
    const [username, setUsername] = useState((typeof router.query.username == "string") ? router.query.username : "");
    const [ppUrl, setPpUrl] = useState("")
    const [bio, setBio] = useState("");
    useEffect(() => {
        console.log(router.query.username);
        axios.get(`${server}/userinfo`, { params: { username } }).then(res => {
            if (res.data.status === "ok") {
                setFollowersCount(res.data.message.followersCount);
                setFollowingCount(res.data.message.followingCount);
                setBio(res.data.message.bio);
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
                    console.log(res.data.results);
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
            <div className="grid grid-rows-2 justify-center items-center content-center">
                <span className="text-center">
                    Following
                </span>
                <span className="text-center">
                    {followingCount}
                </span>
            </div>
            <div className="grid grid-rows-2 justify-center items-center">
                <span className="text-center">
                    Followers
                </span>
                <span className="text-center">
                    {followersCount}
                </span>
            </div>
        </>
    }

    return <>
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
        <div className="h-full w-full mt-5 gap-5">
            <div className="grid grid-cols-[100px_auto]">
                <ProfilePicture src={ppUrl}></ProfilePicture>
                <div className="flex flex-wrap justify-around ml-5">
                    <FollowingAndFollowerCount></FollowingAndFollowerCount>
                    <div className="flex justify-center items-center w-[200%] my-4 overflow-x-auto">{bio}</div>
                    {(username !== selfUsername) &&
                        <Button bonClick={(e) => {
                            if (!isfollowing) {
                                follow(username);
                                setFollowersCount(followersCount + 1);
                            } else {
                                unFollow(username);
                                setFollowersCount(followersCount - 1);
                            }
                        }} text={isfollowing ? "following" : "follow"} className={`w-full ${!isfollowing && "hover:bg-blue-500"} ${isfollowing && "hover:bg-gray-400"}`}></Button>}
                </div >
            </div >
        </div >
    </>
}

function CreatePost() {
    const [imageUploaded, setImageUploaded] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const innerRef = useRef<HTMLInputElement>(null);
    const captionRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    // let heightOfPlaceHolderChanged = false;
    useEffect(() => {
        window.onresize = (e) => {
            const placeHolder = document.getElementById("imagePlaceholder")!;
            console.log("placeholder = ", placeHolder)
            console.log(window.getComputedStyle(placeHolder).width);
            placeHolder.style.height = window.getComputedStyle(placeHolder).width;
            console.log(placeHolder.style.height)
        }
    })
    useEffect(() => {
        const placeHolder = document.getElementById("imagePlaceholder")!;
        console.log(window.getComputedStyle(placeHolder).width);
        placeHolder.style.height = window.getComputedStyle(placeHolder).width;
        console.log(placeHolder.style.height)
    }, [])
    const FileInput = () => {
        return <div id="imagePlaceholder" className="w-full flex justify-center items-center">
            {imageUploaded && <img alt={"preview"} className="" src={imageUrl}></img>}
            <input type="file" accept={"image/jpeg,image/png,image/jpg"} ref={innerRef} className={"hidden"} id="ppUpload"></input>
            {!imageUploaded && <div className="w-1/5 h-1/5 border-gray-400 rounded-md border-4">
                <PlusIcon className="text-gray-400"></PlusIcon>
            </div>}
        </div>
    }
    const addPostPicture = (<div className={"h-full w-full flex items-center justify-center"}>
        <div id={"formElementsWrapper"} className={"flex flex-col h-full w-full items-center "}>
            <div className={"w-full h-fit border-solid border-2 border-gray-400"}>
                <label htmlFor={"ppUpload"} className={"hover:cursor-pointer w-full h-full"}
                    onChange={(e) => {
                        if (innerRef !== null) {
                            //@ts-ignore
                            const files = innerRef.current?.files
                            //@ts-ignore
                            if (files) {
                                const file = files[0];
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const img = document.createElement("img");
                                    img.onload = (e) => {
                                        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                                        console.log(img.width, img.height);
                                        const ratio = img.width / img.height
                                        let width = 1000;
                                        let height = 1000 / ratio;
                                        if (height > 1000) {
                                            width = 1000 * ratio;
                                            height = 1000;
                                        }
                                        canvas.width = 1000;
                                        canvas.height = 1000
                                        const ctx = canvas.getContext("2d");
                                        if (ctx !== null) {
                                            //@ts-ignore
                                            ctx.filter = "blur(100px)"
                                            ctx.drawImage(img, 0, 0, 1000, 1000)
                                            //@ts-ignore
                                            ctx.filter = "none";
                                            ctx.drawImage(img, (1000 - width) / 2, (1000 - height) / 2, width, height);
                                            // ctx?.drawImage(img, 0, 250, 1000, 1000);
                                            const dataurl = canvas.toDataURL(file.type);
                                            console.log(dataurl);

                                            setImageUploaded(true);
                                            setImageUrl(dataurl);
                                            fetch(dataurl).then(res => {
                                                return res.blob();
                                            }).then(blob => {
                                                //@ts-ignore
                                                picRef.current = blob;
                                                console.log(picRef);
                                            })
                                        }
                                    }
                                    //@ts-ignore
                                    img.src = e.target.result as string;
                                    console.log(img.src);
                                }
                                reader.readAsDataURL(file);
                            } else {
                                //do something
                            }
                        }
                    }}>
                    <FileInput></FileInput>
                </label>
            </div>
            <div className="mt-3 w-full grid">
                <Input onChange={() => { }} type="text" ref={captionRef} placeholder="caption" className="text-center w-[80%] ml-[10%]"></Input>
            </div>
        </div>
    </div>)
    const handleSubmit = () => {
        if (picRef.current) {
            const formData = new FormData();
            if (picRef.current) {
                formData.set("file", picRef.current);
                formData.set("hash", Cookies.get("hash")!);
                formData.set("caption", captionRef.current?.value || "");
                setUploading(true);
                axios.post(`${server}/upload`, formData).then(res => {
                    if (res.data.status === "ok") {
                        // router.back()
                        setUploadComplete(true);
                        // setUploading(false)
                    } else {
                        // setUploading(false)
                        setError(res.data.message.error);
                    }
                }).catch(err => {
                    setError(err.message);
                    setUploading(false);
                })
            }
        }
    }
    const picRef = useRef<Blob>(null);
    return (
        <>
            {uploading &&
                <div className="absolute h-screen w-screen left-0 z-10  0 flex justify-center items-center backdrop-blur-sm">
                    <div className="h-32 w-32 bg-gray-400  rounded-md border-2 border-black flex flex-col justify-center items-center">
                        {!uploadComplete && <Spinner></Spinner>}
                        {uploadComplete && <>
                            <div>Complete</div>
                            <Button bonClick={() => {
                                setUploading(false);
                                setUploadComplete(false);
                                router.back()
                            }} text="Go Back"></Button>
                        </>}
                        {
                            error && <div className="text-red-500 text-center">{error}</div>
                        }
                    </div>
                </div>
            }
            <div className=" justify-center">
                <canvas id="canvas" className="hidden"></canvas>
                <form className="w-full h-full" onSubmit={
                    (e) => {
                        e.preventDefault();
                        handleSubmit();
                    }
                }>
                    <div className="grid w-full h-full grid-rows-[95fr_5fr]">
                        {addPostPicture}
                        <div className="w-full grid justify-center">
                            <Button bonClick={() => { }} type="submit" text="submit" className="w-full"></Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
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
    return <div className="grid grid-cols-5 gap-16  w-full h-full items-center justify-center align-baseline sticky">
        {ReturnIconForFooter(activeTab, "home", HomeIcon, HomeIconSolid)}
        {ReturnIconForFooter(activeTab, "search", SearchIcon, SearchIconSolid)}
        {ReturnIconForFooter(activeTab, "post", PlusIcon, PlusIconSolid)}
        {ReturnIconForFooter(activeTab, "shopping", ShoppingBagIcon, ShoppingBagIconSolid)}
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
function getLastHash(url: string) {
    const arr = url.split("#");
    if (arr.length > 1) {
        const afterHash = arr[arr.length - 1];
        const spliitedForQuery = afterHash.split("?");
        return spliitedForQuery[0];
    }
    return undefined;
}

//hcf function
function hcf(a: number, b: number): number {
    if (b === 0) {
        return a;
    }
    return hcf(b, a % b);
}


// export async function getServerSideProps(context: { req: NextApiRequest, res: NextApiResponse, params: any }) {
//     const hash = context.req.cookies.hash!;
//     // const server = "http://localhost:3000";
//     const server = process.env.SERVER_URL;
//     const res = await fetch(`${server}/api/feed?hash=${hash}`);
//     const data: { status: string, posts: post[] } = await res.json();
//     let posts = data.posts;
//     console.log(posts);
//     if (posts) {
//         posts.map(post => {
//             post.imageUrl = `${server}/api/getPostPic?postId=${post._id}&uploaderId=${post.postedBy}`
//             post.profilePictureUrl = `${server}/api/getProfilePic?username=${post.postedByUsername}`
//             return post;
//         })
//     } else {
//         posts = [];
//     }

//     return {
//         props: { posts: posts }
//     }
// }

export async function getServerSideProps(context: { req: NextApiRequest }) {
    const hash = context.req.cookies.hash!;
    let flatPost: post[] = [];
    const connection = await connect();
    if (hash) {
        const reqUser = await User.findOne({ hash: hash }, "followingUsers") as user;
        if (reqUser) {
            const following = reqUser.followingUsers;
            if (following.length !== 0) {
                const posts = await Post.find({ postedBy: { $in: following } })
                flatPost = flatPost.concat(posts);
            }
        }
    }
}