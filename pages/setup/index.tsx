import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import React from "react";
import Header from "../../components/Header";
import { NextApiRequest } from "next";
import User from "../../utils/User";
import { user } from "../../utils/type";
import Link from "next/link";
import Spinner from "../../components/Spinner";
import Image from "next/image";
//@ts-ignore
import uuid from "react-uuid"
const server = "/api/"
export default function Setup(props: { username: string, topUsers: string, error?: string }) {
    // const [username, setUserName] = useState(props.username);
    const username = props.username
    const topUsers = JSON.parse(props.topUsers) as user[]
    // const [loading, setLoading] = useState(false);
    const bioTextAreaRef = useRef<HTMLTextAreaElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [bioTextAreaRefValue, setBioTextAreaRefValue] = useState("");
    const hash = Cookies.get("hash")!
    const [page, setPage] = useState(1);
    const [postcomplete, setPostcomplete] = useState(false);
    const handleNextPage = () => {
        if (page === 2) {
            const textAreaValue = bioTextAreaRef.current?.value;
            if (textAreaValue !== undefined) {
                setBioTextAreaRefValue(textAreaValue)
            } else {
                setBioTextAreaRefValue("");
            }
        }
        if (page === 3) {
            let file: Blob;
            if (fileRef?.current?.files) {
                file = fileRef?.current?.files[0];
                let formData = new FormData()
                if (hash !== undefined) {
                    formData.append("hash", hash);
                    formData.append("profilePicture", file);
                    formData.append("bio", bioTextAreaRefValue);
                    console.log(bioTextAreaRefValue);
                    axios.post(`${server}/setprofile`, formData, {
                        headers: { "Content-Type": "multipart/form-data" }
                    }).then(res => {
                        console.log(res.data);
                        setPostcomplete(true);
                    })
                }
            }
        }
        setPage(page + 1);
    }
    useEffect(() => {
        if (page === 5) {
            window.location.href = "/home"
        }
    }, [page])

    const TopUserComponent = (props: { username: string }) => {
        const username = props.username;
        const [isFollowing, setIsFollowing] = useState(false);
        const [followLoading, setFollowLoading] = useState(false);
        return <div className="h-full w-full grid grid-cols-[1fr_8fr_1fr] items-center">
            <div className="w-full">
                <Image loader={({ src }: { src: string }) => {
                    return src;
                }} src={`/api/getProfilePic?username=${username}`} height={100} width={100} className="rounded-full"></Image>
            </div>
            <div className="h-full ml-2 grid items-center">
                {username}
            </div>
            <Button bonClick={() => {
                if (!followLoading) {
                    setFollowLoading(true);
                    if (!isFollowing) {
                        axios.post(`${server}/follow`, { hash: Cookies.get("hash"), toFollow: username }).then(res => {
                            if (res.data.status === "ok") {
                                setFollowLoading(false)
                                setIsFollowing(true);
                            }
                        })
                    } else {
                        axios.post(`${server}/unfollow`, { hash: Cookies.get("hash"), toUnFollow: username }).then(res => {
                            if (res.data.status === "ok") {
                                setFollowLoading(false)
                                setIsFollowing(false);
                            }
                        })
                    }
                }
            }} text={`${!followLoading ? (isFollowing ? "Following" : "Follow") : "Loading"}`} className={`w-full ${!followLoading ? (isFollowing ? "bg-slate-500" : "bg-blue-400") : "bg-yellow-400"}`}></Button>
        </div>

    }

    if (props.error) {
        return <>
            <div className="h-screen w-screen flex justify-center items-center bg-slate-400">
                <div className="grid justify-center items-center content-center h-full w-full max-w-[500px] overflow-hidden bg-white box-border rounded-lg px-2 pt-2 font-Roboto">
                    <div className="grid grid-rows-2 gap-2">
                        <span className="w-full text-center">
                            {props.error}
                        </span>
                        <Link href="/"><a><Button text="Go Back" bonClick={() => { }}></Button></a></Link>
                    </div>
                </div>
            </div>
        </>
    }
    if (page === 5) {
        return <><div></div></>
    }
    return (<div id="setup" className={"flex flex-col h-screen w-screen content-around"}>
        <Header></Header>
        <main className="w-screen h-full flex flex-row justify-center items-center">
            <div
                className={"w-[95%] min-h-[350px] items-center flex flex-row justify-center md:border-gray-200 border-solid border-2 max-w-[350px]"}>
                <div
                    className={"my-5 grid grid-rows-[2fr_7fr_1fr] justify-center items-center content-center w-full max-w-[300px]"}>
                    <div id="topbar" className="flex w-full h-full mt-2 justify-center">
                        <Logo></Logo>
                    </div>
                    {(page === 1) && <Welcome username={username}></Welcome>}
                    {(page === 2) && <AddBio ref={bioTextAreaRef}></AddBio>}
                    {(page === 3) && <AddProfilePicture ref={fileRef}></AddProfilePicture>}
                    {/* @ts-ignore */}
                    {(page === 4) && (!postcomplete && <div><Spinner></Spinner></div> || (topUsers !== "") && <div className="flex flex-col h-full">
                        {
                            topUsers.map(user => {
                                if (user.username !== username && !user.firstLogin) {
                                    return <div className="m-2" key={uuid()}>
                                        <TopUserComponent username={user.username}></TopUserComponent>
                                    </div>
                                }
                            })
                        }
                    </div> || <div>Continue</div>)}

                    <Button text={"Continue"} bonClick={handleNextPage} className={"py-2 hover:bg-green-400"}></Button>
                </div>
            </div>
        </main>
    </div>)
}

