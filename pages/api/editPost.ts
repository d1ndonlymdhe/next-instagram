import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../utils/db";
import Post from "../../utils/Post";
import { user, post } from "../../utils/type";
import User from "../../utils/User";

export default async function editPost(req: NextApiRequest, res: NextApiResponse) {
    const hash = req.cookies.hash;
    if (hash) {
        const connection = await connect();
        if (connection) {
            const reqUser = await User.findOne({ hash }) as user;
            if (reqUser) {
                const { newCaption, postId } = req.body;
                if (newCaption && postId) {
                    const post = await Post.findById(postId) as post;
                    if (post) {
                        post.caption = newCaption;
                        await post.save()
                        res.status(200).json({ status: "ok" })
                    }
                    else {
                        res.status(200).json({ status: "error" })
                    }
                } else {
                    res.status(200).json({ status: "error" })
                }
            } else {
                res.status(200).json({ status: "error" })
            }
        }
    } else {
        res.status(200).json({ status: "error" })
    }
}