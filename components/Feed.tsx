import { useGlobalContext } from "./GlobalContext";
//@ts-ignore
import uuid from "react-uuid";
import { clientPost, getServerSideProps } from "../pages/home";
import { HeartIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid"
import axios from "axios";
import { useEffect, useState } from "react";
import { server } from "../pages";
import ModalWithBackdrop from "./ModalWithBackDrop";
import ProfilePictureAndUsername from "./ProfilePictureAndUsername";
import { useRouter } from "next/router";
export default function Feed() {
    const globalContext = useGlobalContext();
    const posts = globalContext.feedResults;
    if (posts.length != 0) {
        return <div className="h-full w-full overflow-y-scroll overflow-x-hidden">
            {
                posts.map((post) => {
                    return <FeedPost key={uuid()} {...{ post }}></FeedPost>
                })
            }
        </div>
    }
    return <div></div>
}
export function FeedPost(props: { post: clientPost, selfUsername?: string }) {
    const { post } = props;
    const [selfUsername, setSelfUsername] = useState(useGlobalContext().username || props.selfUsername);
    console.log(post)
    const [isLiked, setIsLiked] = useState(selfUsername ? (post.likedByUsernames.filter(user => user.username === selfUsername).length > 0) : false);
    const [loading, setLoading] = useState(selfUsername ? true : false);
    const [showLikedBy, setShowLikedBy] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const postPictures = document.getElementsByClassName("postPicture");
        for (let i = 0; i < postPictures.length; i++) {
            //@ts-ignore
            postPictures[i].style.height = window.getComputedStyle(postPictures[0]).width;
        }
    })

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
                        return <ProfilePictureAndUsername username={likedBy.username} key={uuid()} onClick={() => {
                            router.push(`/profile/${likedBy.username}`)
                        }}></ProfilePictureAndUsername>
                    })
                }
            </ModalWithBackdrop>
        }
        <div className="grid grid-rows-[1fr_auto_1fr] items-center h-fit w-full my-2 gap-2 ">
            <ProfilePictureAndUsername {...{ username: post.postedByUsername[0].username }} onClick={() => {
                router.push(`/profile/${post.postedByUsername[0].username}`)
            }}></ProfilePictureAndUsername>
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
