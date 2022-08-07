import { NextApiRequest, NextApiResponse } from "next";
import { connect, findUser } from "../../utils/db";
import User from "../../utils/User";
export default async function userinfo(req: NextApiRequest, res: NextApiResponse) {
    const { hash, username } = (req.method === "POST") ? req.body : req.query;
    let findBy = {};
    if (username) {
        findBy = { username }
    } else {
        findBy = { hash }
    }
    const connection = await connect()
    const user = await User.findOne(findBy, "username followingCount followersCount firstLogin bio posts").populate("followerUsers", "username").populate("followingUsers", "username").populate("friendUsers", "username");
    if (user !== null && user !== undefined) {
        res.status(200).json({
            status: "ok",
            message: user
        })
    } else {
        res.status(200).json({ status: "error", message: { text: "No such user" } });
    }
}