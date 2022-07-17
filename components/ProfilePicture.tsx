import Image from "next/image"
export default function ProfilePicture(props: {
    src: string
    className?: string
}) {
    return <img src={props.src} height="100" width="100" alt="Profile Picture" className={`rounded-full border border-black ${props.className || ""}`}></img>
}