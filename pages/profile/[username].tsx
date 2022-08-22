import { useRouter } from "next/router";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../utils/User"
import Post from "../../utils/Post"
import { connect } from "../../utils/db"
import { post, user } from "../../utils/type";
import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import ModalWithBackdrop from "../../components/ModalWithBackDrop";
import ProfilePictureAndUsername from "../../components/ProfilePictureAndUsername";
import Cookies from "js-cookie";
import { FeedPost } from "../../components/Feed";
//@ts-ignore
import uuid from "react-uuid"
import Button from "../../components/Button";
import ProfilePicture from "../../components/ProfilePicture";
import { LogoutIcon } from "@heroicons/react/outline";
import { Wrapper } from "../../components/Wrapper";
import Header from "../../components/Header"
type ProfileProps = {
    error?: string;
    selfUser: string;
    user: string;
    posts: string;
    isFollowing: string;
}
const server = "/api"

export default function Profile(props: ProfileProps) {
    const selfUser = JSON.parse(props.selfUser) as user;
    const user = JSON.parse(props.user) as user;
    const posts = JSON.parse(props.posts) as post[];
    const [isfollowing, setIsFollowing] = useState<boolean>(JSON.parse(props.isFollowing));
    const router = useRouter();
    const username = user.username
    const selfUsername = selfUser.username
    const [userInfo, setUserInfo] = useState<Pick<user, "followingCount" | "followerUsers" | "followersCount" | "bio" | "posts" | "followingUsers" | "friendUsers">>({
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        followerUsers: user.followerUsers,
        followingUsers: user.followingUsers,
        bio: user.bio,
        friendUsers: user.friendUsers,
        //@ts-ignore
        posts: user.posts
    })
    const ppUrl = `${server}/getProfilePic?username=${username}`
    const [showFollowerUsers, setShowFollowerUsers] = useState(false);
    const [showFollowingUsers, setShowFollowingUsers] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const FollowButton = (props: { isFollowing: boolean, username: string }) => {
        const { isFollowing, username } = props;
        const [followLoading, setFollowLoading] = useState(false);
        return <Button key={uuid()} bonClick={(e) => {
            if (!followLoading) {
                setFollowLoading(true)
                if (!isFollowing) {
                    //try extracting logic to fucntion
                    axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: username }).then(res => {
                        console.log("follow res = ", res);
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
    if (props.error) {
        return <>

        </>
    }
    return <>
        <Header></Header>
        <div className="h-screen w-screen flex justify-center items-center bg-slate-400">
            <Wrapper>
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
                        {
                            posts.length > 0 && (
                                posts.map(post => {
                                    //@ts-ignore
                                    return <FeedPost key={uuid()} post={post} selfUsername={selfUsername}></FeedPost>
                                })
                            ) || <div className="grid h-full w-full justify-center items-center">
                                <span>No Posts</span>
                            </div>
                        }
                    </div>
                </div>
            </Wrapper>
        </div>
    </>
}

export async function getServerSideProps(context: { req: NextApiRequest, res: NextApiResponse, params: { username: string } }) {
    const { username } = context.params;
    const hash = context.req.cookies.hash!;
    if (hash) {
        if (username) {
            const connection = await connect()
            const reqUser = await User.findOne({ username: username }, "username followingCount followersCount bio posts")
                .populate("followerUsers", "username")
                .populate("followingUsers", "username") as user;
            const loggedInUser = await User.findOne({ hash: hash }, "username") as user;
            if (reqUser) {
                const following = reqUser.followingUsers;
                const followers = reqUser.followerUsers;
                const isFollowing = following.some(user => user.username === loggedInUser.username);
                const posts: post[] = await Post.aggregate([
                    {
                        $redact: {
                            $cond: {
                                if: { $in: ["$postedBy", [reqUser._id]] },
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
                    }
                ]).sort({ postedOn: -1 })
                return {
                    props: { posts: JSON.stringify(posts), selfUser: JSON.stringify(loggedInUser), user: JSON.stringify(reqUser), isFollowing: JSON.stringify(isFollowing) }
                }
            } else {
                return {
                    props: {
                        error: "User not found"
                    }
                }
            }
        } else {
            return {
                props: {
                    error: "User not found"
                }
            }
        }
    } else {
        return {
            props: {
                error: "Not Logged In"
            }
        }
    }
}