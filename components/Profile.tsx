import { ArrowLeftIcon, LogoutIcon } from "@heroicons/react/outline";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { server } from "../pages";
import { user } from "../utils/type";
import { FeedPost } from "./Feed";
import Button from "./Button";
import { useGlobalContext } from "./GlobalContext2";
import ModalWithBackdrop from "./ModalWithBackDrop";
import ProfilePicture from "./ProfilePicture";
import ProfilePictureAndUsername from "./ProfilePictureAndUsername";
//@ts-ignore
import uuid from "react-uuid"
//to load profile route to /home?username=username#profile
export default function Profile(props: { username?: string }) {
    console.log("rerender")
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
    const [username, setUsername] = useState(props.username || "");
    const [ppUrl, setPpUrl] = useState("")
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    useEffect(() => {
        // setUsername((typeof router.query.username == "string") ? router.query.username : "")
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
