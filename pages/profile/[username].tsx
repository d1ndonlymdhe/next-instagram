import { useRouter } from "next/router";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import img from "next/image";
type ProfileProps = {
    username: string;
    following: string;
    followers: string;
    bio: string;
    profilePic: string;
}
export default function Profile(props: ProfileProps) {
    const router = useRouter();
    const { username } = router.query;
    return <>
        <div className="h-full w-full">
            username: {username}
            <br />
            following: {props.following}
            <br />
            followers: {props.followers}
            <br />
            bio: {props.bio}
            <br />
            Profile-Picture:<img src={props.profilePic} className="relative h-[100px] w-[100px]"></img>
        </div>
    </>
}

export async function getServerSideProps(context: { req: NextApiRequest, res: NextApiResponse, params: { username: string } }) {
    const { req, res, params } = context;
    const { username } = params;
    const infores = await axios.post(`http://localhost:3000/api/userinfo`, { username });
    console.log(infores.data);
    const ppUrl = `http://localhost:3000/api/getProfilePic?username=${username}`;
    return {
        props: {
            username: username,
            following: infores.data.message.following,
            followers: infores.data.message.followersCount,
            bio: infores.data.message.bio,
            profilePic: ppUrl,
        }
    }
}