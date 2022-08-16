import { useRouter } from "next/router";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import img from "next/image";
import mongoose from "mongoose"
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
type ProfileProps = {
    error?: string;
    selfUser: string;
    user: string;
    posts: string;
    isFollowing: string;
}
const server = "/api"

export default function Profile(props: ProfileProps) {
    if (props.error) {
        return <div>{props.error}</div>
    }
    const router = useRouter();
    const [user, setUser] = useState(JSON.parse(props.user) as user);
    const username = user.username;
    const self = JSON.parse(props.selfUser) as user;
    const posts = JSON.parse(props.posts) as post[];
    const [loadingPosts, setLoadingPosts] = useState(true);
    console.log(props.isFollowing)
    const [isfollowing, setIsFollowing] = useState(JSON.parse(props.isFollowing) as boolean);
    const [showFollowerUsers, setShowFollowerUsers] = useState(false);
    const [showFollowingUsers, setShowFollowingUsers] = useState(false);
    const ppUrl = `/api/getProfilePic?username=${username}`
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
                    {user.followingCount}
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
                    {user.followersCount}
                </span>
            </div>
        </>
    }

    const userInfoUI = <div className="grid grid-cols-[100px_auto]">
        <ProfilePicture src={ppUrl}></ProfilePicture>
        <div className="flex flex-wrap justify-around ml-5">
            <FollowingAndFollowerCount></FollowingAndFollowerCount>
            <div className="flex justify-center items-center w-[200%] my-4 overflow-x-auto">{user.bio}</div>
            {(username !== self.username) &&
                <Button bonClick={(e) => {
                    if (!isfollowing) {
                        follow(username);
                        setUser({ ...user, followersCount: user.followersCount + 1 });
                    } else {
                        unFollow(username);
                        setUser({ ...user, followersCount: user.followersCount - 1 });
                    }
                }} text={isfollowing ? "following" : "follow"} className={`w-full ${!isfollowing && "hover:bg-blue-500"} ${isfollowing && "hover:bg-gray-400"}`}></Button>}
        </div >
    </div>

    return (
        <div className="h-screen w-screen flex justify-center items-center bg-slate-400">
            <div className="grid grid-rows-[6%_88%_6%] h-full w-full max-w-[500px] overflow-hidden bg-white box-border rounded-lg px-2 pt-2 font-Roboto">
                <div className="h-full w-full items-center grid grid-cols-[10fr_90fr] gap-5">
                    <ArrowLeftIcon className="hover:cursor-pointer" onClick={() => {
                        router.back()
                    }}></ArrowLeftIcon>
                    <span className="text-xl">{username}</span>
                </div>
                <div className="h-full w-full mt-5 grid grid-rows-[2fr_8fr]">
                    {userInfoUI}
                    <div className="h-full w-full overflow-scroll">
                        {
                            posts.map(post => {
                                //@ts-ignore
                                return <FeedPost key={uuid()} post={post} selfUsername={self.username}></FeedPost>
                            })
                        }
                    </div>

                </div >
                <div></div>
            </div>
        </div>
    )

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