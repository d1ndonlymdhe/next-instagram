import { ArrowLeftIcon, LogoutIcon } from "@heroicons/react/outline";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState, useEffect, useReducer } from "react";
import { server } from "../pages";
import { user } from "../utils/type";
import { FeedPost } from "./Feed";
import Button from "./Button";
import { useGlobalContext } from "./GlobalContext";
import ModalWithBackdrop from "./ModalWithBackDrop";
import ProfilePictureAndUsername from "./ProfilePictureAndUsername";
import Image from "next/image"
//@ts-ignore
import uuid from "react-uuid"
import { clientPost } from "../pages/home";
import Toast from "./Toast";
type clientUser = {
    followersCount: number,
    followingCount: number,
    followerUsers: { username: string }[],
    followingUsers: { username: string }[],
    bio: string
    friendUsers: { username: string }[],
    posts: clientPost[]

}


//to load profile route to /home?username=username#profile
export default function Profile(props: { username?: string }) {
    const globalState = useGlobalContext();
    const selfUsername = globalState.username;
    const router = useRouter();
    const { ppBlobUrl } = globalState;
    const [userInfo, setUserInfo] = useState<clientUser>({
        followersCount: 0,
        followingCount: 0,
        followerUsers: [{ username: "" }],
        followingUsers: [{ username: "" }],
        bio: "",
        friendUsers: [{ username: "" }],
        posts: []
    })
    const [posts, setPosts] = useReducer((posts: clientPost[], newPosts: clientPost[]) => {
        const tempUserInfo = Object.assign({}, userInfo);
        tempUserInfo.posts = newPosts;
        setUserInfo(tempUserInfo)
        return newPosts
    }, userInfo.posts)
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isfollowing, setIsFollowing] = useState(false);
    const [showFollowerUsers, setShowFollowerUsers] = useState(false);
    const [showFollowingUsers, setShowFollowingUsers] = useState(false);
    const [username, setUsername] = useState(props.username || "");
    const [ppUrl, setPpUrl] = useState("")
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    useEffect(() => {

        if (toastMsg) {
            alert(toastMsg)
            setToastMsg("")
            return () => {
                setToastMsg("")
            }
        }
    }, [toastMsg])
    const FollowButton = (props: { isFollowing: boolean, username: string }) => {
        const { isFollowing, username } = props;
        const [followLoading, setFollowLoading] = useState(false);
        return <Button key={uuid()} bonClick={(e) => {
            if (!followLoading) {
                setFollowLoading(true)
                if (!isFollowing) {
                    //try extracting logic to fucntion
                    axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: username }).then(res => {
                        if (res.data.status === "ok") {
                            setFollowLoading(false)
                            const tempUserInfo = Object.assign({}, userInfo);
                            tempUserInfo.followersCount++;
                            tempUserInfo.followerUsers.push({ username: selfUsername });
                            setUserInfo(tempUserInfo)
                            setIsFollowing(true);
                        }
                    })
                } else {
                    axios.post(`${server}/unfollow`, { hash: Cookies.get("hash"), toUnFollow: username }).then(res => {
                        if (res.data.status === "ok") {
                            setFollowLoading(false)
                            const tempUserInfo = Object.assign({}, userInfo);
                            tempUserInfo.followersCount--;
                            tempUserInfo.followerUsers = tempUserInfo.followerUsers.filter(user => {
                                return user.username !== selfUsername;
                            })
                            setUserInfo(tempUserInfo)
                            setIsFollowing(false);
                        }
                    })
                }
            }
        }} text={`${!followLoading ? (isFollowing ? "Following" : "Follow") : "Loading"}`} className={`w-full ${!followLoading ? (isFollowing ? "bg-slate-500" : "bg-blue-400") : "bg-yellow-400"}`}></Button>
    }
    useEffect(() => {
        // setUsername((typeof router.query.username == "string") ? router.query.username : "")
        axios.get(`${server}/userinfo`, { params: { username } }).then(async userInfoRes => {
            if (userInfoRes.data.status === "ok") {
                axios.get(`${server}/getPostsFromUser`, { params: { username } }).then(res => {
                    if (res.data.status == "ok") {
                        const { followersCount, followingCount, followerUsers, followingUsers, bio, friendUsers } = userInfoRes.data.message
                        const posts: clientPost[] = res.data.posts
                        setUserInfo({ followersCount, followingCount, followerUsers, followingUsers, posts, bio, friendUsers })
                        setPosts(posts)
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
        <div>
            <Image loader={({ src, quality, width }) => {
                return src;
            }} src={`/api/getProfilePic?username=${username}`} height={100} width={100} style={{ minHeight: "100px", maxHeight: "100px" }} className="rounded-full border border-black aspect-square" alt="Profile Picture" priority></Image>
        </div>
        <div className="flex flex-wrap justify-around ml-5">
            <FollowingAndFollowerCount></FollowingAndFollowerCount>
            <div className="flex justify-center items-center w-[200%] my-4 overflow-x-auto">{userInfo.bio}</div>
            {(username !== selfUsername) &&
                <FollowButton username={username} isFollowing={isfollowing}></FollowButton>
            }
        </div >
    </div>
    const logoutModal = <ModalWithBackdrop onclick={() => { setShowLogoutModal(false) }} title="Confirm Logout">
        <div className="grid grid-cols-2">
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <p>Are you sure you want to logout?</p>
                </div>
            </div>
            <Button bonClick={() => { localStorage.clear(); Cookies.set("hash", ""); window.location.href = "/"; }} text="Logout" className="bg-red-400" ></Button>
        </div>
    </ModalWithBackdrop>
    return <>
        {
            showFollowerUsers &&
            <ModalWithBackdrop onclick={() => { setShowFollowerUsers(false) }} title="Followers">
                {
                    userInfo.followerUsers.map(follower => {
                        return <div className="m-2" key={uuid()}>
                            <ProfilePictureAndUsername key={uuid()} username={follower.username} onClick={() => {
                                router.push(`/profile/${follower.username}`)
                            }}></ProfilePictureAndUsername>
                        </div>
                    })
                }
            </ModalWithBackdrop>
        }
        {
            showFollowingUsers &&
            <ModalWithBackdrop onclick={() => { setShowFollowingUsers(false) }} title="Following">
                {
                    userInfo.followingUsers.map(following => {
                        return <div className="m-2" key={uuid()}>
                            <ProfilePictureAndUsername key={uuid()} username={following.username} onClick={() => {
                                router.push(`profile/${following.username}`);
                            }}></ProfilePictureAndUsername>
                        </div>
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
            <>
                {
                    showLogoutModal && logoutModal
                }
                <div className="h-full w-full items-center grid grid-cols-[10fr_80fr_10fr] gap-5">
                    <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                        router.back()
                    }}></ArrowLeftIcon>
                    <span className="text-xl">{username}</span>
                    <LogoutIcon className="text-red-600 hover:cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setShowLogoutModal(true);
                    }}></LogoutIcon>
                </div>
            </>
        }
        <div className="h-full w-full mt-5 grid grid-rows-[2fr_8fr]">
            {userInfoUI}
            <div className="h-full w-full overflow-scroll">
                {loadingPosts && "loading"}
                {!loadingPosts && (
                    userInfo.posts && (
                        posts.map(post => {
                            return <FeedPost key={uuid()} post={post} posts={posts} setPosts={setPosts} setToast={setToastMsg}></FeedPost>
                        })
                    )
                )}
            </div>

        </div >
    </>
}
