import { NextApiRequest, NextApiResponse } from "next";
import { findUser } from "../../utils/db";
export default async function userinfo(req: NextApiRequest, res: NextApiResponse) {
    const { hash, username } = (req.method === "POST") ? req.body : req.query;
    const user = (username !== undefined) ? (await findUser(username)) : (await findUser(undefined, hash));
    if (user !== null && user !== undefined) {
        res.status(200).json({
            status: "ok",
            message: {
                username: user.username,
                followingCount: user.followingCount,
                followersCount: user.followersCount,
                bio: user.bio,
                firstLogin: user.firstLogin
            }

        })
    } else {
        res.status(200).json({ status: "error", message: { text: "No such user" } });
    }
}