import { useGlobalContext, useGlobalUpdateContext } from "./GlobalContext";
//@ts-ignore
import uuid from "react-uuid";
import { clientPost, getServerSideProps } from "../pages/home";
import { HeartIcon } from "@heroicons/react/outline";
import { DotsVerticalIcon, HeartIcon as HeartIconSolid } from "@heroicons/react/solid"
import axios from "axios";
import { Dispatch, FC, SetStateAction, useEffect, useReducer, useRef, useState } from "react";
import { server } from "../pages";
import ModalWithBackdrop from "./ModalWithBackDrop";
import ProfilePictureAndUsername from "./ProfilePictureAndUsername";
import { useRouter } from "next/router";
import Image from "next/image"
import { post } from "../utils/type";
import Input from "./Input";
import Button from "./Button";
import { motion } from "framer-motion"
import Toast from "./Toast"
type set<T> = React.Dispatch<SetStateAction<T>>

export default function Feed() {
    const globalContext = useGlobalContext();
    const updateContext = useGlobalUpdateContext();
    const [posts, setPosts] = useReducer((posts: clientPost[], newPosts: clientPost[]) => {
        const tempState = Object.assign({}, globalContext)
        tempState.feedResults = newPosts;
        updateContext(tempState);
        return newPosts;
    }, globalContext.feedResults)
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
    if (posts.length != 0) {
        return <>
            <div className="h-full w-full overflow-y-scroll overflow-x-hidden" id="feed">
                {
                    posts.map((post) => {
                        return <FeedPost key={uuid()} post={post} setPosts={setPosts} posts={posts} setToast={setToastMsg}></FeedPost>
                    })
                }
            </div>
        </>
    }
    return <div></div>
}
export function FeedPost(props: { post: clientPost, selfUsername?: string, setPosts: Dispatch<clientPost[]>, posts: clientPost[], setToast: set<string> }) {
    const { setPosts, posts, setToast } = props;
    const [post, setPost] = useState(props.post)
    const [selfUsername, setSelfUsername] = useState(useGlobalContext().username || props.selfUsername);
    const [isLiked, setIsLiked] = useState(selfUsername ? (post.likedByUsernames.filter(user => user.username === selfUsername).length > 0) : false);
    const [showLikedBy, setShowLikedBy] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false)
    const router = useRouter();

    useEffect(() => {
        const postPictures = document.getElementsByClassName("postPicture");
        for (let i = 0; i < postPictures.length; i++) {
            //@ts-ignore
            postPictures[i].style.height = window.getComputedStyle(postPictures[0]).width;
        }
    }, [])

    const loader = ({ src, width, quality }: any) => {
        return src;
    }
    const handleLike = (postId: string) => {
        setIsLiked(!isLiked);
        setLikeLoading(true);
        axios.post(`${server}/like`, { postId }).then((res) => {
            setLikeLoading(false);
            if (res.data.status == "ok") {
                if (res.data.message.liked == true) {
                    setIsLiked(true);
                    const tempPost = Object.assign({}, post);
                    tempPost.likedByUsernames.push({ username: selfUsername! })
                    setPost(tempPost);
                } else {
                    setIsLiked(false);
                    const tempPost = Object.assign({}, post);
                    tempPost.likedByUsernames = tempPost.likedByUsernames.filter(user => {
                        user.username !== selfUsername;
                    })
                    setPost(tempPost);
                }
            } else {
                if (res.data.message = "Post not found") {
                    const tempPosts: clientPost[] = []
                    setToast("Post Was Deleted");
                    posts.forEach(post => {
                        if (post._id !== postId) {
                            tempPosts.push(post)
                        }
                    })
                    setPosts(tempPosts)
                    // updatePosts(tempPosts)
                } else {
                    setIsLiked(!isLiked);
                }
            }
        })
    }
    return <>
        {
            showLikedBy &&
            <ModalWithBackdrop onclick={() => { setShowLikedBy(false) }} title="Liked By">
                {
                    post.likedByUsernames.map(likedBy => {
                        return <ProfilePictureAndUsername username={likedBy.username} key={uuid()} onClick={() => {
                            router.push(`/profile/${likedBy.username}`)
                        }}></ProfilePictureAndUsername>
                    })
                }
            </ModalWithBackdrop>
        }
        {
            showOptions &&
            <PostOptions post={post} setShowOptions={setShowOptions} setPosts={setPosts} posts={posts}></PostOptions>
        }
        <div className="grid grid-rows-[1fr_auto_1fr] items-center h-fit w-full my-2 gap-2 ">
            {

                post.postedByUsername[0].username !== selfUsername &&
                <ProfilePictureAndUsername {...{ username: post.postedByUsername[0].username }} onClick={() => {
                    router.push(`/profile/${post.postedByUsername[0].username}`)
                }}></ProfilePictureAndUsername>
                ||
                <div className="grid grid-cols-[9fr_1fr]">
                    <ProfilePictureAndUsername {...{ username: post.postedByUsername[0].username }} onClick={() => {
                        router.push(`/profile/${post.postedByUsername[0].username}`)
                    }}></ProfilePictureAndUsername>
                    <div className="w-full h-full" onClick={() => {
                        setShowOptions(true);
                    }}>
                        <DotsVerticalIcon className="scale-50"></DotsVerticalIcon>
                    </div>
                </div>
            }
            <div className="postPicture w-full mb-2">
                <Image loader={loader} src={`${server}/getPostPic?postId=${post._id}&uploaderId=${post.postedBy}`} height={1000} width={1000} alt={post.caption} className="z-0"></Image>
            </div>
            <div className="h-full w-full grid grid-rows-2">
                <div className="h-full w-full grid grid-cols-[1fr_9fr] items-center">
                    <div className="h-full w-full hover:cursor-pointer" onClick={() => {
                        setIsLiked(!isLiked);
                        handleLike(post._id);
                    }}>
                        {!isLiked && <HeartIcon className={`${likeLoading && "animate-pulse"}`}></HeartIcon>}
                        {isLiked && <HeartIconSolid className={`text-red-600 ${likeLoading && "animate-pulse"}`}></HeartIconSolid>}
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


