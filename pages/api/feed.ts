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
        // console.log(reqUser);
        if (reqUser) {
            const following = reqUser.followingUsers;

            if (following.length !== 0) {
                const posts: post[][] = []
                for (let i = 0; i < following.length; i++) {
                    let newPosts = await Post.find({ postedBy: following[i] }) as post[];
                    const followingUser = await User.findById(following[i], "username") as user;
                    // console.log(followingUser);
                    const followingUsername = followingUser.username;
                    newPosts = newPosts.map(newPost => {
                        const { _id, caption, likedBy, likes, postedBy, postedOn } = newPost;
                        const tempPost: post = { _id, caption, likedBy, likes, postedBy, postedOn, postedByUsername: followingUsername, save: () => { } }
                        return tempPost;
                    })
                    posts.push(newPosts);
                    if (i == following.length - 1) {
                        flatPost = posts.flat();
                        // console.log({ status: "ok", posts: flatPost })
                        res.status(200).json({ status: "ok", posts: flatPost });
                    }
                }
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
