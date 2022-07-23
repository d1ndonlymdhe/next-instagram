import { NextApiRequest, NextApiResponse } from "next";
// import { handleClientScriptLoad } from "next/script";
import Post from "../../utils/Post";
import { post } from "../../utils/type";
import { user } from "../../utils/type";
import User from "../../utils/User";
import { connect } from "../../utils/db"
export default async function getPosts(req: NextApiRequest, res: NextApiResponse) {
    const hash: string = <string>req.query.hash!;
    let flatPost: post[] = []
    const connection = await connect();
    if (hash) {
        const reqUser = await User.findOne({ hash: hash }, "followingUsers") as user;
        if (reqUser) {
            const following = reqUser.followingUsers;
            if (following.length > 0) {
                const postByFollowing = await User.find({ _id: { $in: following } }, "username posts") as user[];
                for (let i = 0; i < postByFollowing.length; i++) {
                    let posts = await Post.aggregate([{ $match: { _id: { $in: postByFollowing[i].posts } } }])
                    posts = posts.map(post => {
                        post.postedByUsername = postByFollowing[0].username;
                        return post;
                    })
                    flatPost.push(...posts);
                }
                console.log("flatPost", flatPost);
                res.status(200).json({ status: "ok", posts: flatPost });
            } else {
                res.status(200).json({ status: "error", message: "Not Following AnyOne" })
            }
        } else {
            res.status(200).json({ status: "error", message: "User not found" });
            return;
        }
    } else {
        res.status(200).json({ status: "error", message: "Invalid Request" });
    }
    // console.log("ok");
    // res.status(200).json({ status: "error", posts: flatPost });
}