function PostOptions(props: { post: clientPost, setShowOptions: set<boolean>, setPosts: Dispatch<clientPost[]>, posts: clientPost[] }) {
    const { post, posts, setShowOptions, setPosts } = props;
    const [deletePostLoading, setDeletePostLoading] = useState(false);
    const [editPostLoading, setEditPostLoading] = useState(false);
    const [alertThis, setAlertThis] = useState("");
    useEffect(() => {
        if (alertThis) {
            alert(alertThis);
            setAlertThis("");
            return () => {
                setAlertThis("")
            }
        }
    }, [alertThis])
    const captionRef = useRef<HTMLInputElement>(null)

    const deletePost = (postId: string) => {
        if (!deletePostLoading) {
            axios.post(`/api/deletePost`, { postId: postId }).then(res => {
                if (res.data.status == "ok") {
                    setDeletePostLoading(false);
                    const tempPosts: clientPost[] = []
                    posts.forEach(post => {
                        if (post._id !== postId) {
                            tempPosts.push(post)
                        }
                    })
                    setPosts(tempPosts)
                } else {
                    setAlertThis("Delete Error");
                }
            })
        }
    }
    const handleSubmit = (postId: string) => {
        //editPost
        if (!editPostLoading) {
            if (captionRef.current !== null && captionRef.current.value && captionRef.current.value !== "") {
                setEditPostLoading(true);
                captionRef.current.disabled = true
                const newCaption = captionRef.current.value
                axios.post(`/api/editPost`, { newCaption: newCaption, postId: postId }).then(res => {
                    if (res.data.status === "ok") {
                        setEditPostLoading(false);
                        setDeletePostLoading(false);
                        const tempPosts: clientPost[] = []
                        posts.forEach(post => {
                            if (post._id === postId) {
                                post.caption = newCaption;
                                tempPosts.push(post)
                            } else {
                                tempPosts.push(post)
                            }

                        })
                        setPosts(tempPosts)
                        if (captionRef.current !== null) {
                            captionRef.current.disabled = false
                        }
                    } else {
                        setAlertThis("Edit Error")
                        setEditPostLoading(false);
                    }
                })
            }
        }
    }
    return <ModalWithBackdrop title="Options" onclick={() => {
        if (!deletePostLoading) {
            setShowOptions(false)
        }
    }} className="max-w-[500px] w-[98%]">
        <div className="flex flex-col gap-2 items-center" onClick={(e) => { e.stopPropagation() }}>
            <Button className={"hover:cursor-pointer underline text-center w-full h-fit" + ` ${!deletePostLoading && "bg-red-500" || "bg-yellow-400"}`} bonClick={() => { deletePost(post._id) }} text={`${!deletePostLoading && "Delete Post" || "Loading"}`} ></Button>
            <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmit(post._id) }}>
                <div className="grid grid-rows-2 items-center content-center justify-items-center justify-center gap-2">
                    <Input onChange={() => { }} ref={captionRef} className="h-fit w-fit"></Input>
                    <Button type="submit" bonClick={() => { }} text={`${!editPostLoading && "Update Caption" || "Loading"}`} className={"w-fit h-fit py-2" + ` ${editPostLoading && "bg-yellow-400"}`}></Button>
                </div>
            </form>
        </div>
    </ModalWithBackdrop >
}