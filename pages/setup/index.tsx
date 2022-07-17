import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import Error from "../../components/Error";
import Logo from "../../components/Logo";
import Button from "../../components/Button";
import React from "react";
const server = "http://localhost:3000/api"
export default function Setup() {
    const [username, setUserName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const bioTextAreaRef = useRef<HTMLTextAreaElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [bioTextAreaRefValue, setBioTextAreaRefValue] = useState("");
    const [hash, setHash] = useState("");
    const [page, setPage] = useState(1);
    const [postcomplete, setPostcomplete] = useState(false);
    const handlePostComplete = () => {
        if (page === 4) {
            setPage(page + 1);
        }
    }
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
        const hash = Cookies.get("hash");
        if (hash) {
            setHash(hash);
            axios.post(`${server}/userinfo`, { hash: hash }).then(res => {
                if (res.data.status === "ok") {
                    setUserName(res.data.message.username);
                    setLoading(false)
                } else {
                    setError(res.data.message.text);
                    setLoading(false);
                }
            })
        } else {
            window.location.href = "/"
        }
    }, []);
    useEffect(() => {
        if (page === 5) {
            window.location.href = "/"
        }
    }, [page])
    if (error !== "") {
        return <Error message="error"></Error>
    }
    if (loading) {
        return <div>Loading</div>
    }
    return (<div id="setup" className={"flex flex-col h-screen w-screen content-around"}>
        <main className="w-screen h-full flex flex-row justify-center items-center">
            <div
                className={"w-[95%] min-h-[350px] items-center flex flex-row justify-center md:border-gray-200 border-solid border-2 max-w-[350px]"}>
                <div
                    className={"my-5 grid grid-rows-[2fr_7fr_1fr] justify-center items-center content-center w-full max-w-[300px]"}>
                    <div id="topbar" className="flex w-full h-full mt-2 justify-center">
                        <Logo className="h-full w-auto text-3xl"></Logo>
                    </div>
                    {(page === 1) && <Welcome username={username}></Welcome>}
                    {(page === 2) && <AddBio ref={bioTextAreaRef}></AddBio>}
                    {(page === 3) && <AddProfilePicture ref={fileRef}></AddProfilePicture>}
                    {(page === 4) && ((postcomplete && <Button bonClick={handlePostComplete} text="Continue"></Button>) || (!postcomplete && <div>Loading</div>))}
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
        const [imageUploaded, setImageUploaded] = useState(false);
        const [imageUrl, setImageUrl] = useState("");
        const input = (<div className={"px-5 py-2"}>
            {imageUploaded ? "Select Another" : "Select Photo"}
            <input type="file" accept={"image/jpeg,image/png,image/jpg"} ref={ref} className={"hidden"}
                id={"ppUpload"}></input>
        </div>)
        return <div className={"h-full flex items-center justify-center"}>
            <form className={"h-full"} onSubmit={(e) => {
                e.preventDefault()
            }}>
                <div id={"formElementsWrapper"} className={"flex flex-col h-full items-center justify-around "}>
                    <div>Upload a Profile Picture</div>
                    {imageUploaded && <img alt={"preview"} src={imageUrl}></img>}
                    <div className={" h-fit border-solid border-2 border-gray-400"}>
                        <label htmlFor={"ppUpload"} className={"hover:cursor-pointer h-4 w-full"}
                            onChange={(e) => {
                                if (ref !== null) {
                                    //@ts-ignore
                                    const files = ref.current?.files
                                    //@ts-ignore
                                    console.log(ref.current);
                                    let file: Blob;
                                    let imgUrl: string;
                                    if (files) {
                                        file = files[0];
                                        imgUrl = URL.createObjectURL(file);
                                        setImageUrl(imgUrl);
                                        setImageUploaded(true);
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