function Welcome(props: { username: string }) {
    const { username } = props;
    return (<div>
        Welcome {username}
    </div>)
}

const AddBio = React.forwardRef<HTMLTextAreaElement, {}>(
    (props, ref) => {
        return <div className={"flex flex-col h-full justify-evenly items-center"}>
            <div>Write Something About You</div>
            <div>
                <form>
                    {/*<Input onChange={()=>{}} type={"textarea"} className={"h-fit"}></Input>*/}
                    <textarea ref={ref}
                        className={"border-2 border-solid border-gray-400 active:drop-shadow-2xl max-h-[250px]"}></textarea>
                </form>
            </div>
        </div>
    }
);
AddBio.displayName = "AddBio";


const AddProfilePicture = React.forwardRef<HTMLInputElement, {}>(
    (props, ref) => {
        const [error, setError] = useState("");
        const fileRef = useRef<HTMLInputElement>(null)
        const picRef = useRef<HTMLImageElement>(null)
        const [imageUploaded, setImageUploaded] = useState(false);
        const [imageUrl, setImageUrl] = useState("");
        const input = (<div className={"px-5 py-2"}>
            {imageUploaded ? "Select Another" : "Select Photo"}
            <input type="file" accept={"image/jpeg,image/png,image/jpg"} ref={ref} className={"hidden"}
                id={"ppUpload"}></input>
        </div>)
        return <div className={"h-full flex items-center justify-center"}>
            <canvas id="canvas" className="hidden"></canvas>
            <form className={"h-full"} onSubmit={(e) => {
                e.preventDefault()
            }}>
                <div id={"formElementsWrapper"} className={"flex flex-col h-full items-center justify-around "}>
                    <div>Upload a Profile Picture</div>
                    {imageUploaded && <img alt={"preview"} src={imageUrl} ref={picRef}></img>}
                    <div className={" h-fit border-solid border-2 border-gray-400"}>
                        <label htmlFor={"ppUpload"} className={"hover:cursor-pointer h-4 w-full"}
                            onChange={(e) => {
                                if (ref !== null) {
                                    //@ts-ignore
                                    const files = ref.current?.files
                                    //@ts-ignore
                                    if (files) {
                                        const file = files[0];
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            const img = document.createElement("img");
                                            console.log("abcd")
                                            img.onload = (e) => {
                                                console.log("image loaded")
                                                const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                                                const ratio = img.width / img.height;
                                                let width = 500;
                                                let height = 500 / ratio;
                                                if (height > 500) {
                                                    width = 500 * ratio;
                                                    height = 500;
                                                }
                                                canvas.width = 500;
                                                canvas.height = 500;
                                                const ctx = canvas.getContext("2d");
                                                if (ctx !== null) {
                                                    ctx.filter = "blur(100px)"
                                                    ctx.drawImage(img, 0, 0, 500, 500)
                                                    ctx.filter = "none"
                                                    ctx.drawImage(img, (500 - width) / 2, (500 - height) / 2, width, height)
                                                    const dataurl = canvas.toDataURL(file.type, 0.4);
                                                    setImageUploaded(true)
                                                    setImageUrl(dataurl)
                                                    fetch(dataurl).then(res => {
                                                        return res.blob()
                                                    }).then(blob => {
                                                        //@ts-ignore
                                                        picRef.current = blob;
                                                    })
                                                }
                                            }
                                            //@ts-ignore
                                            console.log(e.target?.result)
                                            //@ts-ignore
                                            img.src = e.target?.result as string

                                        }
                                        reader.readAsDataURL(file)
                                    } else {
                                        //do something
                                    }
                                }
                            }}>{input}</label>
                    </div>
                </div>
            </form>
        </div>
    }
);
AddProfilePicture.displayName = "AddProfilePicture";


export async function getServerSideProps(context: { req: NextApiRequest }) {
    const hash = context.req.cookies.hash;
    if (hash) {
        const selfUser = await User.findOne({ hash }, "username firstLogin") as user;

        if (selfUser) {
            if (!selfUser.firstLogin) {
                return {
                    redirect: {
                        permanent: false,
                        destination: "/home"
                    }
                }
            }
            const topUsers = await User.find({}, "username firstLogin").limit(5).sort({ followersCount: -1 }) as user[];
            return {
                props: {
                    username: selfUser.username,
                    topUsers: JSON.stringify(topUsers || "")
                }
            }
        } else {
            return {
                redirect: {
                    permanent: false,
                    destination: "/getstarted"
                }
            }
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: "/getstarted"
            }
        }

    }
}