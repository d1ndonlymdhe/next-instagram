import { PlusIcon } from "@heroicons/react/outline";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { server } from "../pages";
import Button from "./Button";
import Input from "./Input";
import ModalWithBackdrop from "./ModalWithBackDrop";
import Spinner from "./Spinner";

export default function CreatePost() {
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
        const callback = (e: any) => {
            const placeHolder = document.getElementById("imagePlaceholder")!;
            placeHolder.style.height = window.getComputedStyle(placeHolder).width;
        }
        window.addEventListener("resize", callback);
        return () => {
            window.removeEventListener("resize", callback);
        }
    })
    useEffect(() => {
        const placeHolder = document.getElementById("imagePlaceholder")!;
        placeHolder.style.height = window.getComputedStyle(placeHolder).width;
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
                                console.log(reader)
                                reader.onload = (e) => {
                                    console.log("reader loaded")
                                    const img = document.createElement("img");
                                    img.onload = (e) => {
                                        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
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
                                            const dataurl = canvas.toDataURL(file.type, 0.6);
                                            setImageUploaded(true);
                                            setImageUrl(dataurl);
                                            fetch(dataurl).then(res => {
                                                return res.blob();
                                            }).then(blob => {
                                                //@ts-ignore
                                                picRef.current = blob;
                                            })
                                        }
                                    }
                                    //@ts-ignore
                                    img.src = e.target.result as string;
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
                <ModalWithBackdrop onclick={() => {
                    setUploading(false);
                    setUploadComplete(false);
                    router.back()
                }} title="">
                    <div className="h-32 w-32 bg-gray-400  rounded-md border-2 border-black flex flex-col justify-center items-center">
                        {!uploadComplete && <Spinner></Spinner>}
                        {uploadComplete && <>
                            <div>Complete</div>
                        </>}
                        {
                            error && <div className="text-red-500 text-center">{error}</div>
                        }
                    </div>
                </ModalWithBackdrop>
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
