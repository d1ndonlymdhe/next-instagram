import { useRouter } from "next/router";
import { server } from "../pages";
import Button from "./Button";

export default function ProfilePictureAndUsername(props: { username: string, ActionButton?: string, onClick?: () => void }) {
    const router = useRouter();
    const { username, onClick, ActionButton } = props;
    const clickHandler = onClick ? onClick : () => {
        router.push(`?username=${username}#Profile`, `?username=${username}#Profile`, { scroll: true })
    }
    return <div onClick={() => { clickHandler() }} className="h-full w-full grid grid-cols-[1fr_8fr_1fr] items-center hover:cursor-pointer">
        <div className="w-full">
            <img src={`${server}/getProfilePic?username=${username}`} className="rounded-full border-2 border-black"></img>
        </div>
        <div className="h-full ml-2 grid items-center hover:cursor-pointer">
            {username}
        </div>
        {ActionButton && <Button bonClick={clickHandler} text={ActionButton}></Button>}
    </div>
}
