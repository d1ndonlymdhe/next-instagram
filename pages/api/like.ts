import { NextApiRequest, NextApiResponse } from "next";
import Post from "../../utils/Post";
import { post } from "../../utils/type";
import User from "../../utils/User";

export default async function like(req: NextApiRequest, res: NextApiResponse) {
    const hash = req.cookies.hash;
    if (hash) {
        const { postId } = <{ postId: string }>req.body!;
        if (postId) {
            const user = await User.findOne({ hash });
            if (user) {
                const selectedPost = await Post.findById(postId) as post;
                if (selectedPost) {
                    if (selectedPost.likedBy.includes(user._id)) {
                        selectedPost.likedBy.splice(selectedPost.likedBy.indexOf(user._id), 1);
                        selectedPost.likes = selectedPost.likedBy.length;
                        await selectedPost.save();
                        res.status(200).json({ status: "ok", message: { liked: false } });
                    } else {
                        console.log("liked")
                        selectedPost.likedBy.push(user._id);
                        selectedPost.likes = selectedPost.likedBy.length;
                        await selectedPost.save();
                        res.status(200).json({ status: "ok", message: { liked: true } });
                    }
                } else {
                    res.status(200).json({ status: "error", message: "Post not found" });
                }
            } else {
                res.status(200).json({ status: "error", message: "User not found" });
            }
        } else {
            res.status(200).json({ status: "error", message: "Post not found" });
        }
    } else {
        res.status(200).json({ status: "error", message: "User not found" });
    }
}