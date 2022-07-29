import React, { useEffect, useRef, useState, PropsWithChildren } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Link from "next/link";
//@ts-ignore
import uuid from "react-uuid"
import { ArrowLeftIcon, ChatIcon, HeartIcon, HomeIcon, LogoutIcon, PlusIcon, SearchIcon, ShoppingBagIcon, UserIcon } from "@heroicons/react/outline";
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
import Search from "../../components/Search"
import CreatePost from "../../components/CreatePost";
import ModalWithBackdrop from "../../components/ModalWithBackDrop";
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
type AppPropsType = { posts: string };

export default function App(props: AppPropsType) {
    const { posts } = props;
    //@ts-ignore
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
                                <div className="grid grid-cols-[5fr_95fr] justify-center items-center w-full">
                                    <ArrowLeftIcon onClick={() => { router.back() }}></ArrowLeftIcon>
                                    <div className="text-center text-xl">Chats</div>
                                </div>
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
function Feed() {
    const globalContext = useGlobalContext();
    const posts = globalContext.feedResults;
    const [showLikedBy, setShowLikedBy] = useState({ state: false, postId: "" });
    return <div className="h-full w-full overflow-y-scroll overflow-x-hidden">
        {
            posts.map((post) => {
                return <FeedPost key={uuid()} {...{ post }}></FeedPost>
            })
        }
    </div>
}
function FeedPost(props: { post: clientPost }) {
    useEffect(() => {
        const postPictures = document.getElementsByClassName("postPicture");
        for (let i = 0; i < postPictures.length; i++) {
            //@ts-ignore
            postPictures[i].style.height = window.getComputedStyle(postPictures[0]).width;
        }
    })
    const { post } = props;
    const selfUsername = useGlobalContext().username;
    const [isLiked, setIsLiked] = useState(post.likedByUsernames.filter(user => user.username === selfUsername).length > 0);
    const [showLikedBy, setShowLikedBy] = useState(false);
    const handleLike = (postId: string) => {
        setIsLiked(!isLiked);
        axios.post(`${server}/like`, { postId }).then((res) => {
            if (res.data.status == "ok") {
                if (res.data.message.liked == true) {
                    setIsLiked(true);
                } else {
                    setIsLiked(false);
                }
            } else {
                setIsLiked(!isLiked);
            }
        })
    }
    return <>
        {
            showLikedBy &&
            <ModalWithBackdrop onclick={() => { setShowLikedBy(false) }} title="Liked By">
                {
                        post.likedByUsernames.map(likedBy => {
                            return <ProfilePictureAndUsername username={likedBy.username} key={uuid()}></ProfilePictureAndUsername>
                        })
                    }
            </ModalWithBackdrop>
        }
        <div className="grid grid-rows-[1fr_auto_1fr] items-center h-fit w-full my-2 gap-2 ">
            <ProfilePictureAndUsername {...{ username: post.postedByUsername[0].username }}></ProfilePictureAndUsername>
            <div className="postPicture w-full mb-2">
                <img src={`${server}/getPostPic?postId=${post._id}&uploaderId=${post.postedBy}`}></img>
            </div>
            <div className="h-full w-full grid grid-rows-2">
                <div className="h-full w-full grid grid-cols-[1fr_9fr] items-center">
                    <div className="h-full w-full hover:cursor-pointer" onClick={() => {
                        setIsLiked(!isLiked);
                        handleLike(post._id);
                    }}>
                        {!isLiked && <HeartIcon></HeartIcon>}
                        {isLiked && <HeartIconSolid className="text-red-600"></HeartIconSolid>}
                    </div>
                    <div className="underline hover:cursor-pointer ml-2" onClick={() => { setShowLikedBy(true) }}>
                        Liked By
                    </div>
                </div>
                <div className="pl-2">
                    {post.caption}
                </div>
            </div>
        </div>
    </>
}

function Chat() {
    return <div>Chat</div>
}

function ProfilePictureAndUsername(props: { username: string }) {
    const router = useRouter();
    const { username } = props;
    const clickHandler = () => {
        router.push(`?username=${username}#profile`, `?username=${username}#profile`, { scroll: true })
    }
    return <div onClick={() => { clickHandler() }} className="h-full w-full grid grid-cols-[1fr_9fr] items-center hover:cursor-pointer">
        <div className="w-full">
            <img src={`${server}/getProfilePic?username=${username}`} className="rounded-full border-2 border-black"></img>
        </div>
        <div onClick={() => { clickHandler() }} className="h-full ml-2 grid items-center hover:cursor-pointer">
            {username}
        </div>
    </div>
}

//to load profile route to /home?username=username#profile
function Profile() {
    const globalState = useGlobalContext();
    const selfUsername = globalState.username;
    const router = useRouter();
    const { ppBlobUrl } = globalState;
    const [userInfo, setUserInfo] = useState<Pick<user, "followingCount" | "followerUsers" | "followersCount" | "bio" | "posts" | "followingUsers">>({
        followersCount: 0,
        followingCount: 0,
        followerUsers: [{ username: "" }],
        followingUsers: [{ username: "" }],
        bio: "",
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
        axios.get(`${server}/userinfo`, { params: { username } }).then(async userInfo => {
            if (userInfo.data.status === "ok") {
                axios.get(`${server}/getPostsFromUser`, { params: { username } }).then(res => {
                    if (res.data.status == "ok") {
                        const { followersCount, followingCount, followerUsers, followingUsers, bio } = userInfo.data.message
                        const posts = res.data.posts
                        setUserInfo({ followersCount, followingCount, followerUsers, followingUsers, posts, bio })
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
    const hash = context.req.cookies.hash!;
    let flatPost: post[] = [];
    const connection = await connect();
    if (hash) {
        const reqUser = await User.findOne({ hash: hash }, "followingUsers") as user;
        if (reqUser) {
            const following = reqUser.followingUsers;
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
                return {
                    props: { posts: JSON.stringify(posts) }
                }
            } else {
                return {
                    props: { posts: "[]" }
                }
            }
        } else {
            return {
                props: { posts: "[]" }
            }
        }
    }
}