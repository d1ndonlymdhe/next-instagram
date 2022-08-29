import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../utils/db";
import Post from "../../utils/Post";
import { post, user } from "../../utils/type";
import User from "../../utils/User";
import fs from "fs";
export default async function deletePost(req: NextApiRequest, res: NextApiResponse) {
    const hash = req.cookies.hash;
    const { postId }: { postId: string } = req.body
    if (hash && postId) {
        const connection = await connect()
        const reqUser = await User.findOne({ hash }) as user;
        if (reqUser) {
            if (reqUser.posts.includes(postId)) {
                const deletedPost = await Post.findByIdAndDelete(postId) as post;
                fs.unlink(`./files/${reqUser._id}/posts/${postId}/image.jpg`, (err) => {
                    console.log(err)
                    if (!err) {
                        fs.rmdir(`./files/${reqUser._id}/posts/${postId}`, (err) => { console.log(err) })
                    }
                })
                reqUser.posts = reqUser.posts.filter(post => {
                    console.log(post, " ", postId, " ", post === postId)
                    return post !== deletedPost._id;
                })
                reqUser.save();
                res.status(200).json({ status: "ok" })
            }
        } else {
            res.status(200).json({ status: "error" })
        }
    } else {
        res.status(200).json({ status: "error" })
    }
}